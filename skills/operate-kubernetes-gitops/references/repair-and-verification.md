# GitOps Repair and Verification

Use this reference after the failure boundary is supported by evidence and
before recommending or performing a mutation.

## Repair selection

| State owner | Preferred durable repair | Avoid |
|---|---|---|
| Git-managed manifest | focused reviewed repository change | permanent imperative patch |
| Generated manifest | change the source input or generator | editing generated output only |
| GitOps controller | correct source/config, then bounded reconcile action | repeated reconcile without cause |
| Kubernetes controller | correct desired spec or dependency | deleting resources to force progress |
| External dependency | repair through its authorized control plane | compensating cluster drift |
| Emergency runtime | minimal time-bounded mitigation plus Git follow-up | undocumented live state |

## Mutation preflight

Confirm:

- exact cluster context, namespace, object, UID, and current revision;
- mutation owner and granted authority;
- current Git and live drift;
- data and availability consequences;
- backup, snapshot, or known recovery state where applicable;
- controller behavior expected after the change;
- timeout and stop conditions;
- rollback operation and whether it is actually reversible; and
- independent acceptance checks.

For generated, signed, encrypted, or credential-bearing inputs, use the
repository's established toolchain. Do not expose plaintext to create a patch.

## Change discipline

1. Make one causal change at the authoritative owner.
2. Preserve the before-state evidence.
3. Record the exact revision, object generation, or external change identity.
4. Observe reconciliation rather than issuing repeated actions.
5. Stop on an unexpected target, broader diff, admission failure, data risk,
   or missing rollback prerequisite.
6. Roll back when the named trigger occurs; do not stack speculative repairs.

## Verification ladder

Verify each affected layer independently:

```text
source revision
-> deterministic render or validation
-> GitOps observed revision and healthy reconciliation
-> applied generation and controller convergence
-> workload readiness without a repeating failure loop
-> dependency and durable-data correctness
-> service and user-visible acceptance
-> sustained health for the relevant recurrence window
```

Record exact commands or queries, timestamps, revisions, digests, and results.
Do not call a lower layer proof of a higher layer.

## Rollback cautions

- Reverting Git may not reverse a completed data migration or external effect.
- Rolling back an image may be incompatible with the current schema or state.
- Deleting a pod does not restore prior configuration or data.
- Recreating a resource can change identities, addresses, volumes, and ownership.
- Resuming a suspended controller can immediately apply accumulated changes.
- Credential rotation can invalidate healthy consumers and destroy diagnostic
  evidence.

State irreversible and mixed-state consequences before calling a rollback safe.

## Completion evidence

Retain:

- before and after source revisions;
- relevant rendered diff or validation result;
- controller revision and conditions;
- workload revision or image digest;
- bounded event and error evidence;
- dependency and data checks;
- external acceptance result; and
- remaining temporary resources, drift, or monitoring window.
