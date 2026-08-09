---
name: map-change-impact
description: Map the likely blast radius of a proposed code, contract, schema, configuration, dependency, or infrastructure change before implementation. Use when planning a refactor, rename, API or event evolution, database migration, behavior change, dependency upgrade, feature removal, or configuration rollout; identify direct and transitive callers, consumers, persisted data, tests, operational surfaces, compatibility obligations, and rollout risks with evidence, confidence, and a focused validation plan.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Map Change Impact

Map the evidence-backed blast radius of one proposed change before
implementation. Distinguish required adaptations from plausible but unproven
effects and produce a focused validation and rollout plan.

## Preserve the authority boundary

Treat requests to assess, map, review, estimate, or plan impact as read-only.
Do not implement the proposed change, update dependencies, edit contracts,
modify generated files, or create migrations unless the user asks for
implementation. Inspect repository instructions and dirty state first.

Static analysis, builds, and tests can create ordinary ignored artifacts when
safe. Do not install dependencies, mutate shared services, publish packages,
apply infrastructure, or query production merely to expand the impact map.
State gaps that require unavailable repositories or runtime evidence.

## Define the proposed change

Describe the change as an explicit old-to-new contract:

- **Anchor:** symbol, behavior, schema, endpoint, event, configuration,
  dependency, resource, or operational policy being changed.
- **Old behavior:** current shape, semantics, default, guarantee, or lifecycle.
- **New behavior:** proposed replacement and intended compatibility.
- **Reason:** problem or capability motivating the change.
- **Scope:** repositories, services, environments, consumers, and deployment
  window in scope.
- **Constraints:** backward compatibility, ordering, data retention, rollback,
  availability, security, and deadlines.

If the proposal is vague, state a narrow interpretation and map that. Do not
blend several independent changes into one blast radius.

## Establish the anchor

1. Read repository instructions and identify authoritative source versus
   generated or vendored output.
2. Locate the anchor definition and its runtime selection or registration.
3. Establish current behavior from executable code, schemas, configuration,
   and tests.
4. Identify stable identifiers, public contracts, persisted representations,
   and deployment dependencies.
5. Record evidence while traversing outward.

Classify findings as:

- **observed:** demonstrated by current runtime evidence;
- **verified:** directly established in source or executable configuration;
- **declared:** stated by a contract, manifest, schema, or documentation;
- **inferred:** supported indirectly but not proven; or
- **unknown:** hidden in an unavailable repository, runtime, or external
  consumer.

Do not treat text matches as equal impact. A match may be executable,
generated, dead, test-only, documentation-only, or coincidental.

## Traverse impact surfaces

Start with direct references, then expand only through materially affected
relationships:

1. **Callers and implementations:** imports, calls, interface implementations,
   dispatch registries, reflection, plugins, and generated adapters.
2. **Contracts and consumers:** APIs, RPC, events, files, schemas, SDKs,
   webhooks, CLIs, and external integrations.
3. **Data and state:** schemas, migrations, queries, indexes, caches,
   projections, retained events, snapshots, backfills, and deletion.
4. **Behavior and policy:** validation, authorization, feature flags, defaults,
   fallbacks, retries, and concurrency assumptions.
5. **Operations:** deployment ordering, configuration, infrastructure,
   dashboards, alerts, runbooks, quotas, and rollback.
6. **Verification:** unit, integration, contract, migration, end-to-end, load,
   security, and recovery tests.
7. **Human surfaces:** documentation, examples, generated help, release notes,
   and support procedures when they define or communicate the contract.

Read `references/impact-surfaces.md` for change-type-specific search routes and
common hidden consumers.

Stop traversing when a dependency is insulated by an unchanged contract or
when further effects are speculative and immaterial. Record the insulation
boundary as evidence.

## Classify the impact

For every affected surface, record:

- relationship to the anchor;
- current assumption or contract;
- expected adaptation;
- consequence if unchanged;
- deployment or data-ordering constraint;
- evidence and evidence class;
- ownership when known; and
- validation that would prove compatibility.

Classify action:

- **required:** the new contract cannot work safely without this adaptation;
- **conditional:** required only for a named variant, deployment order, or
  compatibility choice;
- **investigate:** plausible impact with a specific unresolved fact;
- **unaffected:** inspected and insulated by a supported boundary; or
- **unknown owner:** impact crosses an unavailable or external boundary.

Do not use a generic low/medium/high label without explaining consequence and
likelihood.

## Analyze compatibility and rollout

Determine whether old and new producers, consumers, code, configuration, and
persisted data can coexist during deployment. Check:

- additive versus breaking contract changes;
- tolerant readers and writers;
- default and absence semantics;
- data migration, dual-read, or dual-write periods;
- retained events, queued work, and long-running workflows;
- cache and projection rebuilds;
- feature-flag and rollback behavior;
- binary or protocol compatibility;
- mixed-version startup and shutdown ordering; and
- irreversible state or external effects.

Read `references/rollout-and-validation.md` for compatibility matrices,
expand-and-contract sequencing, rollback analysis, and validation selection.

If safe rollout requires authority or coordination outside the repository,
name the owner and handoff rather than inventing it.

## Build the impact map

Use a dependency graph when relationships and ownership are central. Use a
table when adaptations and validation are central. Use both only for a
materially branching change.

Orient the graph outward from the anchor. Label edges with exact relationships
such as calls, implements, serializes, consumes, persists, configures,
observes, tests, or documents. Group nodes by repository, deployment unit, or
owner when useful.

Keep speculative nodes visually separate from verified impact. Do not imply
that an unavailable external consumer is safe merely because it is not visible.

## Verify completeness

Perform a second pass using different evidence routes:

- definition-to-reference and reference-to-definition search;
- code plus schema and configuration search;
- producer-to-consumer and consumer-to-producer contract search;
- current data plus historical migration or retained-event search;
- runtime registration plus source dependency search; and
- changed behavior plus tests, alerts, and rollback search.

Check deletions for dynamic references, public names, serialization strings,
configuration keys, and generated output. Confirm that every “unaffected”
claim names the insulating contract.

## Report

Lead with the highest-consequence required adaptations and the recommended
compatibility strategy. Then provide:

1. **Change contract:** anchor, old behavior, new behavior, scope, and
   constraints.
2. **Impact visualization:** optional graph for relationships and ownership.
3. **Impact ledger:** surface, relationship, action class, consequence,
   adaptation, owner, evidence, and validation.
4. **Compatibility matrix:** old and new producers, consumers, code, config,
   and data during the rollout window.
5. **Rollout and rollback:** ordered phases, observability gates, irreversible
   steps, and stop conditions.
6. **Validation plan:** smallest checks that cover each required or conditional
   impact.
7. **Unknowns:** unavailable consumers, dynamic wiring, runtime-only behavior,
   and the evidence or owner needed next.

If the user asked only for impact analysis, stop before implementation.

## Examples

- Map the impact of renaming a public field across clients, events, stored
  records, projections, dashboards, and retained payloads.
- Assess a dependency upgrade that changes defaults, wire behavior, generated
  code, and supported runtime versions.
- Plan removal of a feature flag across codepaths, configuration, data cleanup,
  observability, and rollback.
