#!/usr/bin/env python3
"""Render a code review, written as JSON, into one HTML evidence page.

Usage: python3 -B render_report.py REVIEW.json [--out FILE.html] [--open]
       python3 -B render_report.py - < REVIEW.json

Prints the path of the page. Without --out the page goes to a `review-reports`
folder in the system temporary directory. Exit 1 with one line per problem when
the review does not fit the format; nothing is written then.

The page leads with the verdict, which the script derives: Approve when no
feedback item is act-on, else Request changes. It then shows how much of the
review the reviewer saw, the observed run, and what nobody
verified.
"""
import argparse
import html
import json
import re
import sys
import tempfile
import webbrowser
from datetime import datetime
from pathlib import Path

SEVERITIES = {"act-on": "Act on", "consider": "Consider"}
PROOF_LEVELS = {
    "live": "Live functional test",
    "automated": "Automated tests only",
    "none": "No test evidence",
}
REVIEW_KEYS = {"title", "target", "url", "problem", "intent", "picture", "alignment", "proof", "changes",
               "feedback", "summary"}
PICTURE_KEYS = {"before", "after"}
CHANGE_KINDS = {"added": "+", "changed": "~", "removed": "−"}
CHANGE_KEYS = {"kind", "what", "detail"}
PROOF_KEYS = {"level", "steps", "live"}
STEP_KEYS = {"source", "text"}
STEP_SOURCES = ("reviewer", "reported")
LIVE_KEYS = {"tool", "command", "input", "before", "after", "note", "kind"}
LIVE_KINDS = ("check", "measurement")  # a check fails then passes; a measurement has no failure
RUN_KEYS = {"version", "result", "output"}
FEEDBACK_KEYS = {"severity", "title", "location", "detail", "evidence", "fix", "code", "untested",
                 "proof_gap"}
MAX_SENTENCE_WORDS = 25  # ASD-STE100 limit for a descriptive sentence
MAX_SENTENCES = 3  # in `problem` and in `intent`, so the pictures carry the section
MAX_STEP_WORDS = 6  # in one step of the picture
MAX_WHAT_WORDS = 8  # in a change, or in a live run result

FONTS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600'
         '&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">')

