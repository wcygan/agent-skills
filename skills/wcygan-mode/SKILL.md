---
name: wcygan-mode
description: "Own an engineering task from framing through verification and delivery. Use when asked to work in wcygan-mode or coordinate an end-to-end task with the catalog procedures."
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

Own the requested outcome. Establish scope, acceptance evidence, and the requested
destination; preserve prior authorization and explicit checkpoints across phases.

1. Apply the ambition check below, then select and read the smallest relevant
   playbook. Load its linked procedures and components only when their conditions
   apply; reuse existing evidence.
2. Investigate observable uncertainty before asking the user to guess. Product and
   preference decisions remain with the user unless already delegated.
3. Prefer simple structures and small verifiable units. Use available tools and
   independent execution where useful; state unavailable capabilities honestly.
4. Keep one owner per shared write target. Inspect delegated artifacts and evidence;
   a report alone does not establish completion. Revisit design when assumptions fail.
5. Record consequential decisions for long work. Reconcile current state on pickup
   and preserve a durable checkpoint on pause. Scheduling is an external capability.
6. Compare the final result with the original goal. Report verified outcomes, gaps,
   and the confirmed delivery state. Stop at the requested destination.

## Exercise ambition by default

On every substantive task, consider the outcome beyond the requested mechanism,
the assumption limiting it, and a stronger method or tool that could improve it.
Look for ways to eliminate work, prevent a class of failures, or materially improve
the user experience. Scale this check to the task; a small edit may need only a
brief consideration, with no extra artifact. State the opportunity when it changes
the approach or presents a meaningful choice.

Pursue promising approaches within the authorized goal and budget. Propose broader
product changes without silently adopting them. Ambition can mean a simpler solution
or deeper proof; it does not require more features, agents, or infrastructure.
Treat stretch targets as hypotheses, keep acceptance criteria honest, and revisit
assumptions when evidence suggests the current approach cannot reach the target.

- To find higher-value outcomes, use [discover-ambitious-goals](../discover-ambitious-goals/SKILL.md).
- Before pursuing an outcome with uncertain inputs, authority, or verification,
  use [prepare-agent-objective](../prepare-agent-objective/SKILL.md).
- For sustained objectives, use [maintain-outcome](../maintain-outcome/SKILL.md)
  with a tested contract and an actual execution trigger for future cycles.
- For an aggressive measurable target, use [experiment](../wcygan-experiment/SKILL.md)
  and its stretch-target guidance. Preserve gains without misreporting target attainment.

## Select a playbook

| Task | Playbook |
| --- | --- |
| Discover, prepare, or sustain an ambitious project outcome. | [ambitious outcome](playbooks/ambitious-outcome.md) |
| Explain or diagnose without changing the product. | [investigation](playbooks/investigation.md) |
| Reproduce and correct a reported defect. | [bug-fix](playbooks/bug-fix.md) |
| Diagnose and improve one measured performance problem. | [perf-issue](playbooks/perf-issue.md) |
| Improve a metric through bounded, repeatable experiments. | [iterative-optimization](playbooks/iterative-optimization.md) |
| Diagnose a live runtime symptom. | [runtime-forensics](playbooks/runtime-forensics.md) |
| Diagnose a supplied profile, trace, or snapshot. | [trace-forensics](playbooks/trace-forensics.md) |
| Build new or changed user behavior. | [feature](playbooks/feature.md) |
| Change structure while preserving behavior. | [refactoring](playbooks/refactoring.md) |
| Build a small experiment to settle a design uncertainty. | [prototype](playbooks/prototype.md) |
| Explain a system or change with a technical visual. | [technical explanation](playbooks/technical-explanation.md) |
| Verify visual and interaction equivalence between implementations. | [visual-parity](playbooks/visual-parity.md) |
| Create or revise an agent skill. | [authoring-a-skill](playbooks/authoring-a-skill.md) |
| Compare workflow or instruction changes before promoting them. | [eval](playbooks/eval.md) |
| Inspect or follow a proposed change toward readiness. | [monitor-change](playbooks/monitor-change.md) |
| Land verified changes in dependency order. | [shipping](playbooks/shipping.md) |
| Drive one bounded task to an observable completion condition. | [autonomous-run](playbooks/autonomous-run.md) |
| Coordinate a sustained project across multiple work units. | [coordinate-program](playbooks/coordinate-program.md) |
| Execute a queue of independent changes through authorized delivery. | [execute-independent-changes](playbooks/execute-independent-changes.md) |
| Build a verified sequence that another owner will land. | [prepare-dependent-changes](playbooks/prepare-dependent-changes.md) |
| Resume a particular prior task from its records and artifacts. | [session-pickup](playbooks/session-pickup.md) |
| Checkpoint active work on an explicit pause or unavoidable interruption. | [pause-safely](playbooks/pause-safely.md) |
| Produce an executable plan for several dependent units. | [multi-phase-plan](playbooks/multi-phase-plan.md) |
| Assess repository workspaces for safe reclamation. | [worktree-cleanup](playbooks/worktree-cleanup.md) |
| Prepare a reviewable proposal for an implemented change. | [propose-change](playbooks/propose-change.md) |

For a mixed task, sequence the relevant playbooks rather than restarting framing.
The nine `wcygan-*` procedures own reusable phase logic; components own focused methods.
Keep changes easy to review: use [slice-changes](../slice-changes/SKILL.md) when
work spans several reviewer questions, [technical-visuals](../technical-visuals/SKILL.md)
when a figure clarifies the relationship (2D by default; 3D only when requested),
and [prepare-pull-request](../prepare-pull-request/SKILL.md) for a concise visual
review package. These components supplement the selected playbook; they do not
require a PR or illustration for every task. Use [write-clearly](../write-clearly/SKILL.md)
for prose, captions, and labels when editing is needed.

Use existing specialists such as [uv-python](../uv-python/SKILL.md),
[just](../just/SKILL.md), or [design-loop](../design-loop/SKILL.md) when applicable.

For durable state, PR observation, plan checks, or workspace audits, read
[tool usage](references/tools.md). For plan authoring, read
[plan format](references/plan-format.md). For automated review findings, read
[review triage](references/review-triage.md). Tools support decisions; they do not
provide an agent runtime or grant publication authority.

Source behavior and deliberate changes: [parity matrix](references/parity.md).
Adapted from pstack; [license and attribution](references/LICENSE.txt).
