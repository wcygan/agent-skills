---
name: terra
description: "Run a task with a GPT-5.6 Terra worker and primary-session verification. Use when the user invokes terra or explicitly requests supervised Terra execution."
license: MIT
compatibility: Requires delegate-and-verify and subagent support for gpt-5.6-terra.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Terra

Read [delegate-and-verify](../delegate-and-verify/SKILL.md), set
`worker_model = gpt-5.6-terra`, and execute the current task under that workflow.

If the relative parent path is unavailable, locate `delegate-and-verify` in the
available skill catalog. If it is missing, report the required dependency
before dispatch; install this entry point together with its parent skill.
