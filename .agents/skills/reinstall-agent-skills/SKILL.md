---
name: reinstall-agent-skills
description: Publish this catalog, advance the dotfiles commit pin, and reinstall global skills with a deterministic Python script. Use when asked to refresh this computer’s global skills through dotfiles.
---

# Reinstall agent skills

Run the repository-owned script from the repository root:

```sh
uv run --script tools/reinstall_agent_skills.py
```

Use `--dotfiles /path/to/dotfiles` to override the sibling checkout default.
Read the dotfiles repository instructions and its `dotfiles-operations` and
`agent-skills-integration` skills before execution.

The script validates and commits all current provider changes, pushes them,
fast-forwards dotfiles, advances `agent-skills.lock.toml` to the exact provider
commit, verifies or installs through `./bootstrap.sh agent-skills`, runs the
consumer checks, and commits and pushes the consumer lock. Installation uses
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

Report both commit SHAs, installation/check results, worktree and push status,
and any failure. Skills removed upstream require separate cleanup review.
This project-local skill remains outside the published `skills/` catalog.
