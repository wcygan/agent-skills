#!/usr/bin/env python3
"""Validate an executable Markdown work plan. See ../references/plan-format.md."""

import sys

sys.dont_write_bytecode = True
import re
from pathlib import Path
from mode_tools.common import Parser, emit


def prose_lines(text):
    fence = None
    for number, line in enumerate(text.splitlines(), 1):
        if fence:
            close = re.fullmatch(
                r" {0,3}(" + re.escape(fence[0]) + r"{" + str(fence[1]) + r",})\s*",
                line,
            )
            if close:
                fence = None
            continue
        opening = re.match(r" {0,3}(`{3,}|~{3,})(.*)", line)
        if opening and not (opening[1][0] == "`" and "`" in opening[2]):
            fence = (opening[1][0], len(opening[1]))
            continue
        yield number, line
    if fence:
        yield len(text.splitlines()) + 1, "UNCLOSED_FENCE"


def validate(text, base=None):
    errors = []
    sections = {}
    units = []
    current = None
    field = None
    for number, line in prose_lines(text):
        if line == "UNCLOSED_FENCE":
            errors.append((number, "unclosed code fence"))
            continue
        heading = re.match(r"^## (.+?)\s*$", line)
        if heading:
            title = heading[1]
            match = re.fullmatch(r"Unit ([A-Za-z0-9][\w.-]*)", title)
            if match:
                current = {"id": match[1], "line": number, "fields": {}}
                units.append(current)
            else:
                if title in sections:
                    errors.append((number, f"duplicate section: {title}"))
                sections[title] = []
                current = title
            field = None
            continue
        if isinstance(current, dict):
            m = re.match(
                r"^(Status|Depends on|Write scope|Acceptance|Verification|Evidence|Performance):\s*(.*)",
                line,
            )
            if m:
                field = m[1]
                if field in current["fields"]:
                    errors.append((number, f"duplicate field: {field}"))
                current["fields"][field] = [m[2]]
            elif field:
                current["fields"][field].append(line)
        elif isinstance(current, str):
            sections[current].append(line)
    for section in ("Goal", "Scope", "Completion"):
        if not "\n".join(sections.get(section, [])).strip():
            errors.append((1, f"missing or empty {section} section"))
    if not units:
        errors.append((1, "at least one unit is required"))
    indexed = {}
    empty = {"", "none", "n/a", "todo", "tbd", "pending", "-"}
    for unit in units:
        id = unit["id"]
        n = unit["line"]
        if id in indexed:
            errors.append((n, f"duplicate unit: {id}"))
        indexed[id] = unit
        fields = {k: " ".join(v).strip() for k, v in unit["fields"].items()}
        unit["fields"] = fields
        for key in (
            "Status",
            "Depends on",
            "Write scope",
            "Acceptance",
            "Verification",
            "Evidence",
        ):
            if not fields.get(key):
                errors.append((n, f"{id}: missing {key}"))
        status = fields.get("Status", "")
        if status not in ("pending", "running", "blocked", "complete"):
            errors.append((n, f"{id}: invalid status"))
        for key in ("Write scope", "Acceptance", "Verification"):
            if fields.get(key, "").lower() in empty:
                errors.append((n, f"{id}: {key} must be concrete"))
        if status == "complete":
            evidence = fields.get("Evidence", "")
            if evidence.lower() in empty or not re.search(
                r"\[[^\]]+\]\([^)]+\)", evidence
            ):
                errors.append((n, f"{id}: completed unit needs an evidence link"))
            for target in re.findall(r"\]\(([^)]+)\)", evidence):
                if (
                    base
                    and not re.match(r"[a-zA-Z]+://", target)
                    and not (Path(base) / target.split("#")[0]).exists()
                ):
                    errors.append((n, f"{id}: evidence does not exist: {target}"))
        dependencies = fields.get("Depends on", "none")
        unit["deps"] = (
            []
            if dependencies == "none"
            else [s.strip() for s in dependencies.split(",")]
        )
    visited = set()
    active = set()

    def visit(id):
        if id in active:
            errors.append((indexed[id]["line"], f"dependency cycle at {id}"))
            return
        if id in visited:
            return
        active.add(id)
        for dep in indexed[id]["deps"]:
            if dep not in indexed:
                errors.append((indexed[id]["line"], f"unknown dependency: {dep}"))
                continue
            if (
                indexed[id]["fields"].get("Status") == "complete"
                and indexed[dep]["fields"].get("Status") != "complete"
            ):
                errors.append(
                    (indexed[id]["line"], f"completed unit depends on incomplete {dep}")
                )
            visit(dep)
        active.remove(id)
        visited.add(id)

    for id in indexed:
        visit(id)
    return [{"line": n, "message": message} for n, message in errors]


def main(argv=None):
    p = Parser(description=__doc__)
    p.add_argument("plan", type=Path)
    p.add_argument("--json", action="store_true")
    a = p.parse_args(argv)
    try:
        errors = validate(a.plan.read_text(), a.plan.parent)
    except OSError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    if a.json:
        emit({"valid": not errors, "errors": errors})
    else:
        for error in errors:
            print(f"{a.plan}:{error['line']}: {error['message']}")
        if not errors:
            print(f"valid plan: {a.plan}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
