---
name: wcygan-mode
description: "Own an engineering task through the requested handoff. Use for features, refactors, debugging, engineering questions, coordination, workflow changes, or a named engineering principle."
license: MIT
metadata:
  kind: orchestrator
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8
  upstream-path: pstack/skills/poteto-mode
  upstream-author: Lauren Tan
  maintenance: local
---

# Wcygan mode

Work to the user's requested outcome and destination. For a focused request,
open its method directly. For multi-step work, choose the smallest matching
playbook. Consult the [principle index](references/principles.md) for substantive
engineering decisions or when the user names a rule by title or former
`principle-*` skill name. Open the matching rule.

Honor explicit checkpoints and continue through every stage already requested.
Use project commands when a specialist is unavailable. If its artifact requires
a missing tool, identify that dependency.

## Focused requests

- [Clarify or restate a goal](references/methods/clarify-task.md), [compare designs](references/methods/design-options.md), or [assess downstream impact](references/methods/assess-impact.md).
- [Reproduce a bug](references/methods/reproduce-bug.md) when the user wants a failing example only.
- [Review a workflow](references/methods/improve-workflow.md), [capture working preferences](references/methods/personalize-workflow.md), or [remove implementation comments](references/methods/no-comments.md).
- [Report status](references/methods/progress-report.md), [record a decision](references/methods/decision-log.md), or [hand off completed work](references/methods/deliver-change.md).

## Playbooks

| Task | Choose the requested outcome |
| --- | --- |
| Understand | [Trace behavior or history](playbooks/investigation.md) · [explain with a visual](playbooks/technical-explanation.md) |
| Change code | [Fix a bug](playbooks/bug-fix.md) · [build a feature](playbooks/feature.md) · [refactor](playbooks/refactoring.md) · [test a design with a prototype](playbooks/prototype.md) |
| Measure | [Benchmark or fix a slowdown](playbooks/perf-issue.md) · [optimize toward a target](playbooks/iterative-optimization.md) · [check visual and interaction parity](playbooks/visual-parity.md) |
| Change agent behavior | [Author a skill](playbooks/authoring-a-skill.md) · [evaluate an instruction change](playbooks/eval.md) |
| Plan or coordinate | [Discover, prepare, or sustain an ambitious outcome](playbooks/ambitious-outcome.md) · [plan dependent work](playbooks/multi-phase-plan.md) · [coordinate a program](playbooks/coordinate-program.md) |
| Execute | [Drive one bounded task to completion](playbooks/autonomous-run.md) · [run independent changes](playbooks/execute-independent-changes.md) · [prepare a dependent sequence for another owner](playbooks/prepare-dependent-changes.md) |
| Deliver | [Draft or open a PR](playbooks/propose-change.md) · [inspect or watch a change](playbooks/monitor-change.md) · [land verified changes](playbooks/shipping.md) |
| Manage a workspace or session | [Audit worktrees](playbooks/worktree-cleanup.md) · [resume prior work](playbooks/session-pickup.md) · [checkpoint a pause](playbooks/pause-safely.md) |

## Decisions and delivery

Resolve factual uncertainty from available evidence. Make reversible assumptions
within scope. Leave undelegated product and preference choices to the user.
When [delegating](references/methods/coordinate-work.md), give each write target
one owner and inspect the resulting work.

Get a go-ahead before committing, pushing, opening or merging a PR, deploying,
publishing a package, or posting in the user's name. Use existing approval for
the action it covers. Reads, tests, builds, and local scratch work can proceed.

Work through ordinary failures. Respect deliberately withheld access, protected
files, and safety guards. Finish independent work and report any blocker that
still prevents delivery. At a phase boundary, report material progress. At handoff,
give the result, the evidence for it, and any remaining gaps or next action.

[Pstack license and attribution](references/LICENSE.txt) · [Local contributions license](references/LOCAL-LICENSE.txt)
