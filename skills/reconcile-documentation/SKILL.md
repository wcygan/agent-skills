---
name: reconcile-documentation
description: Audit and reconcile project documentation against authoritative repository and runtime evidence. Use when READMEs, documentation sites, runbooks, examples, agent instructions, or skill directories may be stale after code, configuration, interface, workflow, dependency, or layout changes; discover documentation wherever the project stores it, determine which side of each mismatch is authoritative, update only confirmed project-owned documentation, and validate commands, paths, links, examples, and documentation builds.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Reconcile Documentation

Discover the documentation topology of one bounded project, reconcile material
claims against their actual authority, update confirmed documentation drift,
and leave evidence showing what is current and what remains unresolved.

## Establish the run contract

Select exactly one mode from the user's request:

- **Audit:** requests to check, assess, review, find, or report drift remain
  read-only. Return findings in the response and stop before editing.
- **Update:** requests to update, fix, refresh, align, or reconcile
  documentation authorize edits to in-scope, project-owned documentation.
  Keep executable code, schemas, infrastructure, product configuration, and
  external systems read-only.

When intent is ambiguous, use Audit. A request to change implementation so it
matches a specification is an implementation task, not documentation
reconciliation. Writing a new guide without a current claim to reconcile is a
documentation-authoring task.

Before inspection or edits:

1. Read the repository's governing instructions for every in-scope path.
2. Inspect version-control status and preserve unrelated work.
3. Define the repository, package, service, audience, and environment boundary.
4. Record whether generated, vendored, published, or externally owned
   documentation may be inspected or changed.
5. Choose the narrowest traversal that can answer the request.

Ordinary read-only commands and project-native documentation checks are in
scope. Do not install dependencies, start shared services, query production,
publish a documentation site, update external systems, or create durable
reports unless the user separately authorizes that action. Safe validation may
create ordinary ignored artifacts; identify and contain them.

The run contract is complete when the mode, scope, anchor, allowed writes, and
excluded surfaces are explicit.

## Choose a traversal

Use one primary traversal:

| Request shape | Traversal | Starting evidence |
| --- | --- | --- |
| Documentation after a code or configuration change | **Change-driven** | Named diff, commit, branch, release, or changed files |
| One document, section, or claim may be stale | **Document-driven** | Named documentation surface and its material claims |
| The project needs a general drift audit | **Bidirectional** | Bounded documentation corpus and prioritized claim classes |

For a change-driven run, establish a fixed point and summarize the semantic
changes before searching for affected documentation. A text diff is a lead,
not proof that behavior changed. For a document-driven run, extract claims
before searching for matching source. For a bidirectional run, declare a file,
package, claim-class, or time budget and report uncovered surfaces; never imply
repository-wide completeness from an unbounded scan.

If the user does not name a fixed point, infer the narrowest defensible anchor
from the current diff, branch relationship, or named work and state it. Keep
independent changes in separate ledgers.

The traversal is complete when every candidate claim can be traced back to the
same bounded anchor and scope.

## Discover the documentation topology

Documentation is identified by project evidence, not by one conventional
directory. Honor user-supplied paths first, then inspect repository
instructions, tracked files, documentation build or navigation configuration,
task definitions, CI, and links from known documentation.

Include relevant human guides, READMEs, runbooks, examples, reference material,
normative specifications, ADRs, release instructions, package-local docs, and
agent-facing material such as `AGENTS.md`, `CLAUDE.md`, or installed skill
trees. Classify generated, vendored, mirrored, published, and externally owned
surfaces even when they are not direct edit targets.

Read `references/documentation-discovery.md` when the documentation location is
not explicit, the repository is a monorepo, agent instructions or skills are in
scope, or generated and externally published surfaces must be distinguished.

Create stable surface keys (`D1`, `D2`, ...) and record:

- path or external location;
- audience and owner when known;
- kind and authority role;
- source, generated, vendored, mirrored, or published status;
- governing instructions;
- validation route;
- reason it is in scope; and
- pre-existing dirty state.

The topology is complete when every in-scope documentation surface has an
ownership and edit classification, and every exclusion is stated.

## Build the Claim Ledger

Inventory material claims rather than every sentence. Prioritize claims that a
reader may act on or that can change system behavior:

- commands, flags, prerequisites, paths, and file layouts;
- API shapes, schemas, configuration keys, defaults, and environment variables;
- versions, dependencies, compatibility, and support status;
- workflows, state transitions, retries, ordering, and operational procedures;
- installation, migration, recovery, security, and data-handling guarantees;
- runnable examples, expected outputs, links, and navigation; and
- cross-document statements that purport to share one source of truth.

Assign claim keys (`C1`, `C2`, ...) and record the documentation surface and
location, normalized meaning, claim class, evidence question, suspected
authority, evidence references, evidence class, drift state, confidence, and
proposed action. Preserve the exact qualifiers that affect meaning, including
version, platform, environment, audience, and feature state.

Treat matching words as search leads. Two files can use the same term for
different scopes, while different terms can express the same claim.

The ledger is complete when every material claim implied by the selected
anchor is recorded or explicitly excluded.

## Establish authority before drift

For each claim, identify both:

1. **Authority role:** which artifact is allowed to define the intended claim.
2. **Evidence class:** how strongly the current value is supported.

Use these evidence classes consistently:

- **observed:** demonstrated by current, bounded runtime evidence;
- **verified:** established directly in executable source, configuration,
  schema, generated-source input, or a focused test;
