---
name: operate-kubernetes-gitops
description: Diagnose and operate Kubernetes systems managed by GitOps by reconciling repository intent, rendered manifests, controller status, Kubernetes objects, events, logs, dependencies, and user-visible health. Use for Flux or Argo CD reconciliation failures, rollout stalls, DNS, networking, storage, secret, RBAC, or configuration drift issues, and safe GitOps repair planning; work read-only first, distinguish desired, rendered, applied, live, and external state, and mutate only with explicit authority, rollback, and acceptance criteria.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Operate Kubernetes with GitOps

Diagnose one Kubernetes or GitOps scenario by reconciling declared intent with
rendered configuration, controller state, live resources, workload behavior,
dependencies, and user-visible health. Prefer durable Git changes for managed
state and make every live mutation explicit and recoverable.

## Preserve the authority boundary

Treat requests to inspect, diagnose, audit, assess, or recommend as read-only.
Do not reconcile, suspend, resume, restart, scale, delete, patch, apply, roll
back, rotate credentials, change DNS, or modify Git unless the user explicitly
requests the relevant mutation.

Before any cluster command, establish the exact kube context, cluster,
namespace, and identity. Prefer namespaced reads. Do not enumerate secrets,
decode secret data, copy credentials, or expose private endpoints. Conditions,
metadata, ownership, and delivery status are usually enough.

Treat port forwarding, ephemeral containers, debug pods, ad hoc jobs, and test
traffic as mutations with resource, network, cleanup, and data consequences.
Do not use them during a read-only assessment without explicit authority.

Inspect repository instructions and dirty state before editing. Preserve
unrelated work. Never make an imperative live edit to a GitOps-managed field as
an undocumented permanent repair.

## Define one operational scenario

Specify:

- **Symptom:** failed reconciliation, degraded workload, stalled rollout,
  missing dependency, drift, or user-visible failure.
- **Scope:** cluster, namespace, controller, application, resource, and time
  window.
- **Expected state:** repository revision, release, manifest, dependency, and
  externally visible outcome.
- **Current evidence:** exact observation that triggered the investigation.
- **Authority:** read-only, repository change, controller action, live
  mitigation, or external-system change.
- **Acceptance:** conditions that prove recovery without creating hidden drift.

Avoid “check the cluster.” Select one affected path and its required
dependencies.

## Establish identity and preflight

Capture before diagnosis:

1. current kube context and target namespace;
2. repository, branch or revision, and dirty state;
3. GitOps controller and source revision it reports;
4. affected resource identity, generation, revision, and owners;
5. relevant deployment, image digest, configuration, and dependency identities;
6. incident or change window; and
7. current user-visible and workload health.

Fail closed on an unexpected context, ambiguous target, missing read access, or
unclear mutation ownership. Do not repair the first similarly named resource
returned by a broad query.

## Reconcile the state layers

Inspect these layers separately:

```text
desired Git -> rendered manifests -> GitOps source/controller -> applied objects
            -> Kubernetes controllers -> workload runtime -> dependencies
            -> external/user-visible outcome
```

For each layer, record identity, expected state, observed state, conditions,
owner, evidence time, and drift. A healthy Git source does not prove applied
resources are ready. Ready pods do not prove service endpoints, persistence, or
the user-visible path works.

Read `references/state-and-evidence.md` for the state model, condition reading,
chronology, and subsystem evidence.

## Build the failure chronology

Work from the earliest failure in the selected window:

1. controller or source condition transition;
2. Kubernetes event or generation change;
3. scheduling, mount, network, image, configuration, or startup failure;
4. dependency or external-system failure; and
5. later retries, backoff, restarts, and repeated symptoms.

Preserve reason, message, generation, resource version, restart count, and
timestamps where relevant. Repeated terminal errors are often effects; prefer
the first discriminating error before the retry loop.

Do not infer causality from timestamp proximity alone. Connect events through
resource ownership, revision, generation, request identity, or a verified
dependency path.

## Trace the affected path

Follow only dependencies required by the scenario:

