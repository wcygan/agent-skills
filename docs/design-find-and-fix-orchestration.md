# Find and Fix composition

## Composition decision

- **Proposed name:** `find-and-fix`.
- **Disposition:** Create a new skill, as explicitly requested.
- **Primary pattern:** Orchestrator with conditional evidence routing.
- **Recurring job:** Turn one software symptom into a supported cause, the
  smallest authorized repair, and verification against the original behavior.
- **Trigger:** Investigate broken behavior, incorrect data, unreliable recovery,
  or a performance regression; continue repair when requested.
- **Non-triggers:** Already accepted repair, pure execution or lineage
  explanation, repository-wide reliability audit, and unrelated cleanup.
- **Integrated output:** One issue record relating symptom, causal evidence,
  repair boundary, implemented change, verification, and remaining gaps.
- **Ideation authority:** Read-only.
- **Runtime authority:** Diagnosis-only work stays read-only on tracked files;
  combined requests authorize the corresponding local repair and checks.
  Operational effects and publication retain their own authority boundaries.
- **Search boundary:** Repository skills and the available installed catalog;
  no ecosystem discovery or upstream refresh.

`diagnosing-bugs` owns the focused reproduction, hypothesis-testing, and local
repair loop. `find-and-fix` owns selection and reconciliation across execution,
failure, data, resilience, and structural-transition evidence, returning a
single resolution of the user's original issue. The new entry point composes
that existing feedback loop rather than replacing its instructions.
`diagnose-difficult-bug` owns deeper causal diagnosis for intermittent, stateful,
or distributed cases. `map-production-scenario` explains execution, data, and
signals; `shape-safe-change` designs consequential changes. Their deliverables
remain distinct from resolving this issue.

The parent adds value through selecting evidence gaps, reconciling specialist
claims, preserving repair authority across analytical phases, and checking the
original symptom after implementation. A router would end at specialist
selection; a playlist would run unnecessary lenses and concatenate reports.

## Artifact flow and parent contract

| Phase | Artifact | Completion and next step |
|---|---|---|
| Bound | Issue scenario and authority | Recognizable signature and expected contract; establish feedback. |
| Feedback, using `diagnosing-bugs` | Procedure, captured result, or exact reproduction gap | Faithful evidence or bounded next check; resolve material evidence gaps. |
| Evidence | Selected companion ledgers | Required edges established or precise gaps identified; reconcile the causal mechanism. |
| Cause | Supported mechanism or leading hypothesis | Explains the signature and predicts a distinguishing result; report diagnosis or prepare authorized repair. |
| Repair, using `diagnosing-bugs` | Scoped change and any necessary structural checkpoints | Required invariants hold and artifacts are accounted for; verify the original behavior. |
| Verification | Integrated issue record | Demonstrated outcome within tested scope, or partial result with exact blocker. |

The executable companion map, predicates, and evidence requirements live in
the skill and its `references/companion-contracts.md`; this design record does
not duplicate those contracts.

- **Reconciliation:** Match scenario, identities, environment, and revision;
  resolve contradictory evidence with a discriminating check. Preserve unknowns.
- **Stop:** Evidence-backed diagnosis for analysis-only work; demonstrated
  repair for combined work; exact missing evidence, authority, or decision for
  dependent work that cannot proceed. Continue independent analysis.
- **Handoff:** Operational recovery or broader hardening beyond the issue's
  authorized repair, with a concrete next action.
- **Portability:** Companions are referenced by installed name and replaceable
  by direct analysis meeting the same evidence requirements. No sibling paths,
  dependency manifest, or collection-install assumption is required.
- **Agent policy:** Current-session composition by default. Explicitly
  authorized delegation uses `route-agent-models`; routing adds no authority.
- **Resources:** One conditional companion-contract reference. Keep specialist
  procedures and resources with their existing owners; leave `diagnosing-bugs`
  and its provenance unchanged.

## Acceptance scenarios and counterexamples

| Request or condition | Expected behavior |
|---|---|
| Find and fix a reproducible null dereference | Use `diagnosing-bugs` for feedback and local repair; omit irrelevant tracing lenses. |
| Wrong total after an event mapping | Trace selected value and transformations with `trace-data-lineage`; add execution tracing only for uncertain routing. |
| Timeout retries duplicate a write | Trace failure, attempts, and commit semantics; assess the implicated resilience property before repair. |
| Repair requires moving ownership between modules | Establish cause and target first; use `plan-safe-refactor` for the structural lane and prove the behavior delta separately. |
| Diagnose only; a companion recommends instrumentation | Retain read-only authority and report the missing proof; the recommendation does not authorize a write. |
| Trace ends after diagnosis during a combined request | Return to the parent and complete the already-authorized repair and verification. |
| Companion missing or availability unknown | Use direct analysis when sufficient; label unsupported claims and block only dependent work. |
| Source and logs describe different variants | Reconcile variant and revision before selecting a cause; preserve unresolved contradictions. |
| Intermittent bug with one passing attempt | Report attempt bounds and uncertainty; do not claim elimination. |
| Patch prevents new bad data but old records remain | Distinguish verified prevention from unresolved recovery and its authority. |
| `diagnosing-bugs` reports a passing unit test but the original outcome is unchecked | Keep integrated verification open and check the original symptom and material state effects. |

## Tradeoffs

The new entry point overlaps ordinary bug-fix requests with `diagnosing-bugs`.
Use the specialist directly for a focused local feedback loop and the parent
when multiple evidence lenses need coordination. Explicit user invocation
selects the parent's integrated workflow. Conditional reference loading keeps
simple fixes small while providing precise contracts for harder issues.
Validation checks packaging and publication; the scenarios above are design
reviews, not evidence of live agent execution against real bugs.
