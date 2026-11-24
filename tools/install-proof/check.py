# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check the install-plan proof, then check that the Lean model and tools/install.py agree.

The proof covers the model in `lean/InstallPlan.lean`. This run builds real skill
directories in a temp home, runs the script's own planning and install functions on
them, and compares every decision and the resulting state with the model. That
comparison is what ties the proof to the code.
"""
import importlib.util
import itertools
import os
import random
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LEAN = HERE / "lean"
os.environ.setdefault("GIT_SSH_COMMAND", "ssh")  # Importing the script must not set up SSH.
SPEC = importlib.util.spec_from_file_location("install", HERE.parent / "install.py")
install = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(install)

OURS = f"https://github.com/{install.REPOSITORY}"
STAMPS = ("github-tree-sha", "github-pinned", "github-ref")
NUMBERS = ["-", "1", "2"]
TREES = ["-", "f", "s"] + [f"o:{t}:{p}:{r}" for t in NUMBERS for p in NUMBERS for r in NUMBERS]
LINKS = ["-", "e", "a", "d", "x", "y", "z"]


def sha(number: str) -> str:
    return f"{int(number):040x}"


def requests(rng: random.Random) -> list[str]:
    """Every single-name situation over a small domain, then random catalogs of several names."""
    asked = [f"{full} {commit} ; 1 {want} {tree} {link}"
             for full, commit, want, tree, link
             in itertools.product("01", "12", NUMBERS, TREES, LINKS)]
    for _ in range(600):
        names = rng.sample(range(1, 9), rng.randint(2, 6))
        groups = [f"{name} {rng.choice(NUMBERS)} {rng.choice(TREES)} {rng.choice(LINKS)}"
                  for name in names]
        asked.append(" ; ".join([f"{rng.choice('0001')} {rng.choice('123')}", *groups]))
    return asked


def create_fixture_link(link: Path, target: Path) -> None:
    missing = install.WINDOWS and not target.exists()
    if missing:
        target.mkdir()
    install.create_directory_link(link, target)
    if missing:
        target.rmdir()


def build(root: Path, groups: list[list[str]]) -> tuple[Path, Path, Path, dict]:
    """Lay out the provider checkout and both global directories that a request describes."""
    provider, shared, claude = root / "provider", root / "home/.agents/skills", root / "home/.claude/skills"
    for folder in (provider, shared, claude, root / "outside"):
        folder.mkdir(parents=True)
    catalog = {}
    for number, want, tree, link in groups:
        name = f"skill-{number}"
        if want != "-":
            source = provider / "skills" / name
            source.mkdir(parents=True)
            (source / "SKILL.md").write_text(f"---\nname: {name}\ndescription: d\n---\nBody.\n")
            catalog[name] = (sha(want), ["SKILL.md"])
        if tree == "f":
            (shared / name).mkdir()
            (shared / name / "SKILL.md").write_text(f"---\nname: {name}\n---\nForeign.\n")
        elif tree == "s":
            create_fixture_link(shared / name, root / "outside")
        elif tree != "-":
            lines = [f"    github-repo: {OURS}"] + [
                f"    {key}: {sha(value)}" for key, value in zip(STAMPS, tree.split(":")[1:])
                if value != "-"]
            (shared / name).mkdir()
            (shared / name / "SKILL.md").write_text(
                "\n".join(["---", f"name: {name}", "metadata:", *lines, "---", "Old.", ""]))
        if link == "e":
            create_fixture_link(claude / name, shared / name)
        elif link == "a":
            (shared / f"alive-{number}").mkdir()
            create_fixture_link(claude / name, shared / f"alive-{number}")
        elif link == "d":
            create_fixture_link(claude / name, shared / f"dead-{number}")
        elif link == "x":
            (claude / name).mkdir()
        elif link == "y":
            create_fixture_link(claude / name, root / "outside")
        elif link == "z":
            create_fixture_link(claude / name, root / "missing")
    return provider, shared, claude, catalog


def read_tree(path: Path) -> str:
    if not path.exists() and not install.is_link(path):
        return "-"
    if install.is_link(path) or not install.ours(path / "SKILL.md"):
        return "f"
    found = install.stamps(path / "SKILL.md")
    return "o:" + ":".join(str(int(found[key], 16)) if key in found else "-" for key in STAMPS)


def read_link(path: Path, shared: Path) -> str:
    if not path.exists() and not install.is_link(path):
        return "-"
    if install.is_link(path) and install.link_target(path) == shared / path.name:
        return "e"
    if install.is_link(path) and install.link_target(path).parent == shared:
        return "a" if path.exists() else "d"
    return "x"


def python_answer(request: str) -> str:
    head, *rest = request.split(" ; ")
    full, commit = head.split()
    groups = [group.split() for group in rest]
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        provider, shared, claude, catalog = build(root, groups)
        os.environ["HOME"] = str(root / "home")
        if install.WINDOWS:
            os.environ["USERPROFILE"] = os.environ["HOME"]
        replace, restamp, foreign, retired = install.plan_install(
            catalog, shared, sha(commit), full == "1")
        for name in replace:
            install.install_tree(provider, shared, name, catalog[name][1], sha(commit), catalog[name][0])
        for name in restamp:
            install.write_atomically(shared / name / "SKILL.md", install.stamp(
                (provider / "skills" / name / "SKILL.md").read_text(), name, sha(commit),
                catalog[name][0]))
        install.archive_retired(shared, retired, sha(commit))
        add, remove, conflicts = install.plan_links(set(catalog), shared, claude)
        for name in remove:
            install.remove_directory_link(claude / name)
        for name in add:
            install.create_directory_link(claude / name, shared / name)
        answers = []
        for number, *_ in groups:
            name = f"skill-{number}"
            decided = [label for label, names in (("replace", replace), ("restamp", restamp),
                                                  ("leave", foreign), ("archive", retired))
                       if name in names] or ["nothing"]
            linked = [label for label, names in (("add", add), ("remove", remove),
                                                 ("leave", conflicts)) if name in names] or ["nothing"]
            answers.append(" ".join([number, "+".join(decided), read_tree(shared / name),
                                     "+".join(linked), read_link(claude / name, shared)]))
        return " ; ".join(answers)


def main() -> int:
    built = subprocess.run(["lake", "build", "--wfail"], cwd=LEAN)
    if built.returncode != 0:
        print("FAIL: the Lean proof does not build")
        return 1
    asked = requests(random.Random(0))
    model = subprocess.run([LEAN / ".lake/build/bin/model"], input="\n".join(asked) + "\n",
                           capture_output=True, text=True, check=True).stdout.splitlines()
    if len(model) != len(asked):
        print(f"FAIL: the model answered {len(model)} of {len(asked)} requests")
        return 1
    home_variables = {name: os.environ.get(name) for name in ("HOME", "USERPROFILE")}
    try:
        for request, expected in zip(asked, model):
            actual = python_answer(request)
            if actual != expected:
                print(f"FAIL: on `{request}` the model gives `{expected}` "
                      f"and install.py gives `{actual}`")
                return 1
    finally:
        for name, original in home_variables.items():
            if original is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = original
    print(f"PASS: proof builds; model and install.py agree on {len(asked)} situations")
    return 0


if __name__ == "__main__":
    sys.exit(main())
