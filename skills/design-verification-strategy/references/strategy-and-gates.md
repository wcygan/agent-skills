# Strategy and Gates

Use this reference to assemble a risk-based proof matrix and a promotion gate.

## Risk-to-proof matrix

```text
risk:
consequence:
invariant or requirement:
discriminating scenario:
proof tier:
real components:
substituted components:
oracle:
environment:
evidence artifact:
runtime and authority:
known gap:
```

Group risks only when the same scenario and oracle genuinely discriminate all
of them.

## Environment fidelity

Compare relevant dimensions rather than labeling an environment “production
like” without qualification:

- operating system, architecture, runtime, and packaging;
- database engine, schema, isolation, and data volume;
- network path, DNS, certificates, proxies, and policy;
- identity, authorization, and secret-delivery mechanism;
- queue or workflow delivery and retry semantics;
- external provider behavior and quotas;
- concurrency, load, time, and failure conditions; and
- deployment topology, version skew, and persistent state.

Name only dimensions that affect the claim. Record mismatches as proof gaps.

## Independent verification

Use independent verification when:

- generated or optimized candidates can alter their normal tests;
- the producer and evaluator would otherwise share the same faulty assumption;
- policy or security boundaries require separation;
- an irreversible release depends on the result; or
- acceptance must survive self-modification.

Pin the verifier version and inputs. Restrict its authority and network access.
Retain rejection evidence. A candidate fix must not edit the held-out oracle.

## Acceptance gate template

```text
Claim:
Candidate source revision:
Dependency or lock identity:
Built artifact identity:
Configuration identity:
Target environment:

Entry prerequisites:
Required focused checks:
Required integrated checks:
Required target checks:
Required recovery checks:
Independent checks:

Pass threshold:
Known tolerated variance:
Prohibited outcomes:
Stop conditions:
Evidence retained:
Evidence retention and privacy:
Rollback or retry state:
Human decision owner:
Residual risks:
```

## Gate quality checks

- Each command has a documented scope and timeout.
- Failures preserve the earliest useful cause.
- Evidence names the exact candidate and environment.
- Retries do not erase prior failures or create uncontrolled side effects.
- Cleanup is scoped and safe after partial failure.
- The gate does not depend on manual interpretation unless that judgment and
  owner are explicit.
- Passing lower tiers cannot override a required higher-tier failure.
