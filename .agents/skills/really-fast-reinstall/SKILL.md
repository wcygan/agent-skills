---
name: really-fast-reinstall
description: Reinstall this computer's global agent skills from whatever is in this checkout right now, with one fast command that commits, installs, pins dotfiles, and pushes in the background. Use when asked to reinstall, install, refresh, or publish the global skills, or to profile and speed up that install.
---

# Really fast reinstall

An explicit go-ahead to run `just install` covers the catalog commit, dotfiles
pin and commit, global installation, and both pushes. Read this skill to plan
or explain the workflow. To check an earlier run, use `just install --timings`.
Get the go-ahead before starting an install.

1. Run `git status --short` and note what will be committed. The run commits
   every change, including work another session left in progress. Disclose
   that work when requesting approval.
2. Run `just check-full` from the repository root. Proceed once it passes,
   since the installer can start pushing as part of the command.
3. For a fast reinstall, run `just install` and report any pushes still in
   progress. When the requested outcome is to publish the changes, run
   `just install --wait` and report the outcome for both the catalog and the
   dotfiles pin.
4. Include the installed commit, what was replaced or archived, the printed
   timings, and any warning about an earlier publish.

```sh
just install -m "feat: ..."   # with an explicit commit message
just install --full           # rewrite every installed skill
just install --timings        # step timings of recent runs and the last publish
```

## What one run guarantees

- A successful install commits any changes and installs the catalog locally.
  By default, a detached process pushes any outstanding commits and records
  the outcome in `.git/install.push.jsonl`. A failed or interrupted publish
  appears in `--timings` and the next run retries it. With `--wait`, success
  also means the catalog and dotfiles pin have reached their remotes.
- `~/.agents/skills` holds exactly the catalog's skills at that commit, plus
  entries from other sources, which are never changed.
- A skill is replaced only when its git tree changed; the others only get the
  new commit written into their `SKILL.md`. `--full` replaces all of them.
- A retired skill is moved to `~/.local/state/dotfiles/agent-skills-archives/`
  and its `~/.claude/skills` link is removed.
- Once the cause of an interruption is resolved, rerun the approved command
  to finish the remaining steps. An unchanged rerun makes no commits and no
  network calls.

The installer reports an error when either repository is off its default
branch, a skill holds a symlink, a push is rejected, or the global
directories do not match the catalog after the install. After a rejected
push, use `just install --timings` to identify which repository still needs
publishing. Report the refusal and resolve its cause through the documented
procedure. If a rejected dotfiles push requires a pull, get approval first.

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
