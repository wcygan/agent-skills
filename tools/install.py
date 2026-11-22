#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Commit and push this catalog, pin it in dotfiles, and install it globally.

One run converges the machine on HEAD: every step checks what is already true
and does only the rest, so a rerun after a failure continues where it stopped.

The run ends once the skills are installed and the pin is committed; a detached
publisher finishes both pushes and records the result. `--wait` pushes in the
run itself and fails when a push fails. `--timings` compares HEAD with origin, so
it reports a publish that never recorded a result.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import os
import re
import shutil
import subprocess
import sys
import time
from contextlib import contextmanager, nullcontext
from datetime import datetime, timezone
from pathlib import Path

REPOSITORY = "wcygan/agent-skills"
LOCK_FILE = "agent-skills.lock.toml"
TIMINGS_FILE = "install.timings.jsonl"
PUSH_LOG = "install.push.jsonl"
PUSH_LOCK = "install.push.lock"
QUEUE_LOCK = "install.queue.lock"
# A push that outlasts this is stopped and recorded as failed, so no publisher hangs.
PUSH_TIMEOUT = float(os.environ.get("AGENT_SKILLS_PUSH_TIMEOUT", "120"))
STAMP = re.compile(r"^    (github-[a-z-]+): (.+)$", re.MULTILINE)
SIMPLE_CHILD = re.compile(r"^[A-Za-z0-9_-]+: \S.*$")


class Stop(Exception):
    """A condition the user must resolve before the run can continue."""


class Timeline:
    """Wall-clock time of every step, with the commands each one ran."""

    def __init__(self) -> None:
        self.spans: list[dict[str, object]] = []
        self.started = time.perf_counter()
        self.installed_at: float | None = None

    @contextmanager
    def span(self, step: str):
        started = time.perf_counter()
        ok = False
        try:
            yield
            ok = True
        finally:
            self.spans.append({"step": step, "seconds": round(time.perf_counter() - started, 4),
                               "ok": ok})

    def record(self, outcome: str) -> dict[str, object]:
        return {"started": utc_now(),
                "outcome": outcome, "installed_at": self.installed_at,
                "seconds": round(time.perf_counter() - self.started, 4), "spans": self.spans}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def step_seconds(record: dict) -> dict[str, float]:
    totals: dict[str, float] = {}
    for span in record["spans"]:
        totals[span["step"]] = totals.get(span["step"], 0.0) + span["seconds"]
    return totals


def format_run(record: dict) -> str:
    """One line per step in the order it ran, with its share of the run."""
    total = record["seconds"] or 1e-9
    totals = step_seconds(record)
    lines = [f"{record['seconds']:.2f}s total ({record['outcome']})"
             + (f"; installed locally at {record['installed_at']:.2f}s, the rest is pushing"
                if record.get("installed_at") and any(step.startswith("push") for step in totals)
                else "")]
    lines += [f"  {seconds:6.3f}s {seconds / total:4.0%}  {step}" for step, seconds in totals.items()]
    other = max(record["seconds"] - sum(totals.values()), 0.0)
    lines.append(f"  {other:6.3f}s {other / total:4.0%}  everything else")
    return "\n".join(lines)


def format_history(records: list[dict]) -> str:
    """Recent runs side by side, one column per step, so a regression stands out."""
    steps = list(dict.fromkeys(span["step"] for record in records for span in record["spans"]))
    lines = ["  ".join([f"{'started (UTC)':<19}", f"{'outcome':<7}", f"{'total':>6}", f"{'local':>6}"]
                       + [f"{step:>14}" for step in steps])]
    for record in records:
        totals = step_seconds(record)
        lines.append("  ".join(
            [record["started"][:19], f"{record['outcome']:<7}", f"{record['seconds']:6.2f}",
             f"{record.get('installed_at') or 0:6.2f}"]
            + [f"{totals[step]:14.3f}" if step in totals else f"{'-':>14}" for step in steps]))
    return "\n".join(lines)


