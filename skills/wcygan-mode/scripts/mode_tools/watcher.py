"""PR observation and queue policy. See ../../references/LICENSE.txt."""

import json
import time
from .common import now as utc_now
from .github import QueryError


class Clock:
    now = staticmethod(time.monotonic)
    sleep = staticmethod(time.sleep)
    observed_at = staticmethod(utc_now)


def snapshot(reader, number, include_history=False):
    facts = reader.facts(number)
    context = {"owner": reader.owner, "repo": reader.name, "number": number}
    row = {"context": context, "facts": facts, "kind": facts["state"].lower()}
    if facts["state"] in ("MERGED", "CLOSED"):
        return row
    threads = reader.threads(number)
    source, checks = reader.checks(number, facts["headRefOid"])
    failed = [c for c in checks if c["kind"] == "failed"]
    pending = [c for c in checks if c["kind"] == "pending"]
    rollups = reader.rollups(number) if failed or not pending or include_history else []
    head = next((c["state"] for c in rollups if c["oid"] == facts["headRefOid"]), None)
    refused = facts["mergeStateStatus"] == "BLOCKED" and head in ("ERROR", "FAILURE")
    ci = {
        "source": source,
        "all": checks,
        "failed": failed,
        "pending": pending,
        "hadPreviousPassingCi": any(
            c["oid"] != facts["headRefOid"] and c["state"] == "SUCCESS" for c in rollups
        ),
        "kind": "ci-failing"
        if failed
        else "ci-github-rejected"
        if refused
        else "ci-pending"
        if pending
        else "ci-clean",
        "github": {
            "kind": "refused" if refused else "allowed",
            "mergeStateStatus": facts["mergeStateStatus"],
            "headRollupState": head,
        },
    }
    tokens = reader.config.get("automation_check_tokens", [])
    row.update(
        threads=threads,
        ci=ci,
        reviewAutomationRunning=any(
            c["kind"] == "pending"
            and any(t.casefold() in c["name"].casefold() for t in tokens)
            for c in checks
        ),
    )
    return row


def decision(rows, allow_draft=False):
    # Tier-major order: any conflict precedes any thread, then CI, then gates.
    for code, kind in [
        (2, "merge-conflicts"),
        (3, "review-threads"),
        (4, "failing-checks"),
        (6, "merge-gate"),
    ]:
        for r in rows:
            f = r["facts"]
            reason = None
            extra = {}
            if r["kind"] == "merged":
                continue
            if code == 6 and r["kind"] == "closed":
                reason = "closed-without-merge"
            if r["kind"] == "open":
                if code == 2 and (
                    f["mergeable"] == "CONFLICTING"
                    or f["mergeStateStatus"] in ("DIRTY", "CONFLICTING")
                ):
                    reason = kind
                    extra = {"facts": f}
                if code == 3 and r["threads"]:
                    reason = kind
                    extra = {"threads": r["threads"]}
                if code == 4 and r["ci"]["kind"] in (
                    "ci-failing",
                    "ci-github-rejected",
                ):
                    reason = kind
                    extra = {"ci": r["ci"]}
                if code == 6:
                    if f["reviewDecision"] == "CHANGES_REQUESTED":
                        reason = "changes-requested"
                    elif f["reviewDecision"] == "REVIEW_REQUIRED":
                        reason = "review-required"
                    elif (
                        f["isDraft"]
                        and not allow_draft
                        and r["ci"]["kind"] != "ci-pending"
                    ):
                        reason = "draft-pr"
            if reason:
                return {
                    "kind": "BLOCKER",
                    "exitCode": code,
                    "blocker": {
                        "kind": kind,
                        "pr": r["context"],
                        "reason": reason,
                        **extra,
                    },
                }
    for r in rows:
        if r["kind"] != "open":
            continue
        f = r["facts"]
        if r["ci"]["kind"] == "ci-pending":
            return {
                "kind": "WAITING",
                "frontier": r["context"],
                "reason": {"kind": "pending-checks", "pending": r["ci"]["pending"]},
            }
        if f["mergeable"] == "UNKNOWN" or f["mergeStateStatus"] in (
            "UNKNOWN",
            "BLOCKED",
            "BEHIND",
            "HAS_HOOKS",
            "UNSTABLE",
        ):
            return {
                "kind": "WAITING",
                "frontier": r["context"],
                "reason": {"kind": "merge-state", "state": f["mergeStateStatus"]},
            }
    return {
        "kind": "READY",
        "exitCode": 0,
        "scope": {"kind": "single" if len(rows) == 1 else "stack", "prs": rows},
    }


