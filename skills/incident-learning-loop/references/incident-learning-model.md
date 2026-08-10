# Incident Learning Model

Use this reference only for evidence classification, causal language, action
ranking, or reconciliation during an `incident-learning-loop` run.

## Evidence classes

Classify a claim by the strongest evidence that directly supports that claim,
not by the authority or volume of the surrounding document.

| Class | Meaning | Typical source | Does not prove |
| --- | --- | --- | --- |
| `observed` | Captured runtime, incident-window, or controlled evidence directly shows the claimed event or state. | Redacted telemetry, durable state snapshot, controlled reproduction, timestamped command output | The causal mechanism beyond what the observation discriminates |
| `verified` | Source, executable configuration, schema, artifact identity, or authoritative state directly establishes the claim. | Exact code path, deployed configuration, authoritative incident state, committed record | That configured behavior occurred in the incident window unless runtime evidence joins it |
| `declared` | A contract, runbook, dashboard, alert definition, policy, or documentation states the intended behavior. | API contract, SLO, runbook, architecture decision | Runtime conformance |
| `reported` | A person or incident record states the claim, without independent confirmation in this run. | Incident notes, support report, operator recollection, vendor statement | Independent observation or causal proof |
| `inferred` | Multiple facts support an explanation indirectly, but a material discriminating link is absent. | Time-aligned signals, partial traces, source plus report | A verified causal edge |
| `unknown` | Evidence is unavailable, ambiguous, expired, unsafe to obtain, or hidden behind an opaque boundary. | Sampled-away spans, expired logs, inaccessible vendor internals | Any positive or negative conclusion |

One source may support different claims at different classes. A configuration
file can verify a retry limit while only supporting an inference that the same
limit governed the incident. Preserve the join that connects source,
configuration, artifact version, environment, and time window.

For each ledger row record:

```text
Evidence key:
Source reference and owner:
Time window or artifact identity:
Claim supported:
Evidence class:
Integrity, retention, sampling, or access limit:
Redaction or sensitivity handling:
Finding keys that use it:
```

Use `high`, `medium`, or `low` confidence separately from evidence class:

- **High:** material claims use direct observed or verified evidence, identity
  and time joins are supported, and no unresolved contradiction could change
  the conclusion.
- **Medium:** the account is coherent, but declared, reported, or inferred
  evidence leaves a bounded uncertainty.
- **Low:** a material edge, identity join, terminal outcome, or contradiction
  remains unknown.

Overall confidence cannot exceed the lowest-confidence material claim.

## Causal language

Keep these terms separate:

| Term | Use it for | Required support |
| --- | --- | --- |
| **Trigger** | The event or condition that initiated or exposed the failure path. | Evidence that it occurred at the start of the bounded incident path |
| **Root cause** | The causal mechanism whose behavior explains the material departure and propagation. | A complete material mechanism, discriminating evidence, addressed counterevidence, and no unknown causal edge that could change the conclusion |
| **Leading causal hypothesis** | The best supported mechanism with one or more named material links not yet proven. | Coherent mechanism, supporting evidence, confidence, contradictors, and the smallest discriminating next evidence |
| **Contributing condition** | A condition that changed probability, severity, propagation, detection, response, or recovery. | Evidence for its influence without claiming it independently caused the incident |
| **Correlation** | Events or states that co-occurred without a supported causal mechanism. | Accurate temporal or population association and an explicit non-causal label |
| **Code smell** | A maintainability concern that may suggest a hypothesis. | Source evidence only; it is never causal evidence by itself |

Use **root cause** only when all of these are satisfied:

1. The proposed mechanism explains the observed departure from expected
   behavior and every material propagation edge to the incident outcome.
2. At least one discriminating control, state transition, artifact comparison,
   counterexample schedule, or equivalent evidence changes the outcome as the
   mechanism predicts.
3. A nearby negative case or contradictory explanation has been tested or
   bounded by evidence.
4. Artifact, environment, identity, and time joins connect the mechanism to
   this incident.
5. No unknown material causal edge could replace the conclusion.

A faithful reproduction is strong discriminating evidence but is not always
available after stabilization. A versioned configuration change, isolated
counterexample, rollback observation retained from the incident, or another
authoritative transition may be sufficient when it demonstrates the same
mechanism. Label the conclusion a leading hypothesis when that distinction is
not supported.

Distinguish gap types:

- **Detection gap:** the unhealthy state or material outcome was not recognized
  accurately and promptly.
