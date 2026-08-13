---
name: mine-transcript-learnings
description: Mine bounded local agent transcripts for recurring failures, verified workarounds, and reusable workflow knowledge. Use when reviewing Codex rollout sessions or other supported transcripts, including locating tasks by working directory, date, thread identifier, or durable markers. Produce a ranked skill-candidate report with evidence, overlap, and promotion rationale. Remain read-only.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Mine Transcript Learnings

Convert bounded transcript evidence into a ranked list of reusable skill
opportunities. Keep the complete run read-only.

## Establish the scan contract

Record these fields before reading transcript content:

```text
Transcript roots or files:
Repository or working-directory filter:
Time range:
Thread or observable-text identity:
Maximum files and bytes:
Maximum event text:
Sensitive content exclusions:
Skill catalogs to inspect:
Requested candidate limit:
```

Use explicit user limits when provided. Otherwise, use the current repository,
the previous 30 days, at most 100 files, and at most 100 MiB. Return at most ten
ranked candidates unless the user requests another bound.

For Codex rollout files, use `scripts/extract_transcript_evidence.py`. Run its
`--help` before the first use in an unfamiliar installation. The script reads
`~/.codex/sessions` and `~/.codex/archived_sessions` by default. Supply
`--cwd` when the scan targets one repository.

Use `--metadata-only` before content extraction when several files can match.
Read `references/codex-rollout-extraction.md` for precise timestamps, durable
text markers, zero-result scans, or compacted mixed-message transcripts.

For another transcript format, inspect its schema first. Continue only when
observable messages and tool results can be extracted without hidden reasoning.
Report unsupported formats instead of guessing their semantics.

The scan contract is complete when its corpus and resource bounds identify the
largest possible read.

## Preserve the privacy boundary

Read transcript files and installed skill catalogs without changing them. Keep
analysis in process memory and the response. Do not create a persistent index,
temporary evidence file, or tracked artifact.

Treat redaction as defense in depth. Review sanitized output before using it.
Paraphrase evidence in the report. Reference a transcript by thread identifier,
timestamp, and record ordinal without reproducing raw private text.

Exclude:

- encrypted or hidden reasoning;
- system and developer instructions;
- credentials, tokens, cookies, and private keys;
- personal information unrelated to the candidate;
- binary attachments and encoded media; and
- transcript content outside the declared corpus.

Stop when access, retention, or sensitivity is unclear. State the smallest safe
scope that would permit a later run.

## Build the evidence ledger

Create one evidence entry for each observable failure, workaround, solution, or
reusable workflow pattern. Record:

- thread identifier, timestamp, and record ordinal;
- repository or task context;
- observed symptom or opportunity;
- attempted approach when relevant;
- workaround or solution;
- observable outcome;
- required preconditions;
- contradictory evidence; and
- evidence class.

Use these evidence classes:

- `observed`: the transcript contains the behavior or result;
- `verified`: a test, tool result, durable state, or user confirmation proves it;
- `inferred`: evidence supports the claim but does not prove it; and
- `unknown`: required evidence is absent or inaccessible.

An assistant claim alone is not verified evidence. A successful command proves
only the behavior that command checks.

The ledger is complete when every later candidate links to evidence entries and
each material contradiction remains visible.

## Cluster reusable knowledge

Group entries only when they share an observable failure signature, solution
contract, or workflow need. Similar wording does not establish recurrence.

For each cluster, distinguish:

- the stable problem from incidental symptoms;
- the reusable solution from one environment's command;
- necessary preconditions from accidental context;
- recurrence from repeated mentions in one transcript; and
- verified outcomes from plausible advice.

Treat independent transcripts as stronger recurrence evidence. Keep a high-cost
singleton as a lower-confidence candidate when recurrence risk is credible.
Reject a cluster when its useful content is generic model knowledge, transient
provider behavior, or project documentation with no agent workflow.

The clusters are complete when every ledger entry is assigned, rejected, or
left unclustered with a reason.

## Inspect existing skill ownership

Inspect installed project and user skill catalogs through the client's current
skill-listing mechanism. Use filesystem paths reported by that mechanism.
Do not assume one fixed installation directory.

Search immediate skill descriptions first. Read the complete body and relevant
references of each nearby owner. Compare:

- activation trigger;
- job and output;
- authority boundary;
- stopping condition;
- project or user scope; and
- current coverage of the candidate knowledge.

Recommend an extension when an existing skill owns the same job. Recommend a
new skill only when the candidate has a distinct trigger or output. Mark the
candidate `covered` when existing instructions already contain the useful rule.

The overlap review is complete when every supported candidate has one owner,
one proposed new boundary, or a documented ownership uncertainty.

## Rank candidate skills

Read `references/promotion-rubric.md` before ranking. Apply its evidence,
scope, overlap, and rejection rules to every supported candidate.

Rank candidates by comparative judgment across:

1. expected recurrence;
2. failure cost;
3. evidence strength;
4. reuse across future work;
5. expected autonomy gain;
6. scope clarity;
7. existing catalog coverage; and
8. maintenance cost.

Do not calculate a numeric total unless the evidence supports precise inputs.
Explain why each candidate precedes the next candidate.

Recommend `project` scope when the knowledge depends on repository commands,
domain terminology, architecture, services, tests, or local authority rules.
Recommend `user` scope when the workflow is portable across repositories, has
stable triggers and outputs, and has no current user-scope owner. Recommend
`defer` when evidence, ownership, or scope remains uncertain.

The ranking is complete when every supported candidate has a position, scope,
confidence, overlap decision, and next action.

## Produce the Transcript Learning Report

Return these sections:

1. **Scan scope and privacy boundary.** State files considered, bounds,
   exclusions, redaction limits, and incomplete evidence.
2. **Failure and solution clusters.** Summarize supported patterns and their
   evidence classes.
3. **Ranked skill candidates.** Order candidates and explain adjacent rankings.
4. **Scope recommendations.** Distinguish project, user, and deferred scope.
5. **Existing-skill overlap.** Name extend, create, covered, or uncertain.
6. **Supporting and contradictory evidence.** Use paraphrases and provenance.
7. **Deferred and rejected candidates.** State the failed rubric condition.
8. **Recommended next action.** Give one bounded next step per candidate.

For each ranked candidate include:

- proposed skill name;
- job and activation trigger;
- recommended scope;
- evidence count and transcript provenance;
- failure or opportunity addressed;
- verified workaround or reusable pattern;
- expected autonomy benefit;
- existing-skill relationship;
- confidence and limitations;
- suggested references, scripts, or assets; and
- implementation priority.

Do not create a skill-intake handoff unless the user requests one separately.
Do not create, edit, install, remove, commit, push, or publish skills. Do not
modify project instructions or memory. The report is the only output.

A report with no recommended skills is complete when all candidates lack
sufficient evidence, reuse, scope clarity, or uncovered ownership.

## Stop conditions

Stop and report the last supported conclusion when:

- no bounded transcript corpus is available;
- the privacy boundary is unsafe or ambiguous;
- extraction cannot separate observable events from hidden reasoning;
- the scan reaches a declared file or byte bound;
- installed skill ownership cannot be inspected;
- contradictions prevent a reliable solution claim; or
- every candidate is covered, rejected, or deferred.

## Trigger examples

- “Mine recent Codex sessions for skill opportunities.”
- “Find recurring workarounds in these transcripts and rank reusable skills.”
- “Which project or user skills would prevent failures seen in my chat history?”

Route one surprising agent run to `evaluate-agent-workflow`. Route controlled
harness experiments to `improve-agent-harness`. Route a rough user-authored
skill idea to `skill-intake`.