- **declared:** stated by a contract, policy, specification, manifest, ADR, or
  documentation owner;
- **reported:** asserted by a person, issue, release note, or secondary record;
- **inferred:** supported indirectly but not proven; or
- **unknown:** hidden, unavailable, ambiguous, or outside the authority boundary.

Evidence strength does not decide authority. Observed implementation can still
violate a normative specification; a prose policy can intentionally govern
code. Prefer an explicit project-designated source of truth, then reconcile
tests, history, generators, and runtime evidence around it. Preserve a conflict
when the project does not establish which side owns the meaning.

Read `references/drift-and-evidence.md` when authority is disputed, claims span
multiple surfaces, historical intent matters, or a generated or external claim
is involved.

Authority analysis is complete when each claim has one supported authority
owner or is explicitly marked ambiguous.

## Classify the mismatch

Assign exactly one drift state to each claim:

- **aligned:** documentation and authority express the same scoped meaning;
- **documentation-stale:** the documentation no longer expresses the
  authoritative current claim;
- **implementation-drift:** normative documentation remains authoritative and
  implementation or runtime behavior departs from it;
- **generated-stale:** generator input is authoritative and its documentation
  output is outdated;
- **duplicated:** equivalent claims have multiple owners or disagree across
  documentation surfaces;
- **external-unknown:** verification requires unavailable or unauthorized
  external evidence;
- **ambiguous:** intent, scope, or authority cannot be resolved; or
- **out-of-scope:** a real mismatch belongs to another repository, owner, or
  task boundary.

Only `documentation-stale`, `generated-stale`, and confirmed documentation-side
`duplicated` findings are eligible for Update mode. Keep every other state
read-only and route it to its actual owner. Never rewrite normative text merely
to normalize an implementation defect.

Classification is complete when the evidence, authority, confidence, and
allowed action agree for every claim.

## Apply a focused documentation patch

In Update mode:

1. Snapshot the in-scope dirty state and claim keys being fixed.
2. Update the smallest coherent set of documentation surfaces that share the
   claim. Revise dependent wording together so the patch does not create a new
   contradiction.
3. Preserve local voice, structure, terminology, and links unless they are
   themselves part of the drift.
4. Remove obsolete instructions instead of retaining false legacy branches.
   Preserve historical statements when their time boundary remains explicit.
5. Keep unrelated editorial cleanup and broad restructuring outside the patch.
6. Inspect the diff immediately and account for every changed path.

Treat agent-facing instructions and skills as behavioral artifacts. If
`writing-for-agents` is available, use it only for confirmed in-scope edits and
pass this run's documentation-only authority ceiling. Otherwise follow local
format and validation rules without claiming the specialized review occurred.

Treat generated documentation through its ownership path. Run an existing
generator only when its inputs are already correct, its output paths are known
and in scope, and it needs no installation, network access, or shared-state
mutation. Do not hand-edit generated output. If generator inputs are executable
code or configuration that need changes, report implementation drift and stop.

If a command changes unexpected paths, stop and report them. Revert only
run-owned artifacts whose pre-run state and safe recovery method are known;
never discard unrelated user changes.

The patch is complete when every changed line maps to an eligible claim key and
no unauthorized path changed.

## Validate the reconciled claims

Validation must prove content, not merely formatting. Select the authoritative
oracle for each changed claim, then run the narrowest project-native check that
can distinguish correct from stale content. Use static evidence when executing
an example or command would require unsafe mutation.

Read `references/validation-matrix.md` whenever more than one claim class is
changed, a runnable example or command is involved, documentation is generated,
or a documentation build, link checker, schema validator, or skill validator is
available.

Run focused checks before broader documentation builds. Record exact commands,
scope, exit status, and material output. Separate content proof from formatting,
link, and build proof. Distinguish failures caused by the patch from pre-existing
or environment-blocked failures; do not edit unrelated files to force a pass.

Re-read every changed passage against its claim ledger after automated checks.
A passing linter or site build does not establish that a behavioral statement
is current.

Validation is complete when every changed claim has an authoritative proof or
an explicit unresolved limitation.

## Report and stop

Return one Documentation Reconciliation Report with:

1. **Status:** `complete`, `incomplete`, or `blocked`.
2. **Run contract:** mode, scope, anchor, allowed writes, and exclusions.
3. **Documentation topology:** in-scope surfaces and ownership classes.
4. **Drift Ledger:** claim key, location, state, authority, evidence,
   confidence, and action.
5. **Changes:** files and claim keys updated, or `none` in Audit mode.
6. **Validation receipts:** exact checks and results.
7. **Unresolved work:** implementation drift, ambiguous authority, external
   evidence, generated ownership, and uncovered scope.

Use `complete` only when every in-scope claim is aligned or validly patched and
proved. Use `incomplete` when the bounded run produced useful findings but a
material claim remains unknown. Use `blocked` when scope, authority, safe
inspection, or safe writing cannot be established.

Stop after reporting. Recommend the appropriate implementation, research,
publishing, or ownership workflow for non-documentation work without invoking
it or broadening this run.

## Trigger examples

- "Update the docs for the CLI changes on this branch."
- "Check whether this runbook has drifted from the deployed workflow."
- "Audit our README, docs site, and agent skills for stale setup commands."
- "Reconcile the documentation with the new configuration schema."

Route "write a new architecture tutorial" to documentation authoring. Route
"change the service to satisfy this specification" to implementation. Route
"research the latest vendor API" to external research. Route "keep docs synced
on every commit" to development-loop or CI design.