def some(names: list[str]) -> str:
    """Name a short list in full and a long one by its size."""
    if not names:
        return "none"
    return ", ".join(names) if len(names) <= 5 else f"{len(names)} skills"


POOL = None


def together(*thunks):
    """Run independent steps at once; return their results in order, or raise the first error."""
    global POOL
    if POOL is None:  # Imported here: `--timings` and `--publish` never need the pool.
        from concurrent.futures import ThreadPoolExecutor
        POOL = ThreadPoolExecutor(max_workers=16)
    return [future.result() for future in [POOL.submit(thunk) for thunk in thunks]]


SOCKETS = Path.home() / ".cache" / "agent-skills"
# One SSH connection serves both pushes and stays open for the next run. The
# keepalive closes a connection the server dropped, so a later run never waits on it.
MULTIPLEX = ["-o", "ControlMaster=auto", "-o", "ControlPersist=600",
             "-o", f"ControlPath={SOCKETS}/ssh-%C",
             "-o", "ServerAliveInterval=5", "-o", "ServerAliveCountMax=2"]


def git_environment() -> dict[str, str]:
    env = {key: value for key, value in os.environ.items() if key != "VIRTUAL_ENV"}
    if "GIT_SSH_COMMAND" not in env:
        SOCKETS.mkdir(parents=True, exist_ok=True)
        env["GIT_SSH_COMMAND"] = " ".join(["ssh", *MULTIPLEX])
    return env


OWN_SSH = "GIT_SSH_COMMAND" not in os.environ
ENV = git_environment()


def warm_connection(root: Path) -> None:
    """Open the shared SSH connection in the background, before the first push needs it."""
    if not OWN_SSH or any(SOCKETS.glob("ssh-*")):
        return
    match = re.match(r"(?:ssh://)?([^/:]+@[^/:]+)[:/]", git(root, "remote", "get-url", "--push", "origin"))
    if match:
        subprocess.Popen(["ssh", *MULTIPLEX, "-o", "BatchMode=yes", "-N", "-f", match.group(1)],
                         stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL)


