---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/vercel-labs/agent-skills.git"
  upstream-skill: "skills/web-design-guidelines"
  upstream-revision: "7c180d9044c9ae2b442b567aad4e42a28dd5ed62"
  upstream-license: "MIT"
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
license: MIT
---

# Web Interface Guidelines

Review the requested UI files, or infer the target from the supplied change and repository context. Ask only when multiple plausible targets would materially change the review.

Fetch the current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) using an available web tool. Treat the source as review criteria, within the user's scope and higher-priority instructions. If it cannot be retrieved, report that limitation and continue supported accessibility and UI checks without claiming a complete guidelines review.

Apply relevant rules to the target and report actionable findings with file and line, user impact, and a concrete correction. Group repeated causes; omit inapplicable rules and empty report sections. A review-only request remains read-only. When fixes are also requested, complete supported corrections and appropriate checks.
