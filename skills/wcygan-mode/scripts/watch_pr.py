#!/usr/bin/env python3
"""Observe one PR, a connected stack, or a frozen merge queue. See ../references/LICENSE.txt."""

import sys

sys.dont_write_bytecode = True
from mode_tools.common import Parser, ToolError, emit, positive, seconds, read_json, now
from mode_tools.github import GitHub
from mode_tools.watcher import watch


def parser():
    p = Parser(description=__doc__)
    p.error_code = 64
    p.add_argument("--owner")
    p.add_argument("--repo")
    p.add_argument("--pr", type=positive)
    m = p.add_mutually_exclusive_group()
    m.add_argument("--stack", action="store_true")
    m.add_argument("--queued-stack", action="store_true")
    p.add_argument("--stack-prs")
    p.add_argument("--interval", type=seconds, default=60)
    p.add_argument("--sweep-interval", type=seconds, default=300)
    p.add_argument("--timeout", type=seconds, default=0)
    p.add_argument("--max-query-errors", type=positive, default=5)
    p.add_argument("--status-only", action="store_true")
    p.add_argument("--allow-draft", action="store_true")
    p.add_argument("--pretty", action="store_true")
    p.add_argument(
        "--config",
        help="JSON with optional review_bots, review_gate_checks, automation_check_tokens lists",
    )
    return p


def main(argv=None):
    p = parser()
    a = p.parse_args(argv)
    if a.interval <= 0 or a.sweep_interval <= 0:
        p.error("poll intervals must be positive")
    if a.stack_prs and not a.queued_stack:
        p.error("--stack-prs requires --queued-stack")
    if bool(a.owner) != bool(a.repo):
        p.error("--owner and --repo must be supplied together")
    a.mode = "queued-stack" if a.queued_stack else "stack" if a.stack else "single"
    numbers = []
    if a.stack_prs:
        try:
            numbers = [positive(n.strip()) for n in a.stack_prs.split(",")]
        except Exception:
            p.error("invalid PR queue")
        if len(set(numbers)) != len(numbers):
            p.error("duplicate PR in queue")
    if a.pr and numbers and a.pr != numbers[0]:
        p.error("--pr must match the first queued PR")
    try:
        config = read_json(a.config) if a.config else {}
        if not isinstance(config, dict) or set(config) - {
            "review_bots",
            "review_gate_checks",
            "automation_check_tokens",
        }:
            raise ToolError("invalid watcher configuration")
        if any(
            not isinstance(v, list)
            or any(not isinstance(s, str) or not s.strip() for s in v)
            for v in config.values()
        ):
            raise ToolError("configuration values must be lists of nonempty strings")
        reader = GitHub(f"{a.owner}/{a.repo}" if a.owner else None, config=config)
        seed = a.pr or (numbers[0] if numbers else reader.current())
        numbers = numbers or ([seed] if a.mode == "single" else reader.stack(seed))
        return watch(reader, numbers, a, lambda value: emit(value, a.pretty))[
            "exitCode"
        ]
    except (ToolError, OSError) as exc:
        emit(
            {
                "schemaVersion": 1,
                "sequence": 1,
                "observedAt": now(),
                "mode": a.mode,
                "terminal": True,
                "kind": "BLOCKER",
                "exitCode": 7,
                "blocker": {
                    "kind": "status-query",
                    "failures": 1,
                    "failure": {"detail": str(exc)},
                },
            },
            a.pretty,
        )
        return 7
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