- **Reconstruction gap:** existing evidence cannot join the initiating
  operation, attempts, effects, and terminal outcome after the fact.
- **Response gap:** detection did not produce timely interpretation,
  ownership, escalation, or safe action.
- **Recovery gap:** restoration, compensation, reconciliation, or proof of the
  recovered terminal state was slow, unsafe, incomplete, or ambiguous.

## Action-ranking rubric

Every action must cite at least one supported finding. Compare actions on these
dimensions rather than ranking attractive implementations in isolation:

| Dimension | High | Medium | Low |
| --- | --- | --- | --- |
| Consequence addressed | Prevents or exposes severe user, data, security, financial, or operational harm | Addresses meaningful degradation or toil | Addresses cosmetic or weakly supported harm |
| Recurrence exposure | Common path, persistent condition, or likely repeat | Bounded or occasional exposure | One-off or unknown exposure |
| Risk-reduction leverage | Breaks the causal path or materially shortens detection or recovery | Reduces severity or uncertainty | Indirect or marginal benefit |
| Evidence strength | Finding and mechanism are observed or verified | Finding has bounded reported, declared, or inferred support | Action is primarily speculative |
| Owner readiness | One owner boundary can act with known dependencies | Coordination is bounded but unresolved | Ownership or authority is unknown |
| Proof feasibility | Authoritative, discriminating proof is available at suitable fidelity | Proof has an explicit environment or access gap | Success cannot currently be distinguished from failure |
| Residual risk | Known and materially reduced | Meaningful exposure remains | Most exposure remains or shifts elsewhere |

Assign an overall priority:

- **Priority 1:** evidence-supported, high-consequence or high-exposure work with
  material leverage, a bounded owner, and feasible proof.
- **Priority 2:** meaningful supported work whose consequence, leverage, coordination,
  or proof is less favorable.
- **Backlog:** weakly supported, low-leverage, ownerless, or currently unprovable;
  retain as an unverified backlog candidate.

Use judgment, not arithmetic. Break ties by consequence addressed, recurrence
exposure, risk-reduction leverage, and time to trustworthy proof, in that
order. Cheap work does not outrank causal-path work solely because it is easy.
Do not let a detection action masquerade as prevention or an implementation
task masquerade as a corrective outcome.

An action row is complete only with:

```text
Action and primary category:
Finding and evidence keys:
Expected benefit and affected invariant:
Owner boundary and dependencies:
Priority rationale:
Residual risk:
Confidence:
Proof status: planned | not planned | blocked
```

## Reconciliation rules and examples

Use stable keys to link evidence (`E`), findings (`F`), actions (`A`), and proof
packages (`P`). A valid chain looks like:

```text
E2 + E5 -> F3 detection gap -> A2 detection action -> P1 verification claim
```

The proof package validates the corrective claim, not the historical finding.
Historical evidence establishes why the action is proposed; future proof
establishes whether the implemented change would satisfy its claim.

### Known-cause outage

Verified deployed configuration and incident-window telemetry establish the
mechanism and terminal outage. Skip `diagnose-difficult-bug`. If affected
users or durable outcomes remain unclear, route one impact question through
`map-production-scenario`. Reuse its signal assessment; do not invoke a direct
observability audit for the same question.

### Retry storm with uncertain impact

The retry mechanism may be observed while user and durable-state outcomes are
unknown. Route the impact question through `map-production-scenario` first and
reuse its identity and coverage evidence in `diagnose-difficult-bug` if the
causal mechanism remains uncertain. A metric showing retry volume is impact
evidence only when it joins to a supported user, state, cost, or terminal
outcome.

### Conflicting evidence

If incident notes report successful recovery but authoritative durable state
shows unresolved work, preserve both entries. The terminal outcome remains
incomplete, recovery confidence is low, and actions that assume full recovery
cannot be ranked Priority 1 until the conflict is resolved.

### Opaque vendor boundary

If a vendor reports a cause but exposes no discriminating evidence, record the
statement as `reported`, name the opaque boundary, and state its consequence.
Do not convert reputation or contractual authority into verified evidence.

Before finalizing, walk every chain in both directions:

- Every finding points backward to evidence.
- Every action points backward to a finding and forward to residual risk.
- Every planned proof package points backward to one corrective claim.
- Every executive conclusion can be reconstructed from the linked rows.
- Every unknown names which conclusion, ranking, or handoff it limits.