CSS = """
:root {
  color-scheme: light;
  --ink: #16181d; --muted: #5c636e; --line: #e3e5e9; --paper: #ffffff;
  --problem: #b54708; --intent: #0b5cad; --proof: #0b6e6e; --changes: #a3336f; --feedback: #8a5a00;
  --good: #1a7f37; --good-ink: #135c28; --good-wash: #eefaf1;
  --bad: #b42318; --bad-ink: #8f1c13; --bad-wash: #fff4f2; --code: #f1f3f5;
  --sans: "IBM Plex Sans", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
* { box-sizing: border-box; }
body { margin: 0; padding: 48px 16px 80px; background: var(--paper); color: var(--ink); -webkit-font-smoothing: antialiased; }
main { max-width: 860px; margin: 0 auto; font: 14px/1.5 var(--sans); display: flex; flex-direction: column; gap: 24px; }
code { font-family: var(--mono); font-size: .88em; background: var(--code); border-radius: 4px; padding: 1px 4px; overflow-wrap: anywhere; }
p, h1 { margin: 0; }
ul { margin: 0; padding: 0; list-style: none; }
h1 { font-size: 22px; line-height: 1.2; margin-top: 6px; text-wrap: balance; }
a { color: inherit; text-decoration-color: var(--line); text-underline-offset: 3px; }
.lbl { font: 600 11px var(--mono); letter-spacing: .07em; text-transform: uppercase; color: var(--muted); }
.note { font-size: 12px; color: var(--muted); }
.none { color: var(--muted); font-size: 13px; }
.mb { margin-bottom: 8px; }
.c-problem { color: var(--problem); } .c-intent { color: var(--intent); } .c-proof { color: var(--proof); }
.c-changes { color: var(--changes); } .c-feedback { color: var(--feedback); }
.c-good { color: var(--good-ink); } .c-bad { color: var(--bad-ink); }
.bottom { font: 700 30px/1.1 var(--sans); letter-spacing: -0.02em; margin-top: 12px; }
.g2, .g3 { display: grid; gap: 22px; }
.g2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.g3 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.g2 > *, .g3 > * { min-width: 0; }
.rule { border-top: 1.5px solid var(--ink); padding-top: 12px; }
.flow { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 10px; }
.chip { border: 1.5px solid #cdd1d8; border-radius: 8px; padding: 4px 9px; font-size: 12.5px; font-weight: 500; }
.chip.gone { border-style: dashed; border-color: var(--bad); background: var(--bad-wash); color: var(--bad-ink); }
.chip.new { border-color: var(--good); background: var(--good-wash); color: var(--good-ink); font-weight: 600; }
.arr { color: var(--muted); font-size: 12px; }
.hatch { background: repeating-linear-gradient(135deg, #e3e5e9 0 6px, #f4f5f7 6px 12px); }
.meter { display: flex; height: 44px; border-radius: 10px; overflow: hidden; gap: 3px; }
.meter > div { display: flex; align-items: center; justify-content: center; color: #ffffff; font: 700 18px var(--mono); min-width: 44px; }
.meter .seen { background: var(--good); } .meter .told { background: var(--intent); } .meter .open { color: var(--ink); }
.legend { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 12.5px; margin-top: 8px; }
.legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
.out, .fb pre { font: 12px/1.5 var(--mono); background: #f6f8fa; border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; }
.out.before { border-left: 3px solid var(--bad); } .out.after { border-left: 3px solid var(--good); }
.plain .out.before { border-left-color: #8a909b; }
.pair { display: grid; grid-template-columns: minmax(0, 1fr) 56px minmax(0, 1fr); align-items: stretch; margin-top: 8px; }
.tile { border-radius: 12px; padding: 16px; min-width: 0; border: 2px solid; }
.tile.before { border-color: var(--bad); background: var(--bad-wash); }
.tile.after { border-color: var(--good); background: var(--good-wash); }
.tile.plain { border-color: #8a909b; background: #f4f5f7; }
.tile header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.glyph { flex: none; width: 46px; height: 46px; border-radius: 50%; color: #ffffff; font: 700 26px/46px var(--mono); text-align: center; }
.before .glyph { background: var(--bad); } .after .glyph { background: var(--good); } .plain .glyph { background: #5c636e; }
.word { font: 700 22px/1 var(--mono); letter-spacing: .04em; }
.ver { font: 600 11.5px var(--mono); }
.mid { display: flex; align-items: center; justify-content: center; font-size: 26px; color: var(--muted); }
.col { border-top: 4px solid; padding-top: 10px; }
.col .n { font: 700 28px/1 var(--mono); }
.ledger li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 6px; margin-bottom: 8px; font-size: 13px; line-height: 1.45; }
.ledger li::before { font: 700 13px var(--mono); }
.ledger.seen li::before { content: "\\2713"; color: var(--good); }
.ledger.told li::before { content: "i"; color: var(--intent); }
.ledger.open li::before { content: "?"; color: var(--muted); }
.cards { display: grid; gap: 8px; }
.cards li { display: flex; gap: 9px; border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; }
.mark { flex: none; width: 20px; height: 20px; border-radius: 5px; color: #ffffff; font: 700 13px/20px var(--mono); text-align: center; }
.mark.added { background: var(--good); } .mark.changed { background: var(--intent); } .mark.removed { background: var(--bad); }
.cards b { display: block; font-size: 13.5px; font-weight: 600; line-height: 1.35; }
.cards small { display: block; font-size: 12.5px; color: var(--muted); margin-top: 2px; line-height: 1.4; }
.fb { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; }
.fb + .fb { margin-top: 8px; }
.fb .top { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
.tag { font-size: 10.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; border: 1.5px solid currentColor; border-radius: 999px; padding: 0 7px; white-space: nowrap; }
.tag.act-on { color: var(--bad); } .tag.consider { color: var(--feedback); }
.fb .ttl { font-weight: 650; flex: 1 1 220px; }
.fb .loc { font: 12px var(--mono); color: var(--muted); overflow-wrap: anywhere; min-width: 0; max-width: 100%; }
.fb dl { display: grid; grid-template-columns: 70px minmax(0, 1fr); gap: 6px 12px; margin: 10px 0 0; font-size: 13px; }
.fb dt { color: var(--muted); font-size: 12px; } .fb dd { margin: 0; min-width: 0; }
@media (max-width: 640px) {
  body { padding-top: 28px; }
  .g2, .g3, .pair, .fb dl { grid-template-columns: minmax(0, 1fr); }
  .mid { transform: rotate(90deg); padding: 4px; }
}
"""


