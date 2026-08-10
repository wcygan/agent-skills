# Incident Learning Pack

Use this template to produce the final response for one bounded closed or
stabilized incident. Remove instructional text and unused rows. Keep unknowns
visible rather than filling them with assumptions.

## 1. Status and executive conclusion

**Status:** [complete | incomplete | blocked]

**Executive conclusion:** [Smallest supported account of what happened, why it
matters, and what should happen next.]

**Last supported conclusion:** [Required for incomplete or blocked packs.]

**Smallest next evidence:** [Exact safe, read-only evidence that would change
the status or confidence.]

## 2. Incident Card

| Field | Value | Evidence |
| --- | --- | --- |
| Incident label | [bounded identifier] | [E key] |
| Reported trigger | [event or condition] | [E key] |
| Expected behavior | [contract] | [E key] |
| Affected scope | [users, systems, state] | [E key or unknown] |
| Time window | [bounded window] | [E key] |
| Stabilization state | [closed or stabilized] | [E key and class] |
| Systems in scope | [repositories, services, stores, vendors, environments] | [source] |
| Authority | [read-only sources and access boundary] | [authorization source] |
| Exclusions | [adjacent incidents and branches] | [scope decision] |

## 3. Evidence Ledger

| Key | Source reference and time or artifact identity | Claim supported | Class | Integrity, access, or redaction limit | Finding links |
| --- | --- | --- | --- | --- | --- |
| E1 | [reference] | [claim] | [observed, verified, declared, reported, inferred, or unknown] | [limit] | [F keys] |

### Contradictions and unavailable evidence

- [Conflicting or missing evidence, affected claim, consequence, and smallest
  safe next evidence.]

## 4. Companion routing record

| Question | Predicate result | Companion or reuse decision | Returned artifact or evidence | Remaining gap |
| --- | --- | --- | --- | --- |
| Causal mechanism | [route or skip, with reason] | [diagnose-difficult-bug or skipped] | [artifact or evidence keys] | [gap] |
| Impact and terminal outcome | [route or skip, with reason] | [map-production-scenario or skipped] | [artifact or evidence keys] | [gap] |
| Detection and reconstruction | [route, reuse, or skip, with reason] | [audit-observability-path, reused artifact, or skipped] | [artifact or evidence keys] | [gap] |
| Corrective proof | [number selected, maximum three] | [design-verification-strategy per package] | [P keys] | [gap] |

## 5. Causal account

**Trigger:** [Finding, E keys, evidence class, and confidence.]

**Root cause or leading causal hypothesis:** [Mechanism, label, F and E keys,
discriminating evidence, confidence, and why the threshold is or is not met.]

**Contributing conditions:**

| Finding | Influence on likelihood, severity, propagation, or recovery | Evidence | Confidence |
| --- | --- | --- | --- |
| F1 | [influence] | [E keys] | [high, medium, or low] |

**Correlations and code smells:** [Explicitly non-causal observations.]

**Causal unknowns:** [Missing edge, consequence, and next evidence.]

## 6. Material impact and recovery account

| Finding | Affected users, commitment, data, cost, security, or operations | Durable state and owner | Terminal outcome | Evidence and confidence |
| --- | --- | --- | --- | --- |
| F2 | [material effect] | [state or unknown] | [outcome or unknown] | [E keys and confidence] |

**Stabilization and recovery:** [What restored or contained the incident, what
was reconciled, and what evidence proves the terminal state.]

**Impact and recovery unknowns:** [Opaque boundary or unsupported join and its
consequence.]

## 7. Detection and reconstruction assessment

| Finding | Type | Unanswerable or delayed question | Existing evidence or workaround | Consequence | Evidence and confidence |
| --- | --- | --- | --- | --- | --- |
| F3 | [detection, reconstruction, response, or recovery gap] | [question] | [signal or manual path] | [effect] | [E keys and confidence] |

**Evidence reuse decision:** [Which companion signal evidence was reused and
why no duplicate audit was needed, or the exact predicate for a direct audit.]

## 8. Ranked action portfolio

| Rank | Action | Primary category | Finding and evidence links | Expected benefit | Owner boundary and dependencies | Residual risk | Confidence | Proof status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | A1 — [corrective outcome] | [prevention, detection, response, or recovery] | [F and E keys] | [benefit] | [owner and dependencies] | [risk] | [confidence] | [planned, not planned, or blocked] |

### Unverified backlog candidates

- [Lower-ranked or speculative candidate, why it is unverified, and the
  evidence needed before promotion.]

## 9. Proof requirements for prioritized work packages

Include no more than three packages. State `none supported` when no action
meets the evidence and priority threshold.

### P1 — [work package]

- **Corrective claim:** [Observable proposition.]
- **Affected invariant and critical risks:** [Invariant and credible failure.]
- **Authoritative oracle:** [Public contract or authoritative state.]
- **Discriminating cases:** [Positive, negative, failure, and recovery cases.]
- **Environment and fidelity:** [Required tier, real components, and limits.]
- **Evidence artifact:** [Output retained by future authorized work.]
- **Acceptance gate:** [Entry, pass, prohibited outcomes, stop conditions.]
- **Authority requirement:** [Separate permission and owner.]
- **What this will not prove:** [Residual proof boundary.]

## 10. Cross-artifact reconciliation

| Chain | Reconciliation result | Contradiction or unknown | Consequence |
| --- | --- | --- | --- |
| [E keys -> F key -> A key -> P key] | [consistent or revised] | [gap] | [impact on conclusion or priority] |

**Confidence ceiling:** [Lowest-confidence material claim and resulting overall
confidence.]

## 11. Downstream handoff and residual risk

| Accepted work boundary | Downstream workflow | Inputs from this pack | Separate approval or evidence required |
| --- | --- | --- | --- |
| [cross-cutting change] | [shape-safe-change] | [F, A, and P keys] | [authority] |
| [behavior-preserving structure] | [plan-safe-refactor] | [F, A, and P keys] | [authority] |
| [narrow domain change] | [relevant domain skill] | [F, A, and P keys] | [authority] |

**Residual risks:** [Risk, owner boundary, and monitoring or decision need.]

**Implementation boundary:** No remediation, tracked work creation, design,
implementation, deployment, instrumentation, or test creation occurred in this
learning run.

**Next decision:** [Explicit human acceptance, authority, or evidence required
before downstream work begins.]