def backoff(interval, failures):
    return min(max(interval, 60) * 2 ** min(failures - 1, 10), 300)


def watch(reader, numbers, options, emit, clock=None):
    clock = clock or Clock()
    mode = options.mode
    sequence = 0
    last_wait = None
    start = clock.now()
    failures = 0
    index = 0
    sweep_index = 0
    sweep_rows = []
    next_sweep = start

    def event(payload, terminal=False):
        nonlocal sequence
        sequence += 1
        value = {
            "schemaVersion": 1,
            "sequence": sequence,
            "observedAt": clock.observed_at(),
            "mode": mode,
            "terminal": terminal,
            **payload,
        }
        emit(value)
        return value

    def deadline():
        return options.timeout > 0 and clock.now() - start >= options.timeout

    def sleep(delay):
        if options.timeout:
            delay = min(delay, max(0, options.timeout - (clock.now() - start)))
        clock.sleep(delay)

    if mode == "queued-stack" and not options.status_only:
        event(
            {
                "kind": "QUEUE",
                "queue": [
                    {"owner": reader.owner, "repo": reader.name, "number": n}
                    for n in numbers
                ],
            }
        )
    while True:
        if deadline():
            return event(
                {
                    "kind": "TIMEOUT",
                    "exitCode": 5,
                    "reason": {
                        "kind": "deadline",
                        "frontier": numbers[index] if index < len(numbers) else None,
                    },
                },
                True,
            )
        try:
            if options.status_only or mode != "queued-stack":
                rows = [snapshot(reader, n, options.status_only) for n in numbers]
                if options.status_only:
                    return event(
                        {
                            "kind": "STATUS",
                            "exitCode": 0,
                            "reason": "status-only",
                            "rows": rows,
                        },
                        True,
                    )
                result = decision(rows, options.allow_draft)
                if result["kind"] in ("BLOCKER", "READY"):
                    return event(result, True)
            else:
                if clock.now() >= next_sweep:
                    while sweep_index < len(numbers):
                        # Advance only after a successful snapshot; retry this PR on failure.
                        sweep_rows.append(snapshot(reader, numbers[sweep_index]))
                        sweep_index += 1
                    event(
                        {
                            "kind": "STATUS",
                            "reason": "whole-stack-sweep",
                            "rows": sweep_rows,
                        }
                    )
                    result = decision(sweep_rows, options.allow_draft)
                    if result["kind"] == "BLOCKER":
                        return event(result, True)
                    sweep_rows = []
                    sweep_index = 0
                    next_sweep = clock.now() + options.sweep_interval
                row = snapshot(reader, numbers[index])
                if row["kind"] == "merged":
                    index += 1
                    if index == len(numbers):
                        return event(
                            {
                                "kind": "COMPLETE",
                                "exitCode": 0,
                                "queue": numbers,
                                "merged": numbers,
                            },
                            True,
                        )
                    event(
                        {
                            "kind": "ADVANCE",
                            "merged": row["context"],
                            "frontier": {
                                "owner": reader.owner,
                                "repo": reader.name,
                                "number": numbers[index],
                            },
                            "remaining": len(numbers) - index,
                        }
                    )
                    failures = 0
                    last_wait = None
                    continue
                result = decision([row], options.allow_draft)
                if result["kind"] == "BLOCKER":
                    return event(result, True)
                if result["kind"] == "READY":
                    result = {
                        "kind": "WAITING",
                        "frontier": row["context"],
                        "reason": {
                            "kind": "merge-queue",
                            "unmergedCount": len(numbers) - index,
                        },
                    }
            failures = 0
            signature = json.dumps(result, sort_keys=True)
            if signature != last_wait:
                event(result)
                last_wait = signature
            sleep(options.interval)
        except QueryError as exc:
            failures += 1
            failure = {"kind": "status-query", "retryable": True, "detail": str(exc)}
            if options.status_only or failures >= options.max_query_errors:
                return event(
                    {
                        "kind": "BLOCKER",
                        "exitCode": 7,
                        "blocker": {
                            "kind": "status-query",
                            "failures": failures,
                            "failure": failure,
                        },
                    },
                    True,
                )
            delay = backoff(options.interval, failures)
            event(
                {
                    "kind": "RETRY",
                    "failure": failure,
                    "consecutiveFailures": failures,
                    "retryInSeconds": delay,
                }
            )
            sleep(delay)