# ---------- Validation ----------

def problems(review) -> list[str]:
    """Name every way the review breaks the format; an empty list means it can be rendered."""
    if not isinstance(review, dict):
        return ["the review must be a JSON object"]
    found = [f"unknown key `{key}`" for key in sorted(set(review) - REVIEW_KEYS)]
    for key in ("title", "target", "problem", "intent", "summary"):
        if not _text(review.get(key)):
            found.append(f"`{key}` must be a non-empty string")
    if "url" in review and not re.match(r"https?://", str(review["url"])):
        found.append("`url` must start with http:// or https://")
    if "picture" in review:
        found += _picture_problems(review["picture"])
    found += _changes_problems(review.get("changes"))
    if "alignment" in review and not _strings(review["alignment"]):
        found.append("`alignment` must be a list of one or more non-empty strings; "
                     "leave it out when no one else approved the change")
    feedback = review.get("feedback", [])
    if not isinstance(feedback, list):
        feedback = []
        found.append("`feedback` must be a list")
    for number, item in enumerate(feedback, 1):
        found += [f"feedback {number}: {problem}" for problem in _feedback_problems(item)]
    found += _proof_problems(review.get("proof"), feedback)
    if not found:
        found += _style_problems(review)
    return found


def _picture_problems(picture) -> list[str]:
    if not isinstance(picture, dict):
        return ["`picture` must be an object with `before` and `after`"]
    found = [f"picture: unknown key `{key}`" for key in sorted(set(picture) - PICTURE_KEYS)]
    for key in sorted(PICTURE_KEYS, reverse=True):
        steps = picture.get(key)
        if not _strings(steps) or not 2 <= len(steps) <= 5:
            found.append(f"picture: `{key}` must be a list of 2 to 5 short steps")
            continue
        found += [f"picture: {key} step {n} has more than {MAX_STEP_WORDS} words"
                  for n, step in enumerate(steps, 1) if len(step.split()) > MAX_STEP_WORDS]
    if not found and picture["before"] == picture["after"]:
        found.append("picture: `before` and `after` are the same; show the step that changes")
    return found


def _changes_problems(changes) -> list[str]:
    if not isinstance(changes, list) or not changes:
        return ["`changes` must be a list of one or more objects"]
    found = []
    for number, change in enumerate(changes, 1):
        if not isinstance(change, dict):
            found.append(f"change {number}: must be an object with `kind` and `what`")
            continue
        found += [f"change {number}: unknown key `{key}`" for key in sorted(set(change) - CHANGE_KEYS)]
        if change.get("kind") not in CHANGE_KINDS:
            found.append(f"change {number}: `kind` must be one of: {', '.join(CHANGE_KINDS)}")
        if not _text(change.get("what")):
            found.append(f"change {number}: `what` must be a non-empty string")
        elif len(change["what"].split()) > MAX_WHAT_WORDS:
            found.append(f"change {number}: `what` has more than {MAX_WHAT_WORDS} words; "
                         "move the rest to `detail`")
        if "detail" in change and not _text(change["detail"]):
            found.append(f"change {number}: `detail` must be a non-empty string when present")
    return found


