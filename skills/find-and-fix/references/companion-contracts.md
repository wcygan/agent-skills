# Companion contracts

Read the section for each selected lens. The parent owns the issue record,
causal judgment, repair scope, and final verification. Each companion owns one
bounded evidence question. Return the relevant ledger, conclusion, and gaps;
reuse an existing artifact when it matches the scenario and current revision.

## Shared phase contract

Supply the issue's operation, signature, expected contract, variant, scope,
revision, environment, existing evidence, and precise remaining question. Pass
only the authority needed for that phase. Tracing, auditing, and refactor
planning inspect source, configuration, contracts, tests, and existing
authorized evidence. They do not implicitly add instrumentation or perform
operational experiments. Their read-only phase ending does not end an
already-authorized parent repair. `diagnosing-bugs` receives local mutation
authority only for its requested repair phase and necessary repair artifacts.

Carry evidence locations and classes into the parent record. Keep inferred and
unknown segments visible. An inconclusive artifact returns its supported
partial path and smallest discriminating next check. If the companion is
missing, direct analysis must meet the same evidence contract; an unfilled
essential gap blocks only the work that depends on it.

## `diagnosing-bugs`: feedback and bounded repair

- **Diagnostic input:** Framed symptom, expected contract, scope, relevant
  conditions, existing artifacts, and execution constraints.
- **Diagnostic output:** Faithful procedure, failure signature, captured
  result, hypothesis predictions and evidence, proposed next discriminating
  check, and any reproduction or causal limits.
- **Diagnostic completion:** The feedback catches the actual symptom, or the
  exact fidelity gap and smallest safe next check are identified. Tracked
  production files remain read-only during this analytical phase.
- **Repair input:** Supported mechanism, authoritative owner, repair boundary,
  intentional behavior delta, preserved invariants, any structural checkpoints,
  faithful check, selected regression test levels, and granted local repair
  authority.
- **Repair output:** Scoped correction, added or strengthened regression
  coverage, known-bad and
  post-repair results when obtainable, diagnostic artifact disposition, and
  remaining verification limits.
- **Repair completion:** The supported mechanism is corrected within scope and
  checked against the original symptom; required invariants and regression
  checks hold, or the specific remaining failure is reported.
- **Parent use:** Reuse the feedback as other lenses refine the cause. Return
  the integrated repair boundary to this loop rather than having each tracing
  companion propose and implement an independent fix. Review its result against
  the end-to-end issue before claiming resolution.

## `trace-codepath`: execution and selection

- **Input:** Trigger, entry anchor, requested outcome or sink, relevant
  configuration and input variant, and unresolved dispatch or boundary.
- **Output:** Scenario path and edge ledger with selected implementations,
  branch conditions, state effects, boundary semantics, and unknown edges.
- **Completion:** Forward and backward traversal connect the selected entry
  to the affected outcome, or identify the exact unresolved edge.
- **Parent use:** Locate the first divergence and bound later failure or data
  questions. A possible call relationship does not prove runtime selection.

## `trace-failure-path`: propagation and recovery

- **Input:** Concrete failure trigger or earliest symptom, known execution
  path, expected contract, relevant attempt or lifecycle state, state effects,
  and terminal question.
- **Output:** Earliest supported cause through handling, translation,
  propagation, committed effects, retries or recovery, visible surfaces, and
  terminal outcome, with evidence for each material edge.
- **Completion:** Cause-to-outcome traversal accounts for material state and
  recovery ownership, or names the missing evidence preventing that account.
- **Parent use:** Distinguish originating failure from translated symptoms and
  select the causal owner. Successful enqueue is a handoff, not processing proof.

## `trace-data-lineage`: identity, meaning, and ownership

- **Input:** One selected field, record, event, or derived result; identity
  rule; expected meaning; origin or sink; relevant variant; and suspect hop.
- **Output:** Lineage ledger with producers, transformations, authoritative
  and derived stores, consumers, freshness or lifecycle semantics, and gaps.
- **Completion:** Relevant origin-to-sink movement and semantic changes are
  supported, or the exact unsupported mapping or owner is identified.
- **Parent use:** Locate the first incorrect value or stale copy and choose
  the authoritative repair point. Matching names alone do not establish identity.

## `audit-resilience`: implicated properties and counterexamples

- **Input:** Supported scenario path, affected state owners and effects,
  relevant failure boundary, required property, operating constraints, and
  candidate repair if available.
- **Output:** Evidence-backed property assessment, smallest credible
  counterexample, consequence, smallest necessary hardening move, tradeoff,
  required proof, and residual risk for this slice.
- **Completion:** The implicated property has supported coverage or an
  explicit evidence gap; each recommendation addresses the same failure
  mechanism and names a discriminating proof.
- **Parent use:** Check that the repair preserves safety, progress, or recovery
  under the implicated failure. Keep severity separate from confidence. A
  theoretical risk does not establish the reported issue's cause, and adjacent
  findings do not automatically enter the repair scope.

## `plan-safe-refactor`: necessary structural transition

- **Input:** Supported cause, repair boundary, concrete current and target
  ownership or structure, preserved behavior, intentional bug-fix delta,
  impacted callers and state, and available validation.
- **Output:** Seam and transition strategy; independently safe structural
  slices with starting and resulting states, invariants, validation, rollback,
  stop conditions, and any temporary compatibility removal criteria.
- **Completion:** Each slice is safe to leave in place, preserves named
  behavior, and leads to the concrete target without relying on future cleanup
  for correctness. Isolate irreversible or separately authorized actions.
- **Parent use:** Execute the necessary structural lane when repair is
  authorized, then prove the intentional behavioral correction separately.
  A localized bug fix does not need a refactor plan merely because it edits code.