def git(root: Path, *args: str, check: bool = True) -> str:
    result = subprocess.run(["git", *args], cwd=root, text=True, env=ENV,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if check and result.returncode:
        raise Stop(f"git {' '.join(args)} failed in {root}: {result.stderr.strip()}")
    return result.stdout.rstrip("\n")


def read_head(root: Path) -> tuple[str, str, bool]:
    """The default branch `root` is on, its HEAD commit, and whether HEAD differs from origin's.

    Refuses any other branch, so `origin/HEAD` is `origin/<branch>` in whatever this returns.
    """
    commit, published, branch, default = git(
        root, "rev-parse", "HEAD", "origin/HEAD", "--abbrev-ref", "HEAD", "origin/HEAD").splitlines()
    default = default.removeprefix("origin/")
    if branch != default:
        raise Stop(f"{root} is on {branch}; install only from {default}")
    return branch, commit, commit != published


def commit_message(paths: list[str]) -> str:
    """The same staged paths always produce the same message."""
    skills = sorted({path.split("/")[1] for path in paths
                     if path.startswith("skills/") and path.count("/") >= 2})
    if not skills:
        return "chore: update catalog tooling"
    named = ", ".join(skills) if len(skills) <= 3 else f"{len(skills)} skills"
    return f"feat(skills): update {named}"


def refresh_snapshot(provider: Path) -> None:
    """Rewrite catalog-snapshot.json as `tools/catalog.py snapshot` does, without a second process."""
    if not (provider / "skill_catalog").is_dir():
        return
    sys.path.insert(0, str(provider))
    from skill_catalog import catalog
    try:
        catalog.snapshot(provider, check=False)
    except catalog.CatalogError as error:
        raise Stop(f"catalog snapshot failed: {error}") from error


def commit_catalog(provider: Path, message: str | None, timeline: Timeline) -> str:
    """Stage everything and commit it; return the message used."""
    # CI rejects a stale snapshot, so refresh it inside the same commit.
    with timeline.span("snapshot + stage"):
        refresh_snapshot(provider)
        git(provider, "add", "-A")
    with timeline.span("git commit"):
        used = message or commit_message(git(provider, "diff", "--cached", "--name-only").splitlines())
        git(provider, "commit", "-q", "-m", used)
    return used


def start_push(root: Path, branch: str) -> subprocess.Popen:
    return subprocess.Popen(["git", "push", "-q", "origin", f"HEAD:refs/heads/{branch}"], cwd=root,
                            env=ENV, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def finish_push(root: Path, push: subprocess.Popen, started: float) -> None:
    try:
        output, _ = push.communicate(
            timeout=max(started + PUSH_TIMEOUT - time.perf_counter(), 0))
    except subprocess.TimeoutExpired:
        # Not read again: a hook the push started may hold the pipe open.
        push.kill()
        raise Stop(f"push from {root} timed out after {PUSH_TIMEOUT:g}s") from None
    if push.returncode:
        raise Stop(f"push from {root} failed: {output.strip()}")


def finish_pushes(running: list[tuple[str, Path, subprocess.Popen, float]]
                  ) -> tuple[dict[str, float], dict[str, str]]:
    """Wait for every push; return each one's seconds since it started and each failure."""
    seconds, errors = {}, {}
    for label, root, push, started in running:
        try:
            finish_push(root, push, started)
        except Stop as error:
            errors[label] = str(error)
        # Measured from its start, so it overlaps whatever ran beside it.
        seconds[label] = round(time.perf_counter() - started, 4)
    return seconds, errors


def save_publish(common: Path, started: str, clock: float, commit: str,
                 seconds: dict[str, float], errors: dict[str, str]) -> None:
    record = {"started": started, "outcome": "failed" if errors else "ok",
              "seconds": round(time.perf_counter() - clock, 4), "pushes": seconds,
              "commit": commit, "error": "; ".join(errors.values())}
    with (common / PUSH_LOG).open("a") as log:
        log.write(json.dumps(record) + "\n")


def last_publish(common: Path) -> dict | None:
    try:
        lines = (common / PUSH_LOG).read_text().splitlines()
        return json.loads(lines[-1]) if lines else None
    except (OSError, ValueError):
        return None


def format_publish(record: dict | None) -> str:
    if not record:
        return "none recorded"
    pushes = ", ".join(f"{label} {seconds:.2f}s" for label, seconds in record["pushes"].items())
    return (f"{record['outcome']} in {record['seconds']:.2f}s ({pushes or 'nothing to push'}) "
            f"at {record['started'][:19]}, commit {record['commit'][:12]}"
            + (f"\n  {record['error']}" if record["error"] else ""))


@contextmanager
def push_lock(common: Path, waiting: str | None = None):
    """One pusher at a time: a publisher still running finishes before the next push starts."""
    with (common / PUSH_LOCK).open("a") as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            if waiting:
                print(waiting, flush=True)
            fcntl.flock(handle, fcntl.LOCK_EX)
        yield


def locked(path: Path) -> bool:
    with path.open("a") as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_SH | fcntl.LOCK_NB)
        except BlockingIOError:
            return True
    return False


def unpublished(provider: Path, consumer: Path) -> list[str]:
    return [label for label, root in (("catalog", provider), ("dotfiles", consumer))
            if read_head(root)[2]]


def publish(common: Path, provider: Path, consumer: Path, queued: int) -> None:
    """Push the catalog and the dotfiles pin at once, and record how it went."""
    with push_lock(common):
        # This publisher reads the refs now, so a later commit needs a publisher of its own.
        os.close(queued)
        started, clock = utc_now(), time.perf_counter()
        commit, seconds, errors = "", {}, {}
        try:
            commit = git(provider, "rev-parse", "HEAD")
            running = []
            for label, root in (("catalog", provider), ("dotfiles", consumer)):
                branch, _, ahead = read_head(root)
                if ahead:
                    running.append((label, root, start_push(root, branch), time.perf_counter()))
            seconds, errors = finish_pushes(running)
        except (Stop, OSError) as error:
            errors["publish"] = str(error)
        if seconds or errors:  # A publisher that found everything pushed has nothing to report.
            save_publish(common, started, clock, commit, seconds, errors)
    if errors:
        raise Stop("; ".join(errors.values()))


def spawn_publisher(common: Path, consumer: Path) -> None:
    """Start the publisher in its own session, so it outlives this run and shares no pipes.

    The publisher inherits the queue lock and holds it until it starts pushing. While it is
    held, a publisher that has not read the refs yet exists, and it will push this run's
    commits too, so no second one is queued behind it.
    """
    with (common / QUEUE_LOCK).open("a") as queue:
        try:
            fcntl.flock(queue, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "--publish",
                          str(queue.fileno()), "--dotfiles", str(consumer)],
                         start_new_session=True, pass_fds=[queue.fileno()],
                         stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL)