def _proof_problems(proof, feedback: list) -> list[str]:
    if not isinstance(proof, dict):
        return ["`proof` must be an object with `level` and `steps`"]
    found = [f"proof: unknown key `{key}`" for key in sorted(set(proof) - PROOF_KEYS)]
    level, steps = proof.get("level"), proof.get("steps", [])
    if level not in PROOF_LEVELS:
        found.append(f"proof: `level` must be one of: {', '.join(PROOF_LEVELS)}")
    if not isinstance(steps, list):
        found.append("proof: `steps` must be a list")
    else:
        if level in ("live", "automated") and not steps:
            found.append(f"proof: level {level} needs `steps` that say what was run and what was seen")
        for number, step in enumerate(steps, 1):
            if not isinstance(step, dict):
                found.append(f"proof step {number}: must be an object with `source` and `text`")
                continue
            found += [f"proof step {number}: unknown key `{key}`" for key in sorted(set(step) - STEP_KEYS)]
            if step.get("source") not in STEP_SOURCES:
                found.append(f"proof step {number}: `source` must be reviewer or reported")
            if not _text(step.get("text")):
                found.append(f"proof step {number}: `text` must be a non-empty string")
    flagged = any(isinstance(item, dict) and item.get("proof_gap") is True for item in feedback)
    if level in ("automated", "none") and not flagged:
        found.append(f"proof: level is {level}, so add a feedback item with `\"proof_gap\": true` "
                     "that names the missing live functional test")
    if level == "live" and flagged:
        found.append("proof: level is live but a feedback item has `proof_gap`: change one or the other")
    if level == "live" and "live" not in proof:
        found.append("proof: level is live, so record the run in `live`: the command and observed output")
    if "live" in proof:
        found += _live_problems(proof["live"], level)
    return found


def _live_problems(live, level) -> list[str]:
    if not isinstance(live, dict):
        return ["proof: `live` must be an object with `tool`, `command`, `input` and `after`"]
    found = [f"proof live: unknown key `{key}`" for key in sorted(set(live) - LIVE_KEYS)]
    if level != "live":
        found.append("proof live: it records a live run, so `proof.level` must be live")
    for key in ("tool", "command", "input"):
        if not _text(live.get(key)):
            found.append(f"proof live: `{key}` must be a non-empty string")
    if "before" in live and _text(live.get("command")) and "{version}" not in live["command"]:
        found.append("proof live: `command` must hold `{version}` where the release goes")
    if live.get("kind", "check") not in LIVE_KINDS:
        found.append(f"proof live: `kind` must be one of: {', '.join(LIVE_KINDS)}")
    if "note" in live and not _text(live["note"]):
        found.append("proof live: `note` must be a non-empty string when present")
    sides = ("before", "after") if "before" in live else ("after",)
    for side in sides:
        run = live.get(side)
        if not isinstance(run, dict):
            found.append(f"proof live: `{side}` must be an object with `version`, `result` and `output`")
            continue
        found += [f"proof live {side}: unknown key `{key}`" for key in sorted(set(run) - RUN_KEYS)]
        for key in sorted(RUN_KEYS):
            if not _text(run.get(key)):
                found.append(f"proof live {side}: `{key}` must be a non-empty string")
        if _text(run.get("result")) and len(run["result"].split()) > MAX_WHAT_WORDS:
            found.append(f"proof live {side}: `result` has more than {MAX_WHAT_WORDS} words")
    return found


def _feedback_problems(item) -> list[str]:
    if not isinstance(item, dict):
        return ["must be an object"]
    found = [f"unknown key `{key}`" for key in sorted(set(item) - FEEDBACK_KEYS)]
    severity = item.get("severity")
    if severity not in SEVERITIES:
        found.append(f"`severity` must be one of: {', '.join(SEVERITIES)}")
    for key in ("title", "detail"):
        if not _text(item.get(key)):
            found.append(f"`{key}` must be a non-empty string")
    for key in ("location", "evidence", "fix", "code"):
        if key in item and not _text(item[key]):
            found.append(f"`{key}` must be a non-empty string when present")
    for key in ("untested", "proof_gap"):
        if not isinstance(item.get(key, False), bool):
            found.append(f"`{key}` must be true or false")
    if severity == "act-on":
        if not _text(item.get("evidence")):
            found.append("an act-on item needs `evidence`")
        if item.get("untested") is True:
            found.append("an act-on item cannot be untested: test it, or file it as consider")
    return found


