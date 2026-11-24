---
name: just
description: "Design and troubleshoot justfile command workflows, including recipes, parameters, dependencies, modules, shells, dotenv, and working directories. Use when changing or diagnosing a project's just commands."
license: MIT
compatibility: Requires just. Verify version-sensitive syntax against the installed command.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# just recipes

Treat the active `justfile` as the project's command interface. Give public
recipes stable outcome names and help comments. Make the default safe to run.
Keep recipes thin and put complex logic in the underlying command or a tested
script.

- Discover recipes with `just --list` and inspect a target with `just --show <recipe>`.
  Read unfamiliar recipes, dependencies, and called commands before execution. Even `--evaluate` and `--dry-run` can execute command
  substitutions. Confirm authorization for any deploy, publish, or destructive
  action they would trigger.
- Use recipe parameters for caller input and environment variables for
  configuration. Pass arbitrary values through exported parameters or
  positional arguments. Keep secrets out of substitutions and echoed commands.
  Load dotenv files explicitly. Require the file when execution depends on it.
- Pass dependency arguments explicitly. Parallelize only independent
  dependencies. Use imports for a shared namespace and modules for separate
  command groups.
- Plain recipe lines run in separate shells. Use a shebang recipe when commands
  share shell state. For a single directory-bound command, use
  `cd <directory> && <command>` on one line.

Consult the [manual index](references/manual.md) for exact syntax and compare
version-sensitive features with the project's minimum supported `just` version.

Verify the changed contract through `just` with representative inputs. Check
argument forwarding and exit status when the wrapper affects them. Use
`just --fmt --check` to check formatting.
