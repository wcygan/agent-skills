"""Read-only GitHub integration using authenticated gh. See ../../references/LICENSE.txt."""

from .common import ToolError, decode, run


class QueryError(ToolError):
    pass


def enum(value, choices, label):
    if value not in choices:
        raise QueryError(f"unknown {label}: {value!r}")
    return value


def connection(value):
    if not isinstance(value, dict) or not isinstance(value.get("nodes"), list):
        raise QueryError("missing connection nodes")
    page = value.get("pageInfo")
    if not isinstance(page, dict) or type(page.get("hasNextPage")) is not bool:
        raise QueryError("missing pageInfo")
    if page["hasNextPage"] and not isinstance(page.get("endCursor"), str):
        raise QueryError("missing next-page cursor")
    return value["nodes"], page


class GitHub:
    def __init__(self, repository=None, cwd=None, runner=run, config=None):
        self.cwd, self.runner = cwd, runner
        self.config = config or {}
        self.repo = repository or self.command(
            ["repo", "view", "--json", "nameWithOwner"]
        ).get("nameWithOwner")
        if (
            not isinstance(self.repo, str)
            or len(self.repo.split("/")) != 2
            or any(not p for p in self.repo.split("/"))
        ):
            raise QueryError("expected owner/repository")
        self.owner, self.name = self.repo.split("/")

    def command(self, args, allowed=(0,)):
        try:
            return decode(self.runner(["gh", *args], cwd=self.cwd, allowed=allowed))
        except (ToolError, ValueError, TypeError) as exc:
            raise QueryError(str(exc)) from exc

    def graphql(self, query, **variables):
        args = [
            "api",
            "graphql",
            "-f",
            f"query={query}",
            "-f",
            f"owner={self.owner}",
            "-f",
            f"name={self.name}",
        ]
        for key, value in variables.items():
            if value is not None:
                args.extend(
                    ["-F" if isinstance(value, int) else "-f", f"{key}={value}"]
                )
        value = self.command(args)
        if (
            not isinstance(value, dict)
            or value.get("errors")
            or not isinstance(value.get("data"), dict)
        ):
            raise QueryError("GraphQL returned errors or missing data")
        try:
            repo = value["data"]["repository"]
            if not isinstance(repo, dict):
                raise KeyError()
            return repo
        except KeyError as exc:
            raise QueryError("missing repository data") from exc

    def pages(self, field, selection, number):
        cursor, seen = None, set()
        query = """query($owner:String!,$name:String!,$number:Int!,$cursor:String){
          repository(owner:$owner,name:$name){pullRequest(number:$number){FIELD(first:100,after:$cursor){
          nodes{SELECTION} pageInfo{hasNextPage endCursor}}}}}""".replace(
            "FIELD", field
        ).replace("SELECTION", selection)
        while True:
            try:
                value = self.graphql(query, number=number, cursor=cursor)[
                    "pullRequest"
                ][field]
            except (KeyError, TypeError) as exc:
                raise QueryError(f"missing {field}") from exc
            nodes, page = connection(value)
            yield from nodes
            if not page["hasNextPage"]:
                break
            cursor = page["endCursor"]
            if cursor in seen:
                raise QueryError("pagination cursor did not advance")
            seen.add(cursor)

    def current(self):
        value = self.command(["pr", "view", "--repo", self.repo, "--json", "number"])
        number = value.get("number") if isinstance(value, dict) else None
        if type(number) is not int or number < 1:
            raise QueryError("missing current PR number")
        return number

    def facts(self, number):
        fields = "number,mergeable,mergeStateStatus,reviewDecision,headRefOid,headRefName,baseRefName,state,mergedAt,isDraft"
        r = self.command(
            ["pr", "view", str(number), "--repo", self.repo, "--json", fields]
        )
        if not isinstance(r, dict) or any(k not in r for k in fields.split(",")):
            raise QueryError("missing PR fields")
        enum(r["state"], ("OPEN", "CLOSED", "MERGED"), "PR state")
        enum(r["mergeable"], ("MERGEABLE", "CONFLICTING", "UNKNOWN"), "mergeability")
        enum(
            r["mergeStateStatus"],
            (
                "BEHIND",
                "BLOCKED",
                "CLEAN",
                "CONFLICTING",
                "DIRTY",
                "DRAFT",
                "HAS_HOOKS",
                "UNKNOWN",
                "UNSTABLE",
            ),
            "merge state",
        )
        r["reviewDecision"] = r["reviewDecision"] or None
        enum(
            r["reviewDecision"],
            ("APPROVED", "CHANGES_REQUESTED", "REVIEW_REQUIRED", None),
            "review decision",
        )
        if type(r["isDraft"]) is not bool or r["number"] != number:
            raise QueryError("invalid PR identity or draft")
        if any(
            not isinstance(r[k], str) or not r[k]
            for k in ("headRefOid", "headRefName", "baseRefName")
        ):
            raise QueryError("missing PR revision or branch")
        return r

    def threads(self, number):
        rows = list(
            self.pages(
                "reviewThreads",
                "id isResolved comments(first:1){nodes{author{login} body path line createdAt}}",
                number,
            )
        )
        result = []
        bots = set(self.config.get("review_bots", []))
        passes = {}
        if bots:
            for r in self.pages("reviews", "author{login} submittedAt", number):
                author = (r.get("author") or {}).get("login")
                if author in bots and r.get("submittedAt"):
                    passes[author] = passes.get(author, 0) + 1
        for r in rows:
            if (
                not isinstance(r, dict)
                or type(r.get("isResolved")) is not bool
                or not isinstance(r.get("id"), str)
            ):
                raise QueryError("invalid review thread")
            if r["isResolved"]:
                continue
            try:
                comments = r["comments"]["nodes"]
            except (KeyError, TypeError) as exc:
                raise QueryError("missing review comments") from exc
            if not isinstance(comments, list):
                raise QueryError("invalid review comments")
            first = comments[0] if comments else None
            author = ((first or {}).get("author") or {}).get("login")
            result.append(
                {
                    "id": r["id"],
                    "firstComment": first,
                    "isAutomation": author in bots,
                    "automationReviewPasses": passes.get(author, 0),
                }
            )
        return result

    def rollups(self, number):
        result = []
        for node in self.pages(
            "commits", "commit{oid statusCheckRollup{state}}", number
        ):
            try:
                c = node["commit"]
                state = (c.get("statusCheckRollup") or {}).get("state")
                enum(
                    state,
                    ("SUCCESS", "FAILURE", "ERROR", "PENDING", "EXPECTED", None),
                    "rollup state",
                )
                if not isinstance(c["oid"], str):
                    raise KeyError()
                result.append({"oid": c["oid"], "state": state})
            except (KeyError, TypeError) as exc:
                raise QueryError("invalid commit rollup") from exc
        return result

    def checks(self, number, revision):
        gates = set(self.config.get("review_gate_checks", []))
        try:
            raw = self.command(
                [
                    "pr",
                    "checks",
                    str(number),
                    "--repo",
                    self.repo,
                    "--json",
                    "name,state,bucket,description,link,workflow",
                ],
                allowed=(0, 1, 8),
            )
            if not isinstance(raw, list) or not raw:
                raise QueryError("empty fast checks")
            rows = []
            for r in raw:
                if not isinstance(r, dict) or not isinstance(r.get("name"), str):
                    raise QueryError("invalid check")
                bucket = enum(
                    r.get("bucket"),
                    ("pass", "fail", "pending", "skipping", "cancel"),
                    "check bucket",
                )
                kind = {
                    "pass": "passed",
                    "fail": "failed",
                    "pending": "pending",
                    "skipping": "skipped",
                    "cancel": "failed",
                }[bucket]
                rows.append({**r, "kind": kind, "reviewGate": r["name"] in gates})
            return "gh-pr-checks", rows
        except QueryError:
            pass
        query = """query($owner:String!,$name:String!,$oid:String!,$cursor:String){repository(owner:$owner,name:$name){
        object(expression:$oid){... on Commit{statusCheckRollup{contexts(first:100,after:$cursor){
        nodes{__typename ... on CheckRun{name status conclusion detailsUrl} ... on StatusContext{context state targetUrl}}
        pageInfo{hasNextPage endCursor}}}}}}}"""
        cursor, seen, rows = None, set(), []
        while True:
            try:
                conn = self.graphql(query, oid=revision, cursor=cursor)["object"][
                    "statusCheckRollup"
                ]["contexts"]
            except (KeyError, TypeError) as exc:
                raise QueryError("checks unavailable") from exc
            nodes, page = connection(conn)
            for r in nodes:
                typename = r.get("__typename") if isinstance(r, dict) else None
                if typename == "CheckRun":
                    status = enum(
                        r.get("status"),
                        (
                            "QUEUED",
                            "IN_PROGRESS",
                            "COMPLETED",
                            "WAITING",
                            "PENDING",
                            "REQUESTED",
                        ),
                        "check status",
                    )
                    name = r.get("name")
                    if status != "COMPLETED":
                        kind = "pending"
                    else:
                        conclusion = enum(
                            r.get("conclusion"),
                            (
                                "SUCCESS",
                                "NEUTRAL",
                                "SKIPPED",
                                "FAILURE",
                                "CANCELLED",
                                "TIMED_OUT",
                                "ACTION_REQUIRED",
                                "STARTUP_FAILURE",
                                "STALE",
                            ),
                            "check conclusion",
                        )
                        kind = (
                            "passed"
                            if conclusion == "SUCCESS"
                            else "skipped"
                            if conclusion in ("NEUTRAL", "SKIPPED")
                            else "failed"
                        )
                elif typename == "StatusContext":
                    state = enum(
                        r.get("state"),
                        ("SUCCESS", "PENDING", "EXPECTED", "ERROR", "FAILURE"),
                        "status context",
                    )
                    name = r.get("context")
                    kind = (
                        "passed"
                        if state == "SUCCESS"
                        else "pending"
                        if state in ("PENDING", "EXPECTED")
                        else "failed"
                    )
                else:
                    raise QueryError(f"unknown check type: {typename}")
                if not isinstance(name, str):
                    raise QueryError("missing check name")
                rows.append(
                    {**r, "name": name, "kind": kind, "reviewGate": name in gates}
                )
            if not page["hasNextPage"]:
                break
            cursor = page["endCursor"]
            if cursor in seen:
                raise QueryError("repeated checks cursor")
            seen.add(cursor)
        if not rows:
            raise QueryError("checks unavailable in both query paths")
        return "graphql-rollup", rows

    def pulls(self, state="open"):
        pages = self.command(
            [
                "api",
                f"repos/{self.repo}/pulls?state={state}&per_page=100",
                "--paginate",
                "--slurp",
            ]
        )
        if not isinstance(pages, list) or any(not isinstance(p, list) for p in pages):
            raise QueryError("invalid PR pages")
        rows = []
        for page in pages:
            for r in page:
                try:
                    if type(r["number"]) is not int:
                        raise KeyError()
                    rows.append(
                        {
                            "number": r["number"],
                            "headRefName": r["head"]["ref"],
                            "baseRefName": r["base"]["ref"],
                            "state": "MERGED"
                            if r.get("merged_at")
                            else "CLOSED"
                            if r["state"] == "closed"
                            else "OPEN",
                        }
                    )
                except (KeyError, TypeError) as exc:
                    raise QueryError("invalid PR list row") from exc
        return rows

    def stack(self, number):
        seed = self.facts(number)
        rows = self.pulls()
        if not any(r["number"] == number for r in rows):
            rows.append(seed)
        by_head = {}
        for r in rows:
            by_head.setdefault(r["headRefName"], []).append(r)
        chain = [seed]
        seen = {number}
        while chain[0]["baseRefName"] in by_head:
            parents = by_head[chain[0]["baseRefName"]]
            if len(parents) != 1:
                raise QueryError("ambiguous stack parent")
            parent = parents[0]
            if parent["number"] in seen:
                raise QueryError("cyclic PR stack")
            seen.add(parent["number"])
            chain.insert(0, parent)
        while True:
            children = [r for r in rows if r["baseRefName"] == chain[-1]["headRefName"]]
            if not children:
                break
            if len(children) != 1:
                raise QueryError("branching stack; supply an explicit queue")
            child = children[0]
            if child["number"] in seen:
                raise QueryError("cyclic PR stack")
            seen.add(child["number"])
            chain.append(child)
        return [r["number"] for r in chain]