def _style_problems(review: dict) -> list[str]:
    """Name each sentence and section over the Simplified Technical English limits."""
    fields = [(key, review[key]) for key in ("problem", "intent", "summary")]
    fields += [(f"alignment {n}", text) for n, text in enumerate(review.get("alignment", []), 1)]
    fields += [(f"change {n} `detail`", change["detail"])
               for n, change in enumerate(review["changes"], 1) if "detail" in change]
    fields += [(f"proof step {n}", step["text"]) for n, step in enumerate(review["proof"].get("steps", []), 1)]
    if "note" in review["proof"].get("live", {}):
        fields.append(("proof live `note`", review["proof"]["live"]["note"]))
    for number, item in enumerate(review.get("feedback", []), 1):
        fields += [(f"feedback {number} `{key}`", item[key])
                   for key in ("title", "detail", "evidence", "fix") if key in item]
    found = []
    for name, text in fields:
        sentences = re.split(r"(?<=[.!?])\s+", re.sub(r"`[^`]+`", "CODE", text.strip()))
        if name in ("problem", "intent") and len(sentences) > MAX_SENTENCES:
            found.append(f"{name}: has {len(sentences)} sentences, the limit is {MAX_SENTENCES}; "
                         "keep only the main point")
        for sentence in sentences:
            count = len(sentence.split())
            if count > MAX_SENTENCE_WORDS:
                start = " ".join(sentence.split()[:5])
                found.append(f"{name}: a sentence has {count} words, the limit is "
                             f"{MAX_SENTENCE_WORDS}; split \"{start}...\"")
    return found


def _text(value) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _strings(value) -> bool:
    return isinstance(value, list) and bool(value) and all(_text(item) for item in value)


# ---------- What the page works out ----------

def verdict(review: dict) -> str:
    """Approve when no feedback item is act-on, else request changes."""
    blocking = any(item["severity"] == "act-on" for item in review.get("feedback", []))
    return "request-changes" if blocking else "approve"


def evidence_lists(review: dict) -> dict[str, list[str]]:
    """Sort what the review holds into seen by the reviewer, reported, and not verified."""
    steps = review["proof"].get("steps", [])
    live = review["proof"].get("live", {})
    alignment = review.get("alignment", [])
    unverified = [item["title"] for item in review.get("feedback", []) if item.get("untested")]
    if live.get("note"):
        unverified.insert(0, live["note"])
    if not live:
        unverified.insert(0, "No one ran the change in a real system.")
    if not alignment:
        unverified.append("No person other than the author approved the change.")
    return {"seen": [step["text"] for step in steps if step["source"] == "reviewer"],
            "told": [step["text"] for step in steps if step["source"] == "reported"] + alignment,
            "open": unverified}


# ---------- The page ----------

def _esc(text) -> str:
    return html.escape(str(text))


def _inline(text: str) -> str:
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", html.escape(text))


def _flow(steps: list[str], other: list[str], kind: str) -> str:
    """One row of the picture. A step the other row lacks is marked as the difference."""
    sign = "− " if kind == "gone" else "+ "
    parts = []
    for index, step in enumerate(steps):
        diff = step not in other
        arrow = '<span class="arr">→</span>' if index else ""
        parts.append(f'{arrow}<span class="chip{" " + kind if diff else ""}">{sign if diff else ""}'
                     f"{_inline(step)}</span>")
    return '<div class="flow">' + "".join(parts) + "</div>"


