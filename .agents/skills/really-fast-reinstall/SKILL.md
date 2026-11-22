---
name: really-fast-reinstall
description: Reinstall this computer's global agent skills from whatever is in this checkout right now, with one fast command that commits, installs, pins dotfiles, and pushes in the background. Use when asked to reinstall, install, refresh, or publish the global skills, or to profile and speed up that install.
---

# Really fast reinstall

Invoking this skill is the go-ahead to run the install now, with the checkout
as it is:

1. Run `git status --short` and note what will be committed. The run commits
   every change, including work another session left in progress.
2. Run `just install` from the repository root. Pass `-m "..."` when the
   changes deserve a message better than the one derived from the paths.
3. Report the commit, what was replaced or archived, and the printed timings.
   If the run opens with a warning about an earlier publish, relay it.

```sh
just install                  # commit, install, pin; push in the background
just install -m "feat: ..."   # with an explicit commit message
just install --wait           # push before exiting; fail on a rejected push
just install --full           # rewrite every installed skill
just install --timings        # step timings of recent runs and the last publish
```

The script is `tools/install.py`, a dependency-free uv script. The go-ahead
covers the commit, both pushes, the pin, and the global changes.

## What one run guarantees

- A run that exits 0 has installed the skills and committed both repositories.
  Both pushes then run at the same time in a detached publisher, recorded in
  `.git/install.push.jsonl`. A failed or interrupted publish is reported by the
  next run and by `--timings`, and the next run retries it. With `--wait`, a
  run that exits 0 has published both.
- `~/.agents/skills` holds exactly the catalog's skills at that commit, plus
  entries from other sources, which are never changed.
- A skill is replaced only when its git tree changed; the others only get the
  new commit written into their `SKILL.md`. `--full` replaces all of them.
- A retired skill is moved to `~/.local/state/dotfiles/agent-skills-archives/`
  and its `~/.claude/skills` link is removed.
- A rerun after any failure finishes the remaining steps; an unchanged rerun
  makes no commits and no network calls.

The script stops, changing nothing further, when either repository is off its
default branch, a skill holds a symlink, a push is rejected, or the global
directories do not match the catalog after the install. Report the message. A
rejected dotfiles push means another commit landed there: pull it, then rerun.

## Verify

`./bootstrap.sh agent-skills --check` in dotfiles audits the installed copies
against the pinned commit on GitHub. It takes about nine seconds, so it is not
part of the install; run it after changing `tools/install.py`.

`just verify-install` checks a Lean proof that one run leaves exactly the
catalog's skills, never changes an entry from another source, and leaves
nothing for a second run to do. It then compares the proved model with the
script's own planning and install functions on 3,120 generated situations. Run
it after changing `plan_install`, `plan_links`, `install_tree`, `stamp`, or
`archive_retired`; it needs elan and takes a few seconds.

## Profile

Every run prints its step timings and appends them to
`.git/install.timings.jsonl`. `just install --timings` shows recent runs side
by side. Pushes dominate; the script reuses one SSH connection for ten minutes
through a control socket in `~/.cache/agent-skills`, so the first run after a
pause is slower than the next.

Independent work runs at once: the two pushes beside each other, the pin
commit beside the install, the skill copies beside each other, and the opening
git reads of both repositories. Steps marked `(parallel)` in the timings
overlap others, so the shares can exceed 100%. A push is stopped after 120
seconds (`AGENT_SKILLS_PUSH_TIMEOUT` changes that).

This project-local skill is not part of the published `skills/` catalog.
