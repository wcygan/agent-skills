#!/usr/bin/env python3
"""Durable orchestration bookkeeping. See ../references/LICENSE.txt."""

import sys

sys.dont_write_bytecode = True
import os
from collections import Counter
from mode_tools.common import Parser, ToolError, Missing, emit, positive, run
from mode_tools.store import Store, VERDICTS
from mode_tools.github import GitHub


def parser():
    p = Parser(description=__doc__)
    p.add_argument("--store", default=os.environ.get("ORCH_STORE"))
    p.add_argument("--json", action="store_true")
    p.add_argument(
        "--force",
        action="store_true",
        help="compatibility flag; never steals a live lock",
    )
    groups = p.add_subparsers(dest="group", required=True)
    groups.add_parser("init")
    groups.add_parser("status")
    unit = groups.add_parser("unit").add_subparsers(dest="action", required=True)
    a = unit.add_parser("add")
    a.add_argument("id")
    a.add_argument("--track", required=True)
    a.add_argument("--brief", default="")
    a = unit.add_parser("set")
    a.add_argument("id")
    a.add_argument("--state", required=True)
    for key in ("branch", "sha"):
        a.add_argument("--" + key)
    a.add_argument("--pr", type=positive)
    a = unit.add_parser("get")
    a.add_argument("id")
    a = unit.add_parser("list")
    a.add_argument("--state")
    a.add_argument("--track")
    unit.add_parser("counts")
    ledger = groups.add_parser("ledger").add_subparsers(dest="action", required=True)
    for name in ("record", "check"):
        a = ledger.add_parser(name)
        a.add_argument("pr", type=positive)
        a.add_argument("sha")
        if name == "record":
            a.add_argument("verdict", choices=VERDICTS)
            a.add_argument("--evidence", required=True)
            a.add_argument("--verifier", default="")
    ledger.add_parser("summary")
    inbox = groups.add_parser("inbox").add_subparsers(dest="action", required=True)
    a = inbox.add_parser("push")
    for key in ("agent", "unit", "status"):
        a.add_argument(key)
    a.add_argument("--report", default="")
    a = inbox.add_parser("drain")
    a.add_argument("--peek", action="store_true")
    inbox.add_parser("count")
    gate = groups.add_parser("gate").add_subparsers(dest="action", required=True)
    a = gate.add_parser("park")
    a.add_argument("id")
    for key in ("question", "options", "default"):
        a.add_argument("--" + key, required=True)
    a = gate.add_parser("resolve")
    a.add_argument("id")
    a.add_argument("--answer", required=True)
    gate.add_parser("list")
    frontier = groups.add_parser("frontier").add_subparsers(
        dest="action", required=True
    )
    a = frontier.add_parser("set")
    a.add_argument("--repo", default=os.environ.get("ORCH_REPO", "."))
    a.add_argument("--forge", choices=["gh"], default="gh")
    a.add_argument("--prs")
    frontier.add_parser("show")
    standing = groups.add_parser("standing").add_subparsers(
        dest="action", required=True
    )
    a = standing.add_parser("add")
    a.add_argument("line")
    standing.add_parser("show")
    return p


def execute(s, a):
    if a.group == "init":
        return s.init()
    if a.group == "status":
        return s.status()
    action = a.action
    if a.group == "unit":
        if action == "add":
            return s.unit_add(a.id, a.track, a.brief)
        if action == "set":
            return s.unit_set(a.id, state=a.state, branch=a.branch, pr=a.pr, sha=a.sha)
        if action == "get":
            return s.unit_get(a.id)
        if action == "list":
            return s.units(state=a.state, track=a.track)
        return dict(Counter(r["state"] for r in s.units()))
    if a.group == "ledger":
        if action == "record":
            return s.record(a.pr, a.sha, a.verdict, a.evidence, a.verifier)
        if action == "check":
            return s.check(a.pr, a.sha)
        return dict(Counter(r["verdict"] for r in s.ledger()))
    if a.group == "inbox":
        if action == "push":
            return s.push(a.agent, a.unit, a.status, a.report)
        if action == "drain":
            return s.drain(a.peek)
        return {"count": len(s.records("inbox"))}
    if a.group == "gate":
        if action == "park":
            return s.park(a.id, a.question, a.options, a.default)
        if action == "resolve":
            return s.resolve(a.id, a.answer)
        return [r for r in s.records("gates") if r["kind"] == "open"]
    if a.group == "standing":
        return s.standing_add(a.line) if action == "add" else s.records("standing")
    if action == "show":
        return s.frontier()
    gh = GitHub(cwd=a.repo)
    branch = run(["git", "symbolic-ref", "--short", "HEAD"], cwd=a.repo).strip()
    all_prs = gh.pulls("all")
    repository = gh.command(
        ["repo", "view", "--repo", gh.repo, "--json", "defaultBranchRef"]
    )
    default = (
        (repository.get("defaultBranchRef") or {}).get("name")
        if isinstance(repository, dict)
        else None
    )
    if not isinstance(default, str) or not default:
        raise ToolError("missing repository default branch")
    candidates = [r for r in all_prs if r["headRefName"] == branch]
    if len(candidates) != 1:
        raise ToolError(f"expected one PR for current branch {branch}")
    # Follow parents only: the frontier is the chain ending at the current branch.
    rows = []
    seen = set()
    candidate = candidates[0]
    while candidate:
        number = candidate["number"]
        if number in seen:
            raise ToolError("cyclic PR chain")
        seen.add(number)
        fact = gh.facts(number)
        rows.insert(
            0,
            dict(
                pr=number,
                branches=f"{fact['baseRefName']} -> {fact['headRefName']}",
                sha=fact["headRefOid"],
                state=fact["state"],
            ),
        )
        if fact["baseRefName"] == default:
            break
        parents = [r for r in all_prs if r["headRefName"] == fact["baseRefName"]]
        if not parents:
            raise ToolError(f"missing parent PR for branch {fact['baseRefName']}")
        if len(parents) > 1:
            raise ToolError("ambiguous PR parent")
        candidate = parents[0] if parents else None
    expected = None
    if a.prs:
        try:
            expected = [int(n) for n in a.prs.split(",")]
        except ValueError:
            raise ToolError("invalid PR order pin") from None
    return s.set_frontier(rows, expected)


def main(argv=None):
    p = parser()
    a = p.parse_args(argv)
    if not a.store:
        p.error("--store or ORCH_STORE is required")
    try:
        with Store(a.store) as s:
            result = execute(s, a)
        emit(result, pretty=not a.json)
        return 0
    except Missing as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    except (ToolError, OSError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