def _meter(lists: dict[str, list[str]]) -> str:
    bars = "".join(f'<div class="{kind}{" hatch" if kind == "open" else ""}" style="flex:{len(lists[kind])}">'
                   f"{len(lists[kind])}</div>" for kind in ("seen", "told", "open") if lists[kind])
    return (f'<div><p class="lbl mb">How much of this review was seen</p><div class="meter">{bars}</div>'
            '<div class="legend"><span><i style="background:var(--good)"></i>Seen by the reviewer</span>'
            '<span><i style="background:var(--intent)"></i>Reported, not run again</span>'
            '<span><i class="hatch"></i>Not verified</span></div></div>')


def _check(proof: dict) -> str:
    """The observed run, with a baseline when one exists."""
    live = proof.get("live")
    if not live:
        return (f'<div><p class="lbl c-proof mb">The check</p><div class="tile plain"><header><div class="glyph">?'
                f'</div><div><div class="word">NOT RUN</div><span class="ver">{PROOF_LEVELS[proof["level"]]}</span>'
                f"</div></header><p>No one ran the change in a real system.</p></div></div>")
    measured = live.get("kind") == "measurement"

    def tile(side: str, glyph: str, word: str) -> str:
        plain = measured and side == "before"
        tone = "" if plain else "c-bad" if side == "before" else "c-good"
        return (f'<div class="tile {side}{" plain" if plain else ""}"><header><div class="glyph">{glyph}</div><div>'
                f'<div class="word {tone}">{word}</div><span class="ver">{_esc(live["tool"])} '
                f'{_esc(live[side]["version"])}</span></div></header><p class="mb" style="font-weight:600">'
                f'{_esc(live[side]["result"])}</p><pre class="out {side}">{_esc(live[side]["output"])}</pre></div>')
    if "before" in live:
        before = tile("before", "1", "BEFORE") if measured else tile("before", "×", "FAILS")
        after = tile("after", "2", "AFTER") if measured else tile("after", "✓", "PASSES")
        runs = f'<div class="pair">{before}<div class="mid">→</div>{after}</div>'
    else:
        runs = f'<div class="mb">{tile("after", "✓", "OBSERVED")}</div>'
    note = f'<p class="note" style="margin-top:8px">{_inline(live["note"])}</p>' if live.get("note") else ""
    return (f'<div><p class="lbl c-proof mb">The check</p><pre class="out">{_esc(live["command"])}</pre>'
            f'<p class="note" style="margin-top:6px">Input: <code>{_esc(live["input"])}</code></p>'
            f'{runs}{note}</div>')


def _columns(lists: dict[str, list[str]]) -> str:
    def column(kind: str, color: str, title: str, empty: str) -> str:
        items = lists[kind]
        body = (f'<ul class="ledger {kind}">' + "".join(f"<li><span>{_inline(item)}</span></li>" for item in items)
                + "</ul>") if items else f'<p class="none">{empty}</p>'
        return (f'<div class="col" style="border-color:{color}"><p class="mb"><span class="n" style="color:{color}">'
                f'{len(items)}</span> <span class="lbl">{title}</span></p>{body}</div>')
    return ('<div class="g3">' + column("seen", "var(--good)", "Seen", "The reviewer ran nothing.")
            + column("told", "var(--intent)", "Reported", "No reports.")
            + column("open", "#8a909b", "Not verified", "Nothing is recorded as not verified.") + "</div>")


def _cards(changes: list[dict]) -> str:
    items = []
    for change in changes:
        detail = f"<small>{_inline(change['detail'])}</small>" if change.get("detail") else ""
        items.append(f'<li><span class="mark {change["kind"]}" title="{change["kind"]}">{CHANGE_KINDS[change["kind"]]}'
                     f"</span><div><b>{_inline(change['what'])}</b>{detail}</div></li>")
    return '<ul class="cards">' + "".join(items) + "</ul>"


