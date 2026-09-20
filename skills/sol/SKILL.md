---
name: sol
description: "Run a task with a GPT-5.6 Sol worker and primary-session verification. Use when the user invokes sol or explicitly requests supervised Sol execution."
license: MIT
compatibility: Requires delegate-and-verify and subagent support for gpt-5.6-sol.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Sol

Read [delegate-and-verify](../delegate-and-verify/SKILL.md), set
`worker_model = gpt-5.6-sol`, and execute the current task under that workflow.

If the relative parent path is unavailable, locate `delegate-and-verify` in the
available skill catalog. If it is missing, report the required dependency
before dispatch; install this entry point together with its parent skill.
