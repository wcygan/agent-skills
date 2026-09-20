---
name: delegate-and-verify
description: "Delegate a complete task to a selected worker model, then review and verify the result in the primary session. Use for explicitly requested supervised delegation, including the luna, sol, and terra entry points."
license: MIT
compatibility: Requires subagent tools with explicit model selection and artifact access shared with the primary session.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Delegate and verify

Keep scoping, judgment, and final acceptance in the primary session, normally
GPT-6 Astra. Give one worker ownership of the requested task from implementation
through validation. The primary inspects the result and directs corrections
until the acceptance criteria pass or a concrete limit prevents completion.

This pattern aims to reduce expensive primary-model work. Delegation adds
context and coordination tokens; optimize usage per accepted result, not worker
price alone. It suits substantial tasks with observable completion criteria.

## Establish the assignment

Use the current user request and accepted conversation decisions. If there is
no actionable task, ask what to accomplish. Scope only enough to dispatch:

- the complete outcome and observable acceptance criteria;
- relevant context, paths, dependencies, and existing changes to preserve;
- authorized edits and external actions, including any already-approved
  delivery steps; and
- the selected worker model, verification evidence, and attempt budget.

Keep this brief in task state; a separate plan file is unnecessary. Clarify
only missing decisions that block execution or materially change the outcome.
Preserve authorization through dispatch, review, repair, and delivery. Invoking
this skill authorizes delegation of the task, not additional external effects.

The primary remains on its current model; this skill cannot switch the primary
session to Astra. Report a known mismatch when the user requires Astra, without
claiming a switch occurred.

## Select and verify the worker route

A wrapper supplies `worker_model`. Treat it as pinned for all worker attempts
unless the user explicitly overrides it. When invoked directly without a model,
choose a starting route according to the assignment:

| Worker model | Starting use |
| --- | --- |
| `gpt-5.6-luna` | Narrow, explicit tasks with inexpensive verification |
| `gpt-5.6-terra` | Defined implementation and analysis tasks; default route |
| `gpt-5.6-sol` | Complex implementation, ambiguity, or substantial judgment |

Check the live subagent schema for the exact model and compatible reasoning
settings. Honor an explicit user effort; otherwise use the selected model's
default. API availability or a model picker alone does not prove a subagent
route works. If the requested route is unavailable, report that limitation
instead of silently substituting another model or doing the task locally.

Use a fresh worker context with a self-contained brief. In runtimes exposing
`fork_turns`, use `"none"` with an explicit `model`; a full-history fork can
force inheritance and reject model overrides. Preserve necessary user context
in the brief, including relevant attachments or accessible artifact references.
Use a general execution role, with the parent's tools and authority ceiling.

Verify the effective model from dispatch receipts or runtime metadata. A
worker's claim about its own identity is insufficient. If routing or inheritance
is ambiguous, consult [route-agent-models](../route-agent-models/SKILL.md) when
available and resolve the mismatch before further work. If runtime evidence
cannot establish the route, report it as unverified rather than claiming success.

## Give the worker full responsibility

Adapt the user's original request only enough to make it self-contained.
Preserve its substantive requirements, exact technical details, constraints,
and authorized actions. Remove the wrapper invocation and supervisory routing
instructions so the worker executes the task instead of launching this loop.

Give the worker this contract, filled with the assignment's concrete details:

```text
Complete this task: <user's requested outcome>.
Context and decisions: <only what execution needs>.
Owned scope and authorized actions: <paths, artifacts, and delivery steps>.
Acceptance criteria: <observable outcomes and required checks>.

Own the task end to end. Implement the result, run the relevant checks, fix
failures within scope, and complete the authorized delivery steps. Return the
finished work rather than a proposal. You are not alone in the workspace:
preserve others' edits and accommodate existing changes. Work as a leaf agent;
do not spawn subagents or invoke delegation skills. If a required decision or
capability is missing, report the exact blocker and preserve completed work.

Return a concise account of the result, artifact paths, checks and their actual
outcomes, and any unresolved requirements or limitations.
```

Keep the review arrangements in the primary's context; the worker needs the
task and completion criteria, not a description of its supervisor. Do not
promise that runtime-provided subagent context can be hidden or tell the worker
that no review exists.

Use one active writer for the assignment. While it runs, the primary may
prepare acceptance checks or inspect independent evidence; avoid repeating the
worker's investigation or editing its owned scope. Wait for completion using
the runtime's wait facility instead of repeatedly polling transcripts. Cancel
and confirm termination before replacing a worker that may still write.

## Review, correct, and finish

Review the actual artifacts against every acceptance criterion. For code,
inspect the diff and relevant behavior; for research or documents, inspect
source support and the deliverable itself. Run targeted independent checks
where they add evidence. Reuse trustworthy check results tied to the current
artifact; a worker's assertion of completion is not proof.

If criteria fail, send concrete feedback: the failed criterion, its evidence,
the affected artifact, and constraints the correction must preserve. Reuse the
worker when its context remains useful. Start a replacement on the same route
when context is stale, the worker is unavailable, or a new approach is needed.
Include the current candidate, failed checks, attempted fixes, and remaining
budget so the replacement continues rather than restarts.

Default to three worker attempts total: the initial execution and at most two
correction turns or replacements. Honor a user-specified budget instead. Track
attempts, findings, and acceptance evidence in the primary's task state; a new
worker does not reset the budget. Two consecutive attempts with the same
failure and no new evidence trigger reassessment before spending another.

At the limit, stop delegating and inspect the remaining gap. The primary may
finish a tractable correction within the original authority, reporting that
fallback. Otherwise preserve the candidate and report the exact unresolved
criterion and what would unblock it. Changing a pinned worker model requires
the user's direction. Never weaken acceptance criteria to make an attempt pass
or treat budget exhaustion as completion.

Once all criteria have evidence, complete any remaining authorized delivery
steps and report the result, actual worker route, verification, and material
limitations. Distinguish verified completion from incomplete work. Claim usage
savings only when measured across the primary, workers, and repair attempts.
