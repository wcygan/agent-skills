---
name: install-agent-skills
description: Commit and push this catalog, pin it in dotfiles, and install it into the global skill directories with one fast command. Use when asked to install, refresh, or publish this computer's global skills, or to profile and speed up that install.
---

# Install agent skills

Run from the repository root:

```sh
just install                  # commit, push, pin, install
just install -m "feat: ..."   # with an explicit commit message
just install --full           # rewrite every installed skill
just install --timings        # step timings of recent runs
```

The script is `tools/install.py`, a dependency-free uv script. It commits
everything in the checkout, so read `git status` first; a request to install
authorizes the commit, both pushes, the pin, and the global changes.

## What one run guarantees

- The catalog and the dotfiles pin that names it are pushed at the same time.
  A run that exits 0 published both. A rejected catalog push fails the run
  while the pin may already be published; rerun after resolving it.
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

## Profile

Every run prints its step timings and appends them to
`.git/install.timings.jsonl`. `just install --timings` shows recent runs side
by side. Pushes dominate; the script reuses one SSH connection for ten minutes
through a control socket in `~/.cache/agent-skills`, so the first run after a
pause is slower than the next.

Independent work runs at once: the catalog push beside the local install and
the pin commit, the two pushes beside each other, the skill copies beside each
other, and the opening git reads of both repositories. Steps marked
`(parallel)` in the timings overlap others, so the shares can exceed 100%.

This project-local skill is not part of the published `skills/` catalog.