- GitRepository, OCIRepository, chart, kustomization, or application source;
- rendered namespace, service account, RBAC, config, and secret references;
- deployment, stateful set, daemon set, job, pod, and container state;
- scheduling, probes, resource pressure, images, volumes, and persistent claims;
- service selectors, endpoint slices, ingress or gateway, policy, DNS, and
  certificates;
- operators, custom resources, webhooks, and external control planes; and
- actual user or consumer-visible outcome.

Stop traversal when evidence proves a healthy boundary unrelated to the
symptom. Mark inaccessible external dependencies unknown.

## Test competing hypotheses read-only

Use a short ledger:

```text
hypothesis | supporting evidence | contradicting evidence | next read-only check | status
```

Prefer one discriminating query over broad log collection. Bound log time,
containers, resources, and output. Use current events and conditions alongside
logs because restarts and retention can remove the earliest cause.

Common distinctions include:

- source unavailable versus render or apply failure;
- reconciliation failure versus workload failure after successful apply;
- desired change versus stale controller revision;
- pod readiness versus service reachability;
- missing secret reference versus failed external secret delivery;
- DNS resolution versus address-family or network-policy reachability;
- volume attachment versus mount, permission, or application-level storage;
- RBAC denial versus admission or policy rejection; and
- live drift versus intentional controller-owned mutation.

## Choose the repair boundary

Prefer the smallest repair at the authoritative owner:

1. repository change for GitOps-managed desired state;
2. external dependency repair when Git and cluster state are correct;
3. controller action when desired state is correct but reconciliation is stuck;
4. live mitigation only when explicitly authorized, time-sensitive, and paired
   with a durable follow-up; and
5. no mutation when evidence is insufficient.

Do not use a restart as a substitute for diagnosis. Do not delete and recreate
stateful resources without an explicit data-recovery plan. Do not rotate or
recreate credentials until evidence identifies credential state as the cause.

Read `references/repair-and-verification.md` before recommending or performing
a mutation.

## Define a mutation contract

Before an authorized change, state:

```text
mutation owner and exact target:
expected mechanism and scope:
preconditions and backup or recovery state:
predicted controller and workload transitions:
stop conditions and timeout:
rollback trigger and operation:
acceptance checks at each state layer:
evidence to retain:
```

Resolve exact names, namespaces, paths, and revisions with read-only checks.
Perform one causal change at a time. Observe the expected transition before
continuing. If the repair requires authority for Git, cluster, DNS, cloud,
secrets, or another system that was not granted, stop and request it rather
than substituting a different mutation.

## Verify recovery end to end

Verify independently:

- desired revision contains the intended durable change;
- rendered output is valid for the target;
- GitOps source and reconciliation report the intended revision;
- applied object generation and controller status converge;
- workloads become ready without a new restart or event loop;
- required dependencies and data remain correct;
- service or user-visible acceptance passes; and
- no unmanaged live drift or temporary debug resource remains.

Use the exact artifact or image digest promoted by the change. A newly rebuilt
artifact needs its own evidence. Observe long enough to cover the failure's
known recurrence window when practical; otherwise state the residual risk.

## Report

Lead with current impact, earliest supported cause, and whether mutation is
needed. Then provide:

1. **Scope and identity:** context, namespace, revision, resources, window, and
   authority.
2. **State reconciliation:** desired, rendered, controller, applied, runtime,
   dependency, and external state.
3. **Failure chronology:** earliest error, propagation, retries, and current
   health.
4. **Hypothesis ledger:** evidence, rejected explanations, and confidence.
5. **Repair contract:** authoritative owner, change, stop conditions, rollback,
   and durable follow-up.
6. **Verification:** exact checks and evidence across every affected layer.
7. **Residual risks:** unavailable systems, recurrence window, and remaining
   drift or temporary state.

## Examples

- Diagnose why a Flux Kustomization is Ready while the application still has no
  healthy endpoints.
- Separate an ExternalSecret delivery failure from DNS, address-family,
  provider, credential, and controller retry symptoms.
- Plan a Git-backed repair for a stalled StatefulSet without imperatively
  replacing persistent resources.
- Verify an image update by source revision, applied digest, rollout state,
  dependency health, and user-visible acceptance.
