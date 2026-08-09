# Kubernetes and GitOps State Evidence

Use this reference to reconcile the layers involved in one operational
scenario. Query only the authorized cluster, namespace, resources, and time
window.

## State layers

| Layer | Identity to retain | Evidence | Typical false inference |
|---|---|---|---|
| Desired Git | repository, path, revision | source files, lock files, commit | default branch equals applied revision |
| Rendered | inputs, overlays, chart and values versions | deterministic render or controller artifact | source text equals final object |
| GitOps source | source object, observed revision | status conditions and artifact revision | source Ready means apply succeeded |
| Reconciliation | controller object, generation, revision | Ready/Healthy conditions, inventory, errors | controller retry means progress |
| Applied object | UID, generation, resource version, owners | object spec/status and managed fields | live spec is Git intent |
| Kubernetes controller | rollout or job revision | controller conditions, replicas, events | pod existence means readiness |
| Workload | pod UID, container, restart count, image digest | status, probes, bounded logs | recent logs contain earliest failure |
| Dependency | endpoint, claim, secret reference, custom resource | status and narrow connectivity evidence | dependency object existence means usable |
| External outcome | route, consumer, user journey | authorized health or acceptance evidence | internal readiness proves external success |

## Conditions and generations

- Compare `metadata.generation` with `status.observedGeneration` when the
  resource supports it.
- Read condition type, status, reason, message, transition time, and owning
  controller together.
- Preserve the exact source revision and artifact or image digest.
- Distinguish desired replicas, updated replicas, ready replicas, and available
  replicas.
- Treat repeated reconcile or restart counts as symptoms until the earliest
  reason is identified.

## Chronology

Build chronology from controller conditions, Kubernetes events, pod/container
state, and bounded logs. Account for:

- event aggregation and retention;
- controller and node clock differences;
- container restarts and previous logs;
- retries that replace the earliest error with a downstream symptom;
- resource recreation that changes UIDs; and
- multiple attempts sharing the same workload name.

Use ownership, generation, revision, UID, and attempt identity to establish
relationships. Do not rely only on timestamps.

## Subsystem evidence

### Scheduling and resources

Inspect scheduling conditions, taints and tolerations, affinity, topology,
requests and limits, quotas, and node health. A pending pod is not necessarily
resource pressure.

### Images and startup

Separate registry authentication, image resolution, digest, pull, container
creation, command/configuration, startup, and probe failures.

### Networking and DNS

Separate name resolution, returned address family, routing, network policy,
service selection, endpoint readiness, proxy or gateway routing, certificates,
and application response.

### Storage

Separate provisioning, binding, attachment, mount, permissions, filesystem
health, application access, and retained data correctness.

### Configuration and secrets

Inspect reference names, namespaces, ownership, readiness conditions, versions,
and delivery controllers without reading secret values. Separate missing input,
provider access, transformation, target write, and workload reload.

### RBAC and admission

Separate authentication, authorization, admission policy, webhook availability,
and controller service-account permissions. Avoid granting broad permissions as
a diagnostic shortcut.
