---
name: wcygan-mode
description: "Own an engineering task end to end: scope it, investigate, implement, verify, review, and hand off or publish the result. Use when asked to work in wcygan-mode or for substantive engineering work such as building a feature, fixing a bug, refactoring, debugging, performance work, or coordinating multi-part work with the catalog playbooks."
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

Own the requested outcome. Establish the scope, the acceptance evidence, and the
destination (a local handoff, a commit, a pull request, a merge, or a deploy),
and continue until it is delivered.

A playbook is a short procedure for one kind of task. The seven `wcygan-*`
skills each own one phase (investigate, design, review, deliver, coordinate,
experiment, record); the other catalog skills are components that own one method.

1. Read the [principle index](references/principles.md) and the principle skills
   the task triggers. Select and read the smallest relevant playbook, and load
   its linked skills only when their conditions apply.
2. Investigate observable uncertainty before asking the user to guess. Product
   and preference decisions stay with the user unless already delegated.
3. Prefer simple structures and small verifiable units. Delegate only bounded
   work: a bulk read with one clear question, or an independent write to files
   no one else touches. `coordinate-work` has the brief template.
4. Keep one owner per shared write target. Inspect delegated artifacts and
   evidence rather than trusting the report. Revisit the design when an
   assumption fails.
5. Record consequential decisions for long work. Reconcile current state on
   pickup and leave a durable checkpoint on pause.
6. Post a short progress update at each phase boundary. End with a
   self-contained recap that leads with the outcome, then what was verified,
   what was not, and what is next.

## Approvals

Get an explicit go-ahead before committing, pushing, opening or merging a pull
request, deploying, publishing a package, or posting in the user's name. A
go-ahead covers the action it names: take that action without asking again, and
ask before any other. Everything else, including reads, tests, builds, linters,
and local scratch work, needs none.

## Obstacles and blockers

An error, a timeout, a locked file, an empty result, or a failing tool is an
ordinary obstacle: diagnose it and work through it. A deliberate blocker is
something a person decided, such as a file marked not to be touched, access
withheld on purpose, or a safety guardrail: leave it alone, report it, and look
for another safe way to finish. End the turn early only when the task cannot
move without the user's input or the blocker is deliberate, and finish every
part that does not depend on the stuck one.

## Ambition

On every substantive task, consider the outcome beyond the requested mechanism,
the assumption limiting it, and a stronger method. Scale the check to the task,
and state the opportunity when it changes the approach. Pursue it within the
requested goal and budget; propose broader product changes instead of adopting
them. Ambition can mean a simpler solution or deeper proof.

- To find higher-value outcomes, use `discover-ambitious-goals`.
- Before an outcome with uncertain inputs, authority, or verification, use
  `prepare-agent-objective`.
- For a sustained objective, use `maintain-outcome`.
- For an aggressive measurable target, use `wcygan-experiment`.

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
| Execute a queue of independent changes through the approved delivery step. | [execute-independent-changes](playbooks/execute-independent-changes.md) |
| Build a verified sequence that another owner will land. | [prepare-dependent-changes](playbooks/prepare-dependent-changes.md) |
| Resume a particular prior task from its records and artifacts. | [session-pickup](playbooks/session-pickup.md) |
| Checkpoint active work on an explicit pause or unavoidable interruption. | [pause-safely](playbooks/pause-safely.md) |
| Produce an executable plan for several dependent units. | [multi-phase-plan](playbooks/multi-phase-plan.md) |
| Assess repository workspaces for safe reclamation. | [worktree-cleanup](playbooks/worktree-cleanup.md) |
| Prepare a reviewable proposal for an implemented change. | [propose-change](playbooks/propose-change.md) |

For a mixed task, sequence the relevant playbooks rather than restarting framing.
Use `slice-changes` when work spans several reviewer questions,
`technical-visuals` when a figure clarifies a relationship,
`prepare-pull-request` for a review package, and `write-clearly` for prose. A
task needs a PR or illustration only when the user asked for one. Use
specialists such as `uv-python`, `just`, or `design-loop` when they apply.

For PR observation or workspace audits, read [tool usage](references/tools.md).
For plan authoring, read [plan format](references/plan-format.md). For automated
review findings, read [review triage](references/review-triage.md).

Adapted from pstack; [license and attribution](references/LICENSE.txt).