def _feedback(feedback: list[dict]) -> str:
    if not feedback:
        return '<p class="none">No feedback items.</p>'
    blocks = []
    for key, label in SEVERITIES.items():
        for item in (item for item in feedback if item["severity"] == key):
            place = " · ".join(part for part in (item.get("location"), "untested" if item.get("untested") else "")
                                    if part)
            code = f"<pre>{_esc(item['code'].strip(chr(10)))}</pre>" if "code" in item else ""
            rows = f"<dt>Problem</dt><dd>{_inline(item['detail'])}</dd>"
            if "evidence" in item:
                rows += f"<dt>Evidence</dt><dd>{_inline(item['evidence'])}{code}</dd>"
            elif code:
                rows += f"<dt>Output</dt><dd>{code}</dd>"
            if "fix" in item:
                rows += f"<dt>Fix</dt><dd>{_inline(item['fix'])}</dd>"
            blocks.append(f'<div class="fb"><div class="top"><span class="tag {key}">{label}</span>'
                          f'<span class="ttl">{_inline(item["title"])}</span><span class="loc">{_esc(place)}</span>'
                          f"</div><dl>{rows}</dl></div>")
    return "".join(blocks)


def render(review: dict, now: datetime | None = None) -> str:
    """Return the page for a review that has no problems."""
    now = now or datetime.now()
    ok = verdict(review) == "approve"
    tone, bottom, label = (("c-good", "Approve. Merge it.", "Approve") if ok
                           else ("c-bad", "Request changes.", "Request changes"))
    target = _esc(review["target"])
    if "url" in review:
        target = f'<a href="{_esc(review["url"])}">{target}</a>'
    lists = evidence_lists(review)
    flows = ("", "")
    if picture := review.get("picture"):
        before, after = picture["before"], picture["after"]
        flows = (_flow(before, after, "gone"), _flow(after, before, "new"))
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Review: {_esc(review["title"])}</title>
{FONTS}
<style>{CSS}</style>
</head>
<body>
<main>
<div><p class="lbl">Review · {target}</p><h1>{_inline(review["title"])}</h1><p class="bottom {tone}">{bottom}</p></div>
<div class="g2"><div class="rule"><p class="lbl c-problem mb">Problem statement</p><p>{_inline(review["problem"])}</p>{flows[0]}</div><div class="rule"><p class="lbl c-intent mb">Intent</p><p>{_inline(review["intent"])}</p>{flows[1]}</div></div>
{_meter(lists)}
{_check(review["proof"])}
{_columns(lists)}
<div class="g2 rule"><div><p class="lbl c-changes mb">Changes</p>{_cards(review["changes"])}</div><div><p class="lbl c-feedback mb">Feedback</p>{_feedback(review.get("feedback", []))}</div></div>
<div class="rule"><p class="lbl {tone}">Verdict · {label}</p><p style="margin-top:6px;font-size:15px">{_inline(review["summary"])}</p></div>
<p class="note">Reviewed {now:%Y-%m-%d %H:%M}</p>
</main>
</body>
</html>
"""


def default_path(review: dict, now: datetime) -> Path:
    slug = re.sub(r"[^a-z0-9]+", "-", review["target"].lower()).strip("-")[:60] or "review"
    return Path(tempfile.gettempdir()) / "review-reports" / f"{slug}-{now:%Y%m%d-%H%M%S}.html"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("review", help="path to the review JSON, or - for standard input")
    parser.add_argument("--out", type=Path, help="write the page here instead of the temporary folder")
    parser.add_argument("--open", action="store_true", help="open the page in the default browser")
    args = parser.parse_args(argv)
    try:
        source = sys.stdin.read() if args.review == "-" else Path(args.review).read_text(encoding="utf-8")
    except OSError as error:
        print(f"cannot read {args.review}: {error.strerror}", file=sys.stderr)
        return 1
    try:
        review = json.loads(source)
    except json.JSONDecodeError as error:
        print(f"not valid JSON: {error}", file=sys.stderr)
        return 1
    found = problems(review)
    if found:
        print("\n".join(found), file=sys.stderr)
        return 1
    now = datetime.now()
    path = args.out or default_path(review, now)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render(review, now), encoding="utf-8")
    print(path)
    if args.open:
        webbrowser.open(path.resolve().as_uri())
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