def catalog_at_head(provider: Path) -> dict[str, tuple[str, list[str]]]:
    """Each skill at HEAD: its git tree and the tracked files beneath it."""
    entries = [line.split("\t", 1) for line in
               git(provider, "ls-tree", "-r", "-t", "HEAD", "skills/").splitlines()]
    trees = {path.removeprefix("skills/"): meta.split()[2] for meta, path in entries
             if meta.split()[1] == "tree" and path.count("/") == 1}
    files: dict[str, list[str]] = {name: [] for name in trees}
    for meta, path in entries:
        if meta.split()[1] == "tree":
            continue
        name, _, relative = path.removeprefix("skills/").partition("/")
        if meta.split()[0] == "120000":
            raise Stop(f"{path} is a symlink; a skill may hold only files and directories")
        if name in files:
            files[name].append(relative)
    return {name: (tree, files[name]) for name, tree in trees.items() if "SKILL.md" in files[name]}


def stamp(text: str, name: str, commit: str, tree: str) -> str:
    """Add the source attestation GitHub CLI writes, so its tools read this copy the same way."""
    if not text.startswith("---\n") or "\n---" not in text[4:]:
        raise Stop(f"skills/{name}/SKILL.md has no frontmatter")
    end = text.index("\n---", 4)
    lines = text[4:end].split("\n")
    attestation = {"github-path": f"skills/{name}", "github-pinned": commit, "github-ref": commit,
                   "github-repo": f"https://github.com/{REPOSITORY}", "github-tree-sha": tree}
    stamped = [f"{key}: {value}" for key, value in attestation.items()]
    if "metadata:" not in lines:
        lines += ["metadata:"] + [f"    {line}" for line in stamped]
    else:
        start = lines.index("metadata:") + 1
        stop = start
        while stop < len(lines) and lines[stop][:1] in (" ", "\t"):
            stop += 1
        children = [line.strip() for line in lines[start:stop]]
        children = [child for child in children if not child.startswith("github-")]
        if not all(SIMPLE_CHILD.match(child) for child in children):
            raise Stop(f"skills/{name}/SKILL.md metadata must be one `key: value` per line")
        lines[start:stop] = [f"    {line}" for line in sorted(children + stamped)]
    # GitHub CLI drops blank lines between the frontmatter and the body.
    body = text[end + len("\n---"):].lstrip("\n")
    return "---\n" + "\n".join(lines) + "\n---\n" + body


def stamps(manifest: Path) -> dict[str, str]:
    try:
        return dict(STAMP.findall(manifest.read_text(errors="replace")))
    except OSError:
        return {}


def ours(manifest: Path) -> bool:
    return stamps(manifest).get("github-repo") == f"https://github.com/{REPOSITORY}"


def plan_install(catalog: dict[str, tuple[str, list[str]]], shared: Path, commit: str,
                 full: bool) -> tuple[list[str], list[str], list[str], list[str]]:
    """Sort the catalog into trees to replace, manifests to restamp, and foreign clashes.

    Also returns the retired trees: installed copies of ours the catalog no longer ships.
    """
    replace, restamp, foreign = [], [], []
    for name, (tree, _) in sorted(catalog.items()):
        target = shared / name
        found = stamps(target / "SKILL.md")
        if target.is_symlink() or (target.exists() and not ours(target / "SKILL.md")):
            foreign.append(name)
        elif full or found.get("github-tree-sha") != tree:
            replace.append(name)
        elif found.get("github-pinned") != commit or found.get("github-ref") != commit:
            restamp.append(name)
    retired = sorted(tree.name for tree in shared.iterdir() if tree.name not in catalog
                     and not tree.is_symlink() and ours(tree / "SKILL.md")) if shared.is_dir() else []
    return replace, restamp, foreign, retired


