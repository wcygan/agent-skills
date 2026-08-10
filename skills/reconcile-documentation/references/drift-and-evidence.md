# Drift and Evidence

Use this reference to decide what a mismatch means before editing either side.

## Model a claim

A material documentation claim is:

```text
meaning + scope + qualifiers + authority + evidence + consumer consequence
```

Qualifiers commonly include version, platform, environment, tenant, feature
state, audience, time window, and compatibility mode. Normalize the meaning for
comparison while preserving those qualifiers. Two statements are inconsistent
only when their scopes overlap.

Useful claim classes and likely evidence routes:

| Claim class | Start with | Corroborate with |
| --- | --- | --- |
| Command or flag | Command definition or bounded `--help` | CLI tests and examples |
| Path or layout | Tracked filesystem and build configuration | Packaging or install tests |
| API or schema | Normative contract and generator input | Types, handlers, contract tests |
| Configuration or default | Parser, schema, and defaulting logic | Sample config and focused tests |
| Workflow or state | Workflow definition and guards | Tests, durable events, bounded traces |
| Operational procedure | Runbook authority and deployed configuration | Existing telemetry and recovery evidence |
| Version or compatibility | Manifest, lock, release contract | Runtime version and release tests |
| Example output | Example source and its contract | Existing executable harness |
| Link or navigation | Site/navigation source | Link checker and built site |

## Separate authority from evidence class

**Authority role** answers who may define intended truth:

- normative contract or policy;
- executable implementation or configuration;
- observed runtime or deployed state;
- generator input;
- documentation owner;
- external provider; or
- historical record.

**Evidence class** answers how well the current value is supported:

- `observed`, `verified`, `declared`, `reported`, `inferred`, or `unknown`.

Never rank authority solely by evidence class. For example, observed behavior
can be a verified defect against a normative specification. Conversely, an old
design note can be declared evidence without retaining current authority.

## Resolve the authority owner

Apply this decision sequence per claim:

1. Does a governing instruction, schema, specification, policy, ADR, or
   generator explicitly name the source of truth? If so, verify that the
   designation still applies to the claim's scope and version.
2. Does change history, a current issue or specification, tests, or release
   evidence establish an intentional transition? Preserve old and new time
   boundaries rather than flattening them.
3. Does the project treat executable behavior as the contract, or can
   implementation violate a separately owned contract? Establish this from
   repository evidence rather than convention.
4. Is one surface derived from another? The derivation owner outranks the
   generated or mirrored copy for edits.
5. Does authority live outside the accessible project? Mark the claim
   `external-unknown` until a primary source is available.
6. If two plausible owners remain, mark the claim `ambiguous` and preserve the
   conflict. Do not choose the easier side to edit.

Version-control history can explain intent but does not automatically establish
current truth. Tests can prove implemented behavior but may encode the same
drift as source. Runtime evidence can prove what happened within its bounded
environment but not what ought to happen everywhere.

## Assign one drift state

| State | Meaning | Update-mode action |
| --- | --- | --- |
| `aligned` | Documentation and authority express the same scoped meaning | No edit |
| `documentation-stale` | Project-owned documentation lags authoritative intent | Patch and prove |
| `implementation-drift` | Normative documentation remains authoritative | Report; hand off implementation work |
| `generated-stale` | Correct generator input has outdated documentation output | Run the safe owning generator |
| `duplicated` | Equivalent claims have competing or inconsistent owners | Consolidate only when ownership is proven |
| `external-unknown` | Primary external evidence is unavailable or unauthorized | Report the exact missing source |
| `ambiguous` | Scope, intent, or authority cannot be resolved | Preserve both sides and request a decision |
| `out-of-scope` | Another repository, owner, or task owns the mismatch | Report a bounded handoff |

Do not use a generic severity label as the state. Separately record consequence
and confidence.

## Set confidence

- **High:** authority is explicit, scopes match, and direct evidence proves the
  current value.
- **Medium:** authority is supported and evidence is direct, but one bounded
  qualifier or environment remains unproved.
- **Low:** authority or value depends on inference, secondary records, or
  incomplete scope.

Only high-confidence documentation drift is automatically eligible for edits.
Medium-confidence edits require the uncertainty not to affect the revised
meaning and must retain the unresolved qualifier. Low-confidence findings stay
read-only.

## Reconcile duplicates

When several documents express one claim:

1. Identify the single owner of the meaning.
2. Decide whether other surfaces are purposeful summaries, generated views,
   scoped variants, or accidental copies.
3. Keep summaries linked and qualified instead of cloning the full rule.
4. Update every directly dependent summary in the same patch.
5. Mark independently owned variants as separate claims.

An easily discoverable command, path, or default restated in prose is a cache.
Preserve it only when the lookup cost or reader need justifies its drift risk.
Removing such a cache is cleanup, not automatic reconciliation, unless the
user's update scope includes consolidation.

## Claim Ledger template

| Key | Surface and location | Normalized claim | Class | Authority | Evidence | State | Confidence | Consequence | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | D1, setup section | CLI accepts `--config PATH` | Command | CLI definition | `verified`: option declaration | `documentation-stale` | High | Setup command fails | Replace old flag and run CLI check |

Every eligible patch line must trace to at least one claim key. Every unresolved
claim must name the missing authority or evidence rather than merely saying
"needs investigation."
