# Transcript Learning Promotion Rubric

Use this rubric after the evidence ledger and clusters are complete. The rubric
supports comparative judgment. It is not a mechanical scoring formula.

## Evidence gate

A supported candidate identifies:

- one observable problem or opportunity;
- its context and preconditions;
- a reusable response or decision;
- an observable outcome;
- transcript provenance;
- evidence class;
- contradictory evidence; and
- the limit of the claim.

Prefer verified outcomes from independent transcripts. Accept an observed but
unverified cluster only as `defer`. Reject advice that appears only in assistant
messages without an observable result.

A repeated mention inside one transcript counts as one source. Related turns
from the same task are not independent recurrence evidence.

## Reuse gate

Keep a candidate when the knowledge changes future agent behavior and cannot be
recovered cheaply from the immediate environment.

Strong reusable knowledge includes:

- a non-obvious failure signature and discriminating check;
- a workaround with stable preconditions and a verified outcome;
- an authority boundary that prevented harmful or wasted action;
- a recovery condition that distinguishes activity from completion;
- a catalog or tool interaction that repeatedly causes the same error; or
- a portable decision rule that reduces future user intervention.

Reject:

- commands already obvious from current `--help` output;
- facts likely to become stale without a stable verification step;
- one project's domain facts without an agent workflow;
- generic advice that the model follows without instructions;
- raw transcript history or narrative summaries;
- private wording that cannot be generalized safely; and
- speculative improvements without an observed need.

## Scope gate

Recommend `project` when any material part depends on:

- repository commands, paths, fixtures, or services;
- domain terminology, architecture, or state ownership;
- project-specific safety, approval, or validation rules;
- local artifacts that must remain with the repository; or
- a trigger meaningful only inside that project.

Recommend `user` when all material parts:

- apply across repositories or tasks;
- use stable, recognizable triggers;
- produce a bounded, portable output;
- avoid project secrets and private terminology;
- have a clear read or write authority boundary; and
- lack an existing user-scope owner.

Recommend `defer` when moving the candidate between scopes would change its job,
evidence, authority, or completion condition.

## Ownership gate

Classify each candidate as exactly one:

- `extend`: one installed skill already owns the trigger, job, authority, and
  output;
- `create`: no owner exists and the candidate has a distinct bounded job;
- `covered`: existing instructions already express the reusable knowledge;
- `defer`: ownership depends on missing evidence or an unresolved scope; or
- `reject`: the candidate fails evidence or reuse requirements.

Shared keywords do not establish ownership. Read the full nearby skill before
recommending `extend` or `covered`.

When project and user skills overlap, prefer the narrower project owner for
project-specific knowledge. Prefer the user owner only for the portable core.
Do not recommend duplicated rules in both scopes.

## Comparative ranking

Compare candidates in this order:

1. Evidence strength and contradictions.
2. Expected recurrence and failure cost.
3. Future autonomy gained through the skill.
4. Breadth of safe reuse.
5. Ownership and scope clarity.
6. Maintenance and staleness risk.

Give higher priority to a candidate that prevents a verified costly failure
than one that saves a small repeated action. Give lower priority to a broad
candidate whose trigger or scope remains unclear.

Explain each adjacent ordering with a short comparative reason. Use labels such
as `implement now`, `next`, `later`, and `defer` only after the order is clear.

## Candidate record

Use this structure for each ranked candidate:

```text
Rank and priority:
Proposed name:
Job:
Activation trigger:
Recommended scope:
Evidence entries and independent transcript count:
Problem or opportunity:
Verified workaround or reusable pattern:
Expected autonomy benefit:
Existing-skill relationship:
Confidence and contradictions:
Suggested resources:
Next action:
Why it ranks above the next candidate:
```

Suggested resources must reduce repeated work or context. Recommend a reference
for detailed branch-only guidance, a script for deterministic extraction or
transformation, and an asset only when the output copies a template.

## Completion check

Before reporting, confirm:

- every ranked candidate passes the evidence and reuse gates;
- every candidate has one scope decision;
- every overlap claim names the inspected skill evidence;
- every verified solution cites an observable outcome;
- every contradiction affects confidence or disposition;
- every rejected candidate states the failed gate; and
- no raw private transcript text appears in the report.
