---
name: writing-for-agents
description: Write or revise agent instructions in skills, AGENTS.md, CLAUDE.md, and supporting documents.
---

# Writing for Agents

Write instructions that improve decisions, provide missing project knowledge, or prevent concrete failures. Assume the agent can perform ordinary engineering work.

For skill descriptions, invocation policy, or skill splitting, read [SKILL-MECHANICS.md](SKILL-MECHANICS.md).

## Keep useful instructions

Keep the requested outcome, essential constraints, project conventions, and operational facts that the agent cannot easily discover.

Remove generic advice, repeated policies, stale workarounds, and speculative failure cases. Preserve safeguards supported by actual failures or operational requirements.

Evaluate instructions against the models that will use them. A rule useful for one model may constrain another.

Use observed behavior to justify changes. A shorter document is useful only when it preserves correct decisions and results.

## Make context conditional

A context pointer names a resource and states when to read it. Skill descriptions and repository document links serve this purpose.

Put the distinguishing task condition early. Keep the wording specific enough to separate nearby tasks.

For example:

> Read architecture.md for service boundary changes. Read database.md for schema changes. Read deployment.md when preparing a deployment.

Avoid requiring broad document reviews before every edit. Keep essential constraints in the entrypoint and read supporting details when their conditions apply.

Always-loaded instructions consume attention on unrelated tasks. Supporting documents consume context when loaded, so their contents must also justify the cost.

## Disclose detail progressively

Keep shared purpose, essential constraints, and selection criteria in the main document.

Move substantial guidance for particular modes into supporting references. Explain when each reference applies, and load only the relevant references.

Keep simple instructions in one file. Add a router only when distinct workflows need substantial separate guidance.

Keep each rule in one authoritative location. Place related definitions and constraints together, and use links instead of repeating them.

Use project files and command help for facts that are cheap to discover. Document hidden conventions and costly lookups when they affect decisions.

## Match procedure to risk

Describe outcomes and decision criteria when several approaches are valid. Specify order when dependencies, permissions, correctness, or fragile operations require it.

Distinguish required checks from optional techniques. Preserve exact project validation commands and publication requirements when they govern the requested work.

Avoid adding repeated tests merely to encourage thoroughness. Require evidence appropriate to the change, then repeat checks when changes or failures justify it.

Use familiar, concrete terms. Prefer explicit conditions over forceful adjectives or invented shorthand.

## Define completion and authority

State the requested result, the evidence that proves it, and the scope boundary.

Include running, inspecting, and correcting the result when the task requires those actions. A first implementation does not satisfy those completion criteria.

Separate completion from conditions that require user input. Name the missing decision, permission boundary, or external dependency that requires a pause.

Preserve existing authorization. Allow routine work and recovery within that scope without adding review stops between steps.

For example, when the environment facts are verified:

> Local tests use disposable fixtures and have no production access. Run affected tests and fix failures caused by this change. Rerun affected tests without requesting approval for each step.

Bound retries and external actions according to their risk. Define any requested exploration by its question, evidence, and stopping condition.

## Review the result

Check whether each instruction changes a useful decision or supplies necessary information. Remove instructions that only restate ordinary model behavior.

For selection rules, compare an intended request with a plausible nearby request outside the scope. Check that each reaches the correct guidance.

For complex or fragile workflows, use bounded behavioral checks when warranted and authorized. Observe selection, relevant reading, completion, and unnecessary stops.

Do not treat line counts or format validation as proof of good behavior. Preserve required checks and permission boundaries during revisions.
