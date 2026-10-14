"""Single-host plain-file store. See ../../references/LICENSE.txt."""

from collections import Counter
import fcntl
import json
import os
from pathlib import Path
import re
import socket
import uuid

from .common import ToolError, Missing, atomic, now, read_json, write_json, text_cell

UNIT = ("id", "track", "state", "branch", "pr", "sha", "brief")
LEDGER = ("pr", "sha", "verdict", "evidence", "verifier", "ts")
VERDICTS = (
    "live-ui-verified",
    "unit-test-verified",
    "type-check-only",
    "verifier-blocked",
    "verifier-failed",
    "behavior-verified",
)


def sha(value):
    if not isinstance(value, str) or not re.fullmatch(
        r"[0-9a-fA-F]{40}|[0-9a-fA-F]{64}", value
    ):
        raise ToolError("expected a full commit SHA")
    return value.lower()


def pr(value):
    if isinstance(value, bool) or not re.fullmatch(r"[1-9][0-9]*", str(value)):
        raise ToolError("expected a positive PR number")
    return str(value)


def identifier(value):
    text_cell(value)
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", value):
        raise ToolError("invalid identifier")
    return value


class Store:
    def __init__(self, path):
        self.path = Path(path).expanduser().resolve()
        installed = Path(__file__).resolve().parents[2]
        if self.path == installed or installed in self.path.parents:
            raise ToolError("store must be outside the installed skill")
        self.lock = None

    def __enter__(self):
        self.path.mkdir(parents=True, exist_ok=True)
        lockpath = self.path / ".orch.lock"
        if lockpath.is_symlink():
            raise ToolError("lock cannot be a symlink")
        fd = os.open(lockpath, os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
        self.lock = os.fdopen(fd, "r+")
        try:
            fcntl.flock(self.lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            raw = self.lock.read().strip()
            if raw:
                owner = json.loads(raw)
                if (
                    not isinstance(owner, dict)
                    or owner.get("host") != socket.gethostname()
                ):
                    raise ToolError(
                        "lock ownership is unknown or belongs to another host"
                    )
            self.lock.seek(0)
            self.lock.truncate()
            self.lock.write(
                json.dumps({"host": socket.gethostname(), "pid": os.getpid()})
            )
            self.lock.flush()
            os.fsync(fd)
            return self
        except BlockingIOError as exc:
            self.close()
            raise ToolError(
                "store is locked by another writer; force cannot steal a live lock"
            ) from exc
        except (ValueError, ToolError) as exc:
            self.close()
            raise ToolError(str(exc)) from exc
        except BaseException:
            self.close()
            raise

    def close(self):
        if self.lock:
            self.lock.close()
            self.lock = None

    def __exit__(self, *_):
        self.close()

    def active(self):
        if self.lock is None:
            raise ToolError("store is closed")

    def init(self):
        self.active()
        defaults = {
            "inbox.json": [],
            "gates.json": [],
            "standing.json": [],
            "frontier.json": {"generation": 0, "prs": [], "lowestUnmerged": None},
        }
        for filename, fields in [("units.tsv", UNIT), ("ledger.tsv", LEDGER)]:
            if not (self.path / filename).exists():
                atomic(self.path / filename, "\t".join(fields) + "\n")
        for filename, value in defaults.items():
            if not (self.path / filename).exists():
                write_json(self.path / filename, value)
        (self.path / "drains").mkdir(exist_ok=True)
        self.units()
        self.ledger()
        self.records("inbox")
        self.records("gates")
        self.records("standing")
        self.frontier()
        return {"store": str(self.path)}

    def table(self, filename, fields):
        self.active()
        p = self.path / filename
        if p.is_symlink():
            raise ToolError("table cannot be a symlink")
        try:
            lines = p.read_text().splitlines()
        except FileNotFoundError as exc:
            raise Missing("store not initialized") from exc
        if not lines or lines[0].split("\t") != list(fields):
            raise ToolError(f"invalid {filename} header")
        rows = []
        for line in lines[1:]:
            cells = line.split("\t")
            if len(cells) != len(fields):
                raise ToolError(f"malformed {filename} row")
            rows.append(dict(zip(fields, cells)))
        return rows

    def save_table(self, filename, fields, rows):
        self.active()
        lines = ["\t".join(fields)]
        for row in rows:
            lines.append("\t".join(text_cell(row[k], k, True) for k in fields))
        atomic(self.path / filename, "\n".join(lines) + "\n")

    def units(self, **filters):
        rows = self.table("units.tsv", UNIT)
        seen = set()
        for row in rows:
            identifier(row["id"])
            text_cell(row["track"])
            text_cell(row["state"])
            if row["id"] in seen:
                raise ToolError("duplicate unit")
            seen.add(row["id"])
            if row["sha"]:
                sha(row["sha"])
            if row["pr"]:
                pr(row["pr"])
        return [
            r for r in rows if all(v is None or r[k] == v for k, v in filters.items())
        ]

    def unit_get(self, id):
        return self.find(self.units(), "id", id)

    @staticmethod
    def find(rows, key, value):
        for row in rows:
            if row[key] == value:
                return row
        raise Missing(f"{key} not found: {value}")

    def unit_add(self, id, track, brief=""):
        identifier(id)
        text_cell(track)
        rows = self.units()
        if any(r["id"] == id for r in rows):
            raise ToolError("unit already exists")
        row = dict.fromkeys(UNIT, "")
        row.update(id=id, track=track, state="pending", brief=brief)
        self.save_table("units.tsv", UNIT, rows + [row])
        return row

    def unit_set(self, id, **values):
        rows = self.units()
        row = self.find(rows, "id", id)
        for key, value in values.items():
            if value is not None:
                if key not in UNIT or key == "id":
                    raise ToolError("invalid unit field")
                row[key] = (
                    sha(value)
                    if key == "sha"
                    else pr(value)
                    if key == "pr"
                    else text_cell(value)
                )
        self.save_table("units.tsv", UNIT, rows)
        return row

    def ledger(self):
        rows = self.table("ledger.tsv", LEDGER)
        seen = set()
        for row in rows:
            pr(row["pr"])
            sha(row["sha"])
            text_cell(row["evidence"])
            text_cell(row["ts"])
            if row["verdict"] not in VERDICTS:
                raise ToolError("invalid verification verdict")
            key = row["pr"], row["sha"]
            if key in seen:
                raise ToolError("duplicate ledger key")
            seen.add(key)
        return rows

    def record(self, number, revision, verdict, evidence, verifier=""):
        number, revision = pr(number), sha(revision)
        if verdict not in VERDICTS:
            raise ToolError("invalid verification verdict")
        text_cell(evidence)
        rows = [r for r in self.ledger() if (r["pr"], r["sha"]) != (number, revision)]
        row = dict(
            pr=number,
            sha=revision,
            verdict=verdict,
            evidence=evidence,
            verifier=verifier,
            ts=now(),
        )
        self.save_table("ledger.tsv", LEDGER, rows + [row])
        return row

    def check(self, number, revision):
        number, revision = pr(number), sha(revision)
        for row in self.ledger():
            if row["pr"] == number and row["sha"] == revision:
                return row
        raise Missing("no verification for this PR and revision")

    def records(self, name):
        self.active()
        rows = read_json(self.path / f"{name}.json")
        if not isinstance(rows, list):
            raise ToolError(f"invalid {name} records")
        required = {
            "inbox": ("ts", "agent", "unit", "status", "report"),
            "gates": ("kind", "id", "question", "options", "defaultAnswer"),
            "standing": ("number", "line"),
        }[name]
        ids = set()
        for row in rows:
            if not isinstance(row, dict) or any(k not in row for k in required):
                raise ToolError(f"malformed {name} row")
            for key in required:
                if key == "number":
                    if type(row[key]) is not int or row[key] < 1:
                        raise ToolError("invalid standing number")
                else:
                    text_cell(row[key], key, key == "report")
            if name == "gates":
                if row["kind"] not in ("open", "resolved"):
                    raise ToolError("invalid gate state")
                if row["kind"] == "resolved":
                    text_cell(row.get("answer"), "answer")
            if name != "inbox":
                key = row["id"] if name == "gates" else row["number"]
                if key in ids:
                    raise ToolError("duplicate record")
                ids.add(key)
        return rows

    def save(self, name, rows):
        self.active()
        write_json(self.path / f"{name}.json", rows)

    def push(self, agent, unit, status, report=""):
        self.unit_get(unit)
        row = dict(
            ts=now(),
            agent=text_cell(agent),
            unit=unit,
            status=text_cell(status),
            report=text_cell(report, empty=True),
        )
        self.save("inbox", self.records("inbox") + [row])
        return row

    def drain(self, peek=False):
        rows = self.records("inbox")
        if not peek and rows:
            archive = self.path / "drains"
            if archive.is_symlink():
                raise ToolError("drains cannot be a symlink")
            archive.mkdir(exist_ok=True)
            write_json(archive / f"{uuid.uuid4()}.json", rows)
            self.save("inbox", [])
        return rows

    def park(self, id, question, options, default):
        identifier(id)
        rows = self.records("gates")
        if any(r["id"] == id for r in rows):
            raise ToolError("gate already exists")
        row = dict(
            kind="open",
            id=id,
            question=text_cell(question),
            options=text_cell(options),
            defaultAnswer=text_cell(default),
        )
        self.save("gates", rows + [row])
        return row

    def resolve(self, id, answer):
        rows = self.records("gates")
        row = self.find(rows, "id", id)
        row.update(kind="resolved", answer=text_cell(answer))
        self.save("gates", rows)
        return row

    def standing_add(self, line):
        rows = self.records("standing")
        row = {
            "number": max((r["number"] for r in rows), default=0) + 1,
            "line": text_cell(line),
        }
        self.save("standing", rows + [row])
        return row

    def frontier(self):
        self.active()
        value = read_json(self.path / "frontier.json")
        if (
            not isinstance(value, dict)
            or type(value.get("generation")) is not int
            or value["generation"] < 0
            or not isinstance(value.get("prs"), list)
        ):
            raise ToolError("invalid frontier")
        seen = set()
        for row in value["prs"]:
            if not isinstance(row, dict) or type(row.get("pr")) is not int:
                raise ToolError("invalid frontier row")
            pr(row["pr"])
            sha(row.get("sha"))
            text_cell(row.get("branches"))
            if (
                row.get("state") not in ("OPEN", "CLOSED", "MERGED")
                or row["pr"] in seen
            ):
                raise ToolError("invalid frontier state or duplicate")
            seen.add(row["pr"])
        expected = next((r["pr"] for r in value["prs"] if r["state"] != "MERGED"), None)
        if value.get("lowestUnmerged") != expected:
            raise ToolError("frontier pointer mismatch")
        return value

    def set_frontier(self, rows, expected=None):
        if expected is not None and [r["pr"] for r in rows] != expected:
            raise ToolError("PR order differs from pin")
        old = self.frontier()
        value = {
            "generation": old["generation"] + 1,
            "prs": rows,
            "lowestUnmerged": next(
                (r["pr"] for r in rows if r["state"] != "MERGED"), None
            ),
        }
        # Validate before replacing the current frontier.
        for row in rows:
            pr(row["pr"])
            sha(row["sha"])
            text_cell(row["branches"])
            if row["state"] not in ("OPEN", "CLOSED", "MERGED"):
                raise ToolError("invalid PR state")
        if len({r["pr"] for r in rows}) != len(rows):
            raise ToolError("duplicate frontier PR")
        self.save("frontier", value)
        return value

    def status(self):
        units, ledger, frontier, gates = (
            self.units(),
            self.ledger(),
            self.frontier(),
            self.records("gates"),
        )
        summary = {
            "unitStates": dict(Counter(r["state"] for r in units)),
            "ledgerVerdicts": dict(Counter(r["verdict"] for r in ledger)),
            "frontierGeneration": frontier["generation"],
            "openGateIds": [r["id"] for r in gates if r["kind"] == "open"],
        }
        content = (
            "# Work status\n\n```json\n" + json.dumps(summary, indent=2) + "\n```\n"
        )
        atomic(self.path / "status.md", content)
        return dict(
            units=units,
            ledger=ledger,
            frontier=frontier,
            gates=gates,
            summary=summary,
            changed="status.md",
        )
