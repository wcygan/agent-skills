#!/usr/bin/env python3
"""Check that a Mermaid flowchart colors every part by kind and uses shapes that mean something.

Usage: python3 -B check_style.py FILE.mmd [FILE.mmd ...]

Exit 0 when every file passes, 1 with one line per problem otherwise. Each line
names the fix. Other diagram kinds pass unchecked, because Mermaid gives them no
per-part classes.
"""
import re
import sys
from pathlib import Path

LABEL = {"[": r'(?:"[^"]*"|[^\]])*', "(": r'(?:"[^"]*"|[^)])*', "{": r'(?:"[^"]*"|[^}])*'}
SHAPES = [  # opener, closer, name; longest openers first
    ("[(", ")]", "cylinder"), ("([", "])", "stadium"), ("[[", "]]", "subroutine"),
    ("((", "))", "circle"), ("{{", "}}", "hexagon"),
    ("[", "]", "rectangle"), ("(", ")", "rounded"), ("{", "}", "diamond"),
]
NODE = re.compile("|".join(
    rf"(?P<id{i}>[A-Za-z_]\w*)\s*{re.escape(o)}(?P<label{i}>{LABEL[o[-1] if o[-1] in LABEL else o[0]]}){re.escape(c)}"
    for i, (o, c, _) in enumerate(SHAPES)))
DIRECTIVE = re.compile(r"^\s*(classDef|class|style|linkStyle|click|subgraph|end|direction)\b")
ARROW = re.compile(r"(?:(?<=\s)[ox<]|<)?[-=.~]{2,}(?:>|[ox](?=\s|$))?")
REQUIRED = ("fill", "stroke", "color")


def problems(text: str) -> list[str]:
    lines = [line.split("%%")[0] for line in text.splitlines()]
    lines = [line for line in lines if line.strip()]
    if not lines or not re.match(r"\s*(flowchart|graph)\b", lines[0]):
        return []
    shape, label, assigned, defined = {}, {}, {}, {}
    for line in lines[1:]:
        if match := re.match(r"\s*classDef\s+([\w,]+)\s+(.*)", line):
            properties = {part.split(":")[0].strip() for part in match.group(2).split(",")}
            for name in match.group(1).split(","):
                defined[name] = properties
            continue
        if match := re.match(r"\s*class\s+([\w,\s]+?)\s+(\w+)\s*;?\s*$", line):
            for node in match.group(1).split(","):
                assigned[node.strip()] = match.group(2)
            continue
        if DIRECTIVE.match(line):
            continue
        line = re.sub(r"\|[^|]*\|", " ", line)

        def note(match: re.Match) -> str:
            index = next(i for i in range(len(SHAPES)) if match.group(f"id{i}"))
            node = match.group(f"id{index}")
            shape[node], label[node] = SHAPES[index][2], match.group(f"label{index}").strip('" ')
            return f" {node} "

        line = NODE.sub(note, line)
        for node, name in re.findall(r"([A-Za-z_]\w*):::(\w+)", line):
            assigned[node] = name
        line = re.sub(r":::\w+", " ", line)
        line = re.sub(r'"[^"]*"', " ", line)
        for node in re.findall(r"[A-Za-z_]\w*", ARROW.sub(" ", line)):
            shape.setdefault(node, "rectangle")
    found = []
    for node in shape:
        if node not in assigned:
            found.append(f"{node} has no color: add it to a `class {node} <kind>` line")
        elif assigned[node] not in defined:
            found.append(f"{node} uses class {assigned[node]}, which no classDef line defines")
        if label.get(node, "").endswith("?") and shape[node] != "diamond":
            found.append(f"{node} asks a question: draw it as a diamond, {node}{{...?}}")
        if shape[node] == "diamond" and not label.get(node, "").endswith("?"):
            found.append(f"{node} is a diamond: word its label as the question it decides")
    for name in sorted(set(assigned.values()) & set(defined)):
        missing = [p for p in REQUIRED if p not in defined[name]]
        if missing:
            found.append(f"classDef {name} lacks {', '.join(missing)}: set fill, stroke and "
                         "color so the text stays readable on light and dark pages")
    if len(shape) >= 4 and len(set(assigned.values())) < 2:
        found.append("every part has the same color: color the parts by kind, "
                     "or draw fewer parts")
    return found


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    failed = False
    for name in sys.argv[1:]:
        for problem in problems(Path(name).read_text()):
            failed = True
            print(f"{name}: {problem}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
