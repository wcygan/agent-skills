# Acceptance scenarios

Use applicable scenarios to challenge accepted requirements. Establish each
scenario's expected behavior from the flow contract; examples are prompts,
not proof that the current implementation is defective or needs every control.

## Durable and asynchronous work

Distinguish acceptance, durable handoff, execution, acknowledgment, and terminal
effects. Preserve operation identity across attempts; separate operation,
attempt, message, and domain-record identities when their semantics differ.

| Boundary | Discriminating scenario | Evidence to connect |
|---|---|---|
| Accepting work | Process exits after the public response but before processing. | Declared acceptance semantics, durable intent or rejection, and later disposition. |
| Applying an effect | Process exits after the effect but before acknowledgment. | Effect identity, retry decision, prohibited duplicate, and terminal state. |
| Selecting work | Two workers compete, or a lease expires while one still runs. | Ownership, fencing or equivalent guarantee, actual effects, and completion. |
| Retrying | Dependency times out after possibly accepting the request. | Ambiguous completion policy, effect lookup or reconciliation, bounded retry, and operator signal. |
| Cancelling | Cancellation races with dispatch or commit. | Declared cancellation boundary, permitted effects, and final caller/worker state. |
| Resuming | Restart encounters unfinished or malformed durable state. | Supported interpretation, bounded recovery, terminal or quarantined outcome, and diagnostic identity. |

A passing retry loop does not prove that no duplicate external effect occurred.
Use authoritative effect evidence. When the external boundary cannot be
exercised safely, label the substituted proof and retain that acceptance gap.

## Capacity and resource ownership

Test only conditions material to the operating envelope: representative input
size and concurrency, a slow dependency, bounded queue/admission behavior,
deadline expiration, startup/shutdown, and resource cleanup.

Define timing and resource metrics precisely and compare under equivalent
conditions. Retain workload, cache state, environment, sample counts, and noise
limits. Rejection or shedding must have the declared user-visible outcome;
bounded resource use cannot be claimed solely from configuration values.

## Detection and recovery

For each selected failure, connect its actual result to the signal an operator
would use, then to a bounded recovery action and authoritative confirmation.
Keep these claims distinct:

- instrumentation exists in source;
- a controlled run emits the expected signal and identifiers;
- the intended telemetry consumer receives and interprets it; and
- the recovery action restores the required state or establishes resumable work.

Record which links were exercised in which environment. A local emitted log
does not prove a deployed alert. An alert clearing does not prove that affected
records or external effects were reconciled.

Operator instructions must name target identity, prerequisites, action, bounds,
irreversible effects, stop conditions, and confirmation. Use an established
repository command when available. Validate instructions against the same
candidate and control state used by the acceptance checks.

## Counterexamples and completion limits

- One known timeout defect needs `find-and-fix`; a broader maturity workflow
  earns its scope only through additional operational acceptance requirements.
- A pure helper with complete unit proof does not need a queue or recovery
  subsystem merely because it participates in an application.
- Restarting an isolated process proves only the exercised checkpoint and
  dependency semantics; distributed failover remains unproven without suitable
  evidence.
- A control that changes public errors or persisted state needs a declared
  behavior delta and compatibility proof.
- Source rollback after new durable effects may require reconciliation or
  rolling forward. Describe the actual supported recovery path.