def write_atomically(path: Path, text: str) -> None:
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(text)
    temporary.replace(path)


def install_tree(provider: Path, shared: Path, name: str, files: list[str], commit: str,
                 tree: str) -> None:
    """Build the new copy beside the old one, then swap them."""
    source = provider / "skills" / name
    staging = shared / f".{name}.installing"
    shutil.rmtree(staging, ignore_errors=True)
    for relative in files:
        destination = staging / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        if relative == "SKILL.md":
            destination.write_text(stamp((source / relative).read_text(), name, commit, tree))
        else:
            shutil.copy2(source / relative, destination)
    target = shared / name
    replaced = shared / f".{name}.replaced"
    shutil.rmtree(replaced, ignore_errors=True)
    if target.exists():
        target.rename(replaced)
    staging.rename(target)
    shutil.rmtree(replaced, ignore_errors=True)


def archive_retired(shared: Path, retired: list[str], commit: str) -> Path | None:
    """Move retired copies out of every discovery root, where they stay recoverable."""
    if not retired:
        return None
    archive = (Path.home() / ".local" / "state" / "dotfiles" / "agent-skills-archives"
               / datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%S.%fZ"))
    archive.mkdir(parents=True, mode=0o700)
    for name in retired:
        shutil.move(shared / name, archive / name)
    (archive / "manifest.json").write_text(json.dumps(
        {"repository": REPOSITORY, "target_commit": commit, "skills": retired}, indent=2) + "\n")
    return archive


def plan_links(catalog: set[str], shared: Path, claude: Path,
               retired: set[str] = frozenset()) -> tuple[list[str], list[str], list[str]]:
    """Plan `claude/<name> -> shared/<name>` links: names to add, remove, and leave alone.

    A link into `shared` for a skill outside the catalog is removed when its
    target is gone or is about to be archived. An entry that is anything other
    than the expected link is left alone.
    """
    if not claude.is_dir():
        return [], [], []
    add, conflicts = [], []
    for name in sorted(catalog):
        link = claude / name
        if link.is_symlink() and Path(os.readlink(link)) == shared / name:
            continue
        if link.is_symlink() or link.exists():
            conflicts.append(name)
        else:
            add.append(name)
    remove = sorted(
        link.name for link in claude.iterdir()
        if link.is_symlink() and link.name not in catalog
        and Path(os.readlink(link)).parent == shared
        and (not link.exists() or link.name in retired)
    )
    return add, remove, conflicts


def update_pin(path: Path, commit: str) -> bool:
    """Point the dotfiles lock at `commit`; return whether the file changed."""
    import tomllib
    original = path.read_text()
    lock = tomllib.loads(original)
    if lock.get("repository") != REPOSITORY or lock.get("directory") != ".agents/skills":
        raise Stop("Unexpected dotfiles catalog source or destination")
    updated, count = re.subn(r'^commit = "[0-9a-f]{40}"$', f'commit = "{commit}"',
                             original, flags=re.MULTILINE)
    if count != 1:
        raise Stop("Expected exactly one full commit pin")
    if updated != original:
        write_atomically(path, updated)
    return updated != original


def show_timings(path: Path, provider: Path, consumer: Path, count: int = 15) -> None:
    if not path.is_file():
        sys.exit(f"No timings yet at {path}; run `just install` first.")
    records = [json.loads(line) for line in path.read_text().splitlines() if line]
    print(format_history(records[-count:]))
    print(f"\nLatest run: {format_run(records[-1])}\nSource: {path}")
    print(f"\nLatest publish: {format_publish(last_publish(path.parent))}")
    # The log holds only publishes that finished, so the refs say whether one is still owed.
    ahead = unpublished(provider, consumer)
    if ahead:
        print(f"Unpublished: {', '.join(ahead)} HEAD is not on origin; "
              + ("a publish is in progress." if locked(path.parent / PUSH_LOCK) else
                 "no publish is running, so the last one stopped early. Run `just install`."))


def install(args: argparse.Namespace, common: Path, provider: Path, consumer: Path,
            timeline: Timeline, publish_failed: bool, publishing: bool) -> None:
    home = Path.home()
    shared = home / ".agents" / "skills"
    claude = home / ".claude" / "skills"
    with timeline.span("read state"):
        ((provider_branch, commit, provider_ahead), (consumer_branch, _, consumer_ahead),
         dirty) = together(lambda: read_head(provider), lambda: read_head(consumer),
                           lambda: git(provider, "status", "--porcelain"))
        if dirty or provider_ahead or consumer_ahead:
            warm_connection(provider)
    if (provider_ahead or consumer_ahead) and not publishing and not publish_failed:
        owed = [label for label, ahead in (("catalog", provider_ahead), ("dotfiles", consumer_ahead))
                if ahead]
        print(f"Warning: {', '.join(owed)} HEAD was not on origin and no publish was running; "
              "an earlier publish may have stopped early.\nThis run publishes it.", flush=True)
    message = commit_catalog(provider, args.message, timeline) if dirty else None
    with timeline.span("plan"):
        if dirty:
            commit, provider_ahead = git(provider, "rev-parse", "HEAD"), True
        catalog = catalog_at_head(provider)
        replace, restamp, foreign, retired = plan_install(catalog, shared, commit, args.full)
    published, clock = utc_now(), time.perf_counter()
    running = []
    # With --wait the catalog push runs beside everything local. Without it the
    # detached publisher owns both pushes, so this run holds no pipe to a child
    # it will not wait for.
    if args.wait and provider_ahead:
        running.append(("catalog", provider, start_push(provider, provider_branch),
                        time.perf_counter()))

    def install_skills() -> tuple[Path | None, list[str], list[str], list[str]]:
        with timeline.span("install"):
            shared.mkdir(parents=True, exist_ok=True)
            together(
                *[lambda name=name: install_tree(provider, shared, name, catalog[name][1], commit,
                                                 catalog[name][0]) for name in replace],
                *[lambda name=name: write_atomically(shared / name / "SKILL.md", stamp(
                    (provider / "skills" / name / "SKILL.md").read_text(), name, commit,
                    catalog[name][0])) for name in restamp])
            archive = archive_retired(shared, retired, commit)
        with timeline.span("links"):
            add, remove, conflicts = plan_links(set(catalog), shared, claude)
            for name in remove:
                (claude / name).unlink()
            for name in add:
                (claude / name).symlink_to(shared / name)
        return archive, add, remove, conflicts

    def commit_pin() -> bool:
        with timeline.span("pin (parallel)"):
            if (update_pin(consumer / LOCK_FILE, commit)
                    or git(consumer, "status", "--porcelain", LOCK_FILE)):
                git(consumer, "commit", "-q", "-m", "chore(skills): advance catalog pin",
                    "--", LOCK_FILE)
                return True
        return False

    (archive, add, remove, conflicts), pinned = together(install_skills, commit_pin)
    consumer_ahead = consumer_ahead or pinned
    timeline.installed_at = round(time.perf_counter() - timeline.started, 4)
    if args.wait:
        # Both pushes overlap: waiting for the catalog before pushing the pin would
        # double the network time. If the catalog push is rejected while the pin
        # lands, dotfiles names an unpublished commit until the next run pushes it.
        if consumer_ahead:
            running.append(("dotfiles", consumer, start_push(consumer, consumer_branch),
                            time.perf_counter()))
        seconds, errors = finish_pushes(running)
        timeline.spans += [{"step": f"push {label} (parallel)", "ok": label not in errors,
                            "seconds": spent} for label, spent in seconds.items()]
        if running:
            save_publish(common, published, clock, commit, seconds, errors)
        if errors:
            raise Stop("; ".join(errors.values()))
    stale = plan_install(catalog, shared, commit, False)
    if stale[0] or stale[1] or stale[3] or plan_links(set(catalog), shared, claude)[1]:
        raise Stop(f"Global skills did not converge: replace {stale[0]}, restamp {stale[1]}, "
                   f"retired {stale[3]}")
    # Only this run adds commits, so nothing is unpushed unless it saw or made one. A
    # publisher from an earlier run may have pushed since, so ask again before starting another.
    pending = (not args.wait and (provider_ahead or consumer_ahead)
               and (read_head(provider)[2] or read_head(consumer)[2]))
    if pending:
        spawn_publisher(common, consumer)
    elif publish_failed and not running:
        # Everything is on origin, so the failure the last record reports is over.
        save_publish(common, published, clock, commit, {}, {})
    print(f"Installed {REPOSITORY}@{commit[:12]}: {len(catalog)} skills.\n"
          f"  commit: {message or 'nothing to commit'}\n"
          f"  replaced: {some(replace)}; restamped: {len(restamp)}\n"
          f"  archived: {some(retired)}{f' at {archive}' if archive else ''}\n"
          f"  links: added {some(add)}; removed {some(remove)}"
          + (f"\n  left alone: {some(sorted(set(foreign + conflicts)))}" if foreign or conflicts else "")
          + ("\nPublishing continues in the background; `just install --timings` shows the result."
             if pending else ""))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-m", "--message", help="Commit message (default: derived from the paths)")
    parser.add_argument("--dotfiles", type=Path,
                        help="Consumer checkout (default: dotfiles beside the main checkout)")
    parser.add_argument("--full", action="store_true",
                        help="Rewrite every installed skill, not only the changed ones")
    parser.add_argument("--timings", action="store_true",
                        help="Show step timings of recent runs and the latest publish, then exit")
    parser.add_argument("--wait", action="store_true",
                        help="Push before exiting, and fail when a push fails")
    parser.add_argument("--publish", type=int, metavar="QUEUE_FD", help=argparse.SUPPRESS)
    args = parser.parse_args()
    timeline = Timeline()
    provider = Path(__file__).resolve().parents[1]
    common = Path(git(provider, "rev-parse", "--path-format=absolute", "--git-common-dir"))
    consumer = (args.dotfiles or common.parent.parent / "dotfiles").resolve()
    if args.timings:
        show_timings(common / TIMINGS_FILE, provider, consumer)
        return
    if args.publish is not None:
        publish(common, provider, consumer, args.publish)
        return
    last = last_publish(common)
    publish_failed = bool(last) and last["outcome"] == "failed"
    if publish_failed:
        print(f"Warning: the last publish ({last['started'][:19]} UTC) failed: {last['error']}\n"
              "This run retries it.", flush=True)
    outcome = "failed"
    try:
        with (common / "install.lock").open("a") as handle:
            try:
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise Stop("another install is running") from None
            # Only a run holding install.lock takes the queue lock, so this probe meets no other.
            publishing = locked(common / QUEUE_LOCK) or locked(common / PUSH_LOCK)
            waiting = (f"Waiting for the publish in progress; a push is stopped after "
                       f"{PUSH_TIMEOUT:g}s.")
            with push_lock(common, waiting) if args.wait else nullcontext():
                install(args, common, provider, consumer, timeline, publish_failed, publishing)
        outcome = "ok"
    finally:
        record = timeline.record(outcome)
        try:
            with (common / TIMINGS_FILE).open("a") as history:
                history.write(json.dumps(record) + "\n")
        except OSError as error:  # Telemetry must not hide the run's own outcome.
            print(f"Timings not saved: {error}")
        print(format_run(record))


if __name__ == "__main__":
    try:
        main()
    except (Stop, OSError, subprocess.CalledProcessError) as error:
        sys.exit(f"Stopped: {error}. Completed steps remain; rerun after resolving it.")
