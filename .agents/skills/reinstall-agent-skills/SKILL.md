---
name: reinstall-agent-skills
description: Publish this catalog, advance the dotfiles commit pin, and reinstall global skills with a deterministic Python script. Use when asked to refresh this computer’s global skills through dotfiles.
---

# Reinstall agent skills

Run the repository-owned script from the repository root:

```sh
just reinstall                         # dry run; changes nothing
just reinstall --apply                 # publish, pin, and install
# For an explicitly requested full shared-user reset:
just reinstall --apply --reset-global
```

Run the dry run first and report its plan. The script refuses unless both
repositories are on their default branch, so land the reviewed change on the
default branch before `--apply`; never hand-copy skills into global directories
as a substitute.

Use `--dotfiles /path/to/dotfiles` to override the default, a `dotfiles`
checkout beside the main repository checkout (worktrees resolve to the same).
Read the dotfiles repository instructions and its `dotfiles-operations` and
`agent-skills-integration` skills before execution.

With `--apply`, the script regenerates `catalog-snapshot.json` with `just catalog-snapshot`,
then validates with `just check-full`, commits all current provider changes,
pushes them, fast-forwards dotfiles, advances `agent-skills.lock.toml` to the exact provider
commit, verifies or installs through `./bootstrap.sh agent-skills`, runs the
consumer checks, and commits and pushes the consumer lock. Changed catalogs use
`agent-skills --prune` to archive retired provider-owned copies outside discovery
roots. `--reset-global` authorizes archiving every other shared user skill and
passes `agent-skills --reset --yes`. Installation uses
GitHub CLI through dotfiles, including its collision checks and journal.

A request to run this workflow authorizes both repositories’ commits and
pushes, the consumer pin update, and global installation. Inspect provider
changes first: all tracked and untracked non-ignored changes are included.
A request to explain the workflow is read-only.

Reruns create commits only for changed content and skip installation when the
pinned catalog already verifies. Interrupted runs preserve completed steps;
the script accepts a lock-only pending consumer change when its HEAD matches
the remote. Resolve divergence, unrelated consumer changes, collisions, or
pending installer recovery before rerunning. The workflow spans two Git
repositories and machine state; it is resumable rather than atomic.

Report both commit SHAs, installation/check results, archive paths, worktree and
push status, and any failure. Preserve unrelated dotfiles work; use a clean
consumer checkout when the primary checkout contains unrelated edits.
This project-local skill remains outside the published `skills/` catalog.
