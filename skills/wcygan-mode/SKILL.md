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
destination: a local handoff, a commit, a pull request, a merge, or a deploy.
Continue until the requested outcome is delivered; pause only at an explicit
checkpoint the user set or before an irreversible action that needs a go-ahead.

A playbook is a short procedure for one kind of task (bug fix, feature, and so
on), listed under "Select a playbook". The nine `wcygan-*` skills are procedures
that own one phase each (investigate, design, implement, verify, review, deliver,
coordinate, experiment, record); the other catalog skills are components that
own one focused method.

1. Read the [principle index](references/principles.md) and the principle skills
   the task triggers. Apply the ambition check below, then select and read the
   smallest relevant playbook. Load its linked procedures and components only
   when their conditions apply, so the context stays small; reuse existing evidence.
2. Investigate observable uncertainty before asking the user to guess. Product and
   preference decisions remain with the user unless already delegated.
3. Prefer simple structures and small verifiable units. Delegate to a subagent
   only when it pays: a subagent starts cold and re-derives context you already
   have, so it pays for a bounded bulk read with one clear question, or for an
   independent write to files no one else touches. Its brief holds the goal, the
   scope and files, the evidence to return, and the return format; `coordinate-work`
   has the brief template. State unavailable capabilities honestly.
4. Keep one owner per shared write target. Inspect delegated artifacts and evidence
   rather than trusting the report, because a report can describe work that was
   not done. Revisit design when assumptions fail.
5. Record consequential decisions for long work. Reconcile current state on pickup
   and leave a durable checkpoint on pause. Scheduling future runs needs an
   external trigger; this skill has none.
6. Post a short progress update at each phase boundary. Compare the final result
   with the original goal and end with a self-contained recap that leads with the
   outcome, then what was verified, what was not, and what is next. Deliver to
   the requested destination and no further (see Approvals).

## Approvals

Get an explicit go-ahead before committing, pushing, opening or merging a pull
request, deploying, publishing a package, or posting in the user's name. Reads,
searches, tests, builds, linters, safe-to-repeat reruns, and local scratch work
need no go-ahead. A go-ahead covers the action it names; once given, take that
action without asking again, and ask before any other. Continue through every
other step.

## Obstacles and blockers

An ordinary obstacle is an error, a timeout, a locked file, an empty result, or a
failing tool. Diagnose it first, then work through it with the access you have:
wait and retry a call that is safe to repeat, fix the request, or use another tool
or source. An ordinary obstacle is not a reason to end the turn.

A deliberate blocker is something a person decided: a file marked not to be
touched, access withheld on purpose, or a safety guardrail. Leave it alone, say
plainly what you found, and look for another safe way to finish the task.

End the turn early only when the task cannot move forward without the user's
input or the blocker is deliberate. When one part is stuck, finish every part
that does not depend on it. When you are about to offer to continue or to list
what remains, do the next part instead.

## Exercise ambition by default

On every substantive task, consider the outcome beyond the requested mechanism,
the assumption limiting it, and a stronger method or tool that could improve it.
Look for ways to eliminate work, prevent a class of failures, or materially improve
the user experience. Scale this check to the task; a small edit may need only a
brief consideration, with no extra artifact. State the opportunity when it changes
the approach or presents a meaningful choice.

Pursue promising approaches within the requested goal and budget. Propose broader
product changes rather than adopting them silently, because product direction is
the user's decision. Ambition can mean a simpler solution or deeper proof; it does
not require more features, agents, or infrastructure. Treat stretch targets as
hypotheses, keep acceptance criteria honest, and revisit assumptions when evidence
suggests the current approach cannot reach the target.

- To find higher-value outcomes, use `discover-ambitious-goals`.
- Before pursuing an outcome with uncertain inputs, authority, or verification,
  use `prepare-agent-objective`.
- For sustained objectives, use `maintain-outcome` with a tested contract and an
  actual execution trigger for future cycles.
- For an aggressive measurable target, use `wcygan-experiment` and its
  stretch-target guidance. Preserve gains without misreporting target attainment.

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
Keep changes easy to review: use `slice-changes` when work spans several reviewer
questions, `technical-visuals` when a figure clarifies the relationship (2D by
default; 3D only when requested, since it costs more to build and read), and
`prepare-pull-request` for a concise visual review package. These components
supplement the selected playbook; a task needs a PR or illustration only when the
user asked for one. Use `write-clearly` for prose, captions, and labels when
editing is needed.

Use existing specialists such as `uv-python`, `just`, or `design-loop` when applicable.

For durable state, PR observation, plan checks, or workspace audits, read
[tool usage](references/tools.md). For plan authoring, read
[plan format](references/plan-format.md). For automated review findings, read
[review triage](references/review-triage.md). The tools record and observe;
publishing still follows Approvals above.

Source behavior and deliberate changes: [parity matrix](references/parity.md).
Adapted from pstack; [license and attribution](references/LICENSE.txt).
