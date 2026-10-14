# Pstack generic port

Updated: 2026-10-14.

This catalog adapts pstack into short, harness-agnostic engineering skills. The
implemented port contains **one orchestrator, 27 self-contained components, and
nine `wcygan-*` procedures**, alongside the retained `uv-python`, `just`, and `design-loop`
specialists: 40 skills in total.

The source is Lauren Tan's MIT-licensed pstack 0.15.24 at
[`1e5c90a4b6f249917bd21fe361b3a2a7deb741b8`](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack).
That version contains 54 catalog skills, including 24 principles, plus 23
playbooks inside Poteto Mode. The mapping below describes our current adaptation;
it does not imply that every upstream capability was imported.

## Decision record — 2026-10-14

Status: implemented and locally validated. Publication, dotfiles pin updates,
and global installation are separate delivery steps. This document records the
choices made during the migration, including their costs and remaining limits.

### How we arrived here

1. The migration began with a comparison of the existing catalog, including Matt
   Pocock skills, against pstack. The user chose pstack as the foundation for the
   next catalog. That preference was a direction for this work, not a measured
   claim that one author's workflows outperform another's.
2. We separated vendored skills, locally authored skills, and local compositions
   with dependencies. The user chose a broad reset: preserve the old catalog in
   a dated `tar.gz` archive and retain `uv-python`, `just`, and `design-loop` as
   the active specialists. Archived content is historical evidence, not an
   installation source. Inheritance removes retired inherited content while
   preserving a fork's own additions; see [catalog inheritance](catalog-inheritance.md).
3. The initial idea was a PStack Codex port. The user then chose short,
   harness-agnostic instructions, so the document and design became a generic
   port. We replaced upstream nicknames with descriptive capabilities and
   separated individual methods from procedural compositions.
4. The catalog grew into 22 components and nine procedures. Verification-skill
   creation and maintenance remained distinct capabilities because creating a
   project verification contract and keeping it accurate are different jobs.
5. We added `wcygan-mode` above those layers to preserve Poteto Mode's task
   routing and sustained execution. The approved scope included all 23 playbooks
   and every operational script capability, with explicit adaptations rather
   than literal platform compatibility.
6. We fixed the upstream revision before implementing the orchestrator and tools.
   The source implementation and tests informed the
   [capability matrix](../skills/wcygan-mode/references/parity.md); controlled
   behavioral tests and installation checks then checked the local implementation.

### Architecture and instruction decisions

| Decision | Reason | Consequence |
| --- | --- | --- |
| Keep components, procedures, and one orchestrator separate. | Focused methods should remain useful outside a full task lifecycle. | Components are self-contained; procedures depend on linked components; the orchestrator selects playbooks and manages transitions. |
| Use plain capability names instead of upstream nicknames or aliases. | Names should explain when to invoke a skill without requiring familiarity with pstack. | Existing source names remain in the mapping and attribution, not as duplicate installed skills. |
| Keep entrypoints short and load supporting resources conditionally. | Most tasks need only a subset of the catalog. | Playbooks describe sequencing and gates; procedures and components retain detailed methods. |
| Adapt all 23 playbooks. | Diagnosis, planning, execution, monitoring, and delivery have meaningfully different stopping conditions. | Coverage is preserved without forcing every task through every phase. |
| Remove model routing and harness APIs from instructions. | A workflow should describe the work and evidence it needs, independently of its executor. | Tools, delegation, scheduling, live application controls, and simulators must be available explicitly; missing capabilities are reported. |
| Preserve authorization across phases. | A transition from design to implementation should not discard permission already granted. | The requested destination and explicit checkpoints control progression; a generic workflow does not grant new publication authority. |
| Make review independence an evidence claim. | Another pass by the same executor is useful but does not supply an independent perspective. | Sequential review is supported and labeled honestly; independent review requires an actual independent reviewer. |
| Replace fixed verification counts with task-specific acceptance evidence. | Repeating a check a fixed number of times does not by itself establish correctness. | Verification covers the actual artifact and relevant failure modes; performance measurement is required when the task warrants it. |

Generic instructions still retain concrete engineering obligations: establish
behavior before changing it, compare plausible designs, isolate concurrent writes,
inspect artifacts, and distinguish verified results from assumptions. Generalizing
the executor must not weaken those obligations.

### Tool and state decisions

| Decision | Reason and operational effect |
| --- | --- |
| Python 3.11+, uv, and standard-library runtime code. | The user requested Python replacements for TypeScript and shell implementations. A dependency-free uv project and generated lockfile provide one runtime convention on macOS and Linux. |
| Keep Git and authenticated `gh` integrations. | Repository and PR observation need real external data. Harness independence does not imply forge independence: these helpers currently integrate with GitHub. Optional Origin CLI support was removed. |
| Keep runtime files outside the installed skill. | Installed skills are distributable source artifacts. The documented invocation uses an external uv environment and disables bytecode; task stores and outputs live elsewhere. |
| Preserve functional capabilities with documented interface changes. | A literal port would retain platform assumptions and brittle presentation rules. The parity matrix identifies preserved, generalized, and removed behavior; it does not promise identical JSON schemas or store formats. |
| Use plain records, atomic replacement, and a persistent OS lock. | Durable state must survive interruption without permitting concurrent writers based on uncertain ownership. Stores are single-host; `--force` cannot steal a live or uncertain lock. |
| Preserve recovery copies when draining completion notices. | A crash must not silently discard pending results. Delivery can occur twice after interruption, so consumers reconcile artifact identity before replaying a notice. |
| Make bot names and review gates optional configuration. | Ordinary PR monitoring must not depend on one named automation service. Missing or unknown API evidence cannot establish readiness. |
| Replace transcript discovery with supplied activity evidence. | A portable worktree audit cannot infer ownership from a particular application's private directories. Unknown ownership stays unknown; age, untracked files, or a closed PR do not establish disposability. |
| Keep watcher and audit tools observational. | Reporting readiness or cleanup candidates is distinct from authorizing or performing changes. These helpers do not merge, delete worktrees, spawn agents, or create schedules. |
| Validate a Markdown plan contract instead of exact prose. | Executable plans need identifiable units, dependencies, write scopes, acceptance criteria, verification, and evidence. The checker rejects broken references and cycles; semantic adequacy still requires review. |

The distinctions that must survive future revisions are **diagnosis versus fixing**,
**planning versus execution**, **merge-ready versus merged**, and **sequential
review versus independent review**. A status report or successful structure check
must not silently promote one state into the other.

### Maintenance and future decisions

These adaptations are locally maintained at a recorded upstream revision. They
are not automatically synchronized vendored copies. Preserve the MIT notices,
source paths, and attribution when changing them. Future upstream upgrades should
compare behavior against the pinned source and update the parity matrix explicitly.

Revisit these decisions when real tasks expose a concrete gap: an absent runtime
capability, a playbook that duplicates another layer, an unsupported forge, or a
verification contract that misses a failure. Record the observed failure, proposed
change, and evidence for the replacement. Cross-harness task trials and live
GitHub integration trials remain follow-up work; local tests alone do not establish
equivalent agent behavior in different environments.

## Three layers

**[wcygan-mode](../skills/wcygan-mode/SKILL.md)** selects and sequences the relevant
playbook, preserves scope across phases, and judges completion against evidence.
Its 23 Markdown playbooks reuse the procedures below. Python tools support durable
state and observation; see [tool usage](../skills/wcygan-mode/references/tools.md)
and [script parity](../skills/wcygan-mode/references/parity.md).

**Components** perform one focused job and can be used independently. They describe
what to investigate, decide, produce, or verify, with explicit completion criteria.
They do not require sibling skills, named agent roles, or particular tools.

**Procedures** sequence components for a broader task. They link to the component
instructions and load them only when the stated condition applies. They preserve
scope, prior authorization, and requested checkpoints across phases.

For example, `wcygan-investigate` can combine `explain-code` and `explain-history`;
`wcygan-design` uses `design-options` and can add `compare-solutions` or
`review-changes` when needed. A one-off verification can use `verify-behavior`
without first creating a reusable verification skill.

## Upstream skill to local component

Some upstream skills are condensed together; others contribute to more than one
component. Rows naming a playbook refer to a file inside `poteto-mode`, rather
than a standalone upstream skill. Local names link to the implemented instructions.

| Pstack source | Local component | Engineering behavior retained |
| --- | --- | --- |
| in-your-own-words | [in-your-own-words](../skills/in-your-own-words/SKILL.md) | Dedicated plain-language restatement of the user’s goal and problem, using write-clearly. |
| no-comments | [no-comments](../skills/no-comments/SKILL.md) | Remove implementation narration; preserve schema documentation, contracts, required directives, and verified external constraints. |
| how | [explain-code](../skills/explain-code/SKILL.md) | Trace behavior, ownership, and runtime flow with code evidence. |
| why | [explain-history](../skills/explain-history/SKILL.md) | Separate historical facts, inferred rationale, and unknowns. |
| architect | [design-options](../skills/design-options/SKILL.md) | Sketch caller usage and compare at least two structural alternatives. |
| arena | [compare-solutions](../skills/compare-solutions/SKILL.md) | Compare candidates against predefined criteria and verify the synthesis. |
| interrogate | [review-changes](../skills/review-changes/SKILL.md) | Challenge the work and classify findings by evidence and impact. |
| sharpen; figure-it-out | [clarify-task](../skills/clarify-task/SKILL.md) | Establish the outcome, scope, uncertainties, and stopping conditions. |
| poteto-mode: feature and refactoring playbooks | [implement-change](../skills/implement-change/SKILL.md) | Implement coherent units while preserving behavior contracts and ownership. |
| tdd | [reproduce-bug](../skills/reproduce-bug/SKILL.md) | Demonstrate failure before a fix and success after it with a practical check. |
| blast-radius | [assess-impact](../skills/assess-impact/SKILL.md) | Trace downstream contracts and prove the crucial safety assumptions. |
| principle-prove-it-works; figure-it-out; create-verification-skill | [verify-behavior](../skills/verify-behavior/SKILL.md) | Verify the actual artifact and distinguish verified, failed, and inconclusive criteria. |
| benchmark-checklist; poteto-mode: hillclimb playbook | [measure-performance](../skills/measure-performance/SKILL.md) | Use comparable conditions, repeated measurements, and evidence that work occurred. |
| swarm; poteto-mode: orchestrate playbook | [coordinate-work](../skills/coordinate-work/SKILL.md) | Assign ownership, isolate writes, reconcile results, and verify integration. |
| show-me-your-work | [decision-log](../skills/decision-log/SKILL.md) | Keep an append-only decision trail with evidence and explicit audit limitations. |
| ketchup; bro | [progress-report](../skills/progress-report/SKILL.md) | Give a concise status update and identify decisions that need the user. |
| recall; poteto-mode: session-pickup playbook | [recover-context](../skills/recover-context/SKILL.md) | Reconcile scoped history with live artifacts before resuming work. |
| reflect | [improve-workflow](../skills/improve-workflow/SKILL.md) | Propose or apply scoped process improvements grounded in observed failures. |
| correct | [prevent-recurrence](../skills/prevent-recurrence/SKILL.md) | Prefer structural prevention and prove guards reject a real past mistake. |
| automate-me | [personalize-workflow](../skills/personalize-workflow/SKILL.md) | Capture explicit and repeated preferences without turning one-off requests into rules. |
| create-verification-skill | [create-verification-skill](../skills/create-verification-skill/SKILL.md) | Create project-specific launch, drive, evidence, cleanup, and feature-map instructions; exercise a full journey. |
| maintain-verification-skill | [maintain-verification-skill](../skills/maintain-verification-skill/SKILL.md) | Check every mapped feature against source and live behavior; separate drift from product regressions. |
| poteto-mode: opening-a-pr, shipping, and babysit playbooks | [deliver-change](../skills/deliver-change/SKILL.md) | Confirm current proof, authorized destination, dependency order, and resulting publication state. |
| unslop; technical-writing; bro | [write-clearly](../skills/write-clearly/SKILL.md) | Use concrete prose while preserving technical meaning, qualifications, and evidence. |

The first four local drafts used the upstream names `how`, `architect`, `arena`,
and `interrogate`. Their replacements are `explain-code`, `design-options`,
`compare-solutions`, and `review-changes`; the old names are not alias skills.

## Procedural skills and their components

These nine procedures are local compositions. They organize the adapted methods
by the user's task. `wcygan-mode` now composes them without installing a persistent
global mode.
The listed components are available branches, not steps that always run.

| Procedure | Owns | Components referenced |
| --- | --- | --- |
| [wcygan-investigate](../skills/wcygan-investigate/SKILL.md) | Behavior, history, and constraints | [clarify-task](../skills/clarify-task/SKILL.md), [recover-context](../skills/recover-context/SKILL.md), [explain-code](../skills/explain-code/SKILL.md), [explain-history](../skills/explain-history/SKILL.md), [assess-impact](../skills/assess-impact/SKILL.md) |
| [wcygan-design](../skills/wcygan-design/SKILL.md) | Alternatives, structure, and interfaces | [explain-code](../skills/explain-code/SKILL.md), [explain-history](../skills/explain-history/SKILL.md), [design-options](../skills/design-options/SKILL.md), [compare-solutions](../skills/compare-solutions/SKILL.md), [review-changes](../skills/review-changes/SKILL.md) |
| [wcygan-implement](../skills/wcygan-implement/SKILL.md) | Small changes and integrated verification | [explain-code](../skills/explain-code/SKILL.md), [design-options](../skills/design-options/SKILL.md), [reproduce-bug](../skills/reproduce-bug/SKILL.md), [implement-change](../skills/implement-change/SKILL.md), [coordinate-work](../skills/coordinate-work/SKILL.md), [verify-behavior](../skills/verify-behavior/SKILL.md), [prevent-recurrence](../skills/prevent-recurrence/SKILL.md) |
| [wcygan-verify](../skills/wcygan-verify/SKILL.md) | Acceptance evidence and reusable verification guidance | [create-verification-skill](../skills/create-verification-skill/SKILL.md), [maintain-verification-skill](../skills/maintain-verification-skill/SKILL.md), [verify-behavior](../skills/verify-behavior/SKILL.md) |
| [wcygan-review](../skills/wcygan-review/SKILL.md) | Correctness, impact, and tradeoffs | [explain-code](../skills/explain-code/SKILL.md), [review-changes](../skills/review-changes/SKILL.md), [assess-impact](../skills/assess-impact/SKILL.md), [verify-behavior](../skills/verify-behavior/SKILL.md) |
| [wcygan-experiment](../skills/wcygan-experiment/SKILL.md) | Fair comparisons and bounded experiments | [clarify-task](../skills/clarify-task/SKILL.md), [compare-solutions](../skills/compare-solutions/SKILL.md), [measure-performance](../skills/measure-performance/SKILL.md), [decision-log](../skills/decision-log/SKILL.md) |
| [wcygan-coordinate](../skills/wcygan-coordinate/SKILL.md) | Ownership, dependencies, and integration | [clarify-task](../skills/clarify-task/SKILL.md), [coordinate-work](../skills/coordinate-work/SKILL.md), [decision-log](../skills/decision-log/SKILL.md), [recover-context](../skills/recover-context/SKILL.md), [verify-behavior](../skills/verify-behavior/SKILL.md), [progress-report](../skills/progress-report/SKILL.md) |
| [wcygan-record](../skills/wcygan-record/SKILL.md) | Decisions, evidence, preferences, and handoffs | [decision-log](../skills/decision-log/SKILL.md), [recover-context](../skills/recover-context/SKILL.md), [progress-report](../skills/progress-report/SKILL.md), [improve-workflow](../skills/improve-workflow/SKILL.md), [prevent-recurrence](../skills/prevent-recurrence/SKILL.md), [personalize-workflow](../skills/personalize-workflow/SKILL.md), [write-clearly](../skills/write-clearly/SKILL.md) |
| [wcygan-deliver](../skills/wcygan-deliver/SKILL.md) | Verified handoff or authorized publication | [verify-behavior](../skills/verify-behavior/SKILL.md), [review-changes](../skills/review-changes/SKILL.md), [deliver-change](../skills/deliver-change/SKILL.md), [write-clearly](../skills/write-clearly/SKILL.md), [progress-report](../skills/progress-report/SKILL.md) |

## Upstream capabilities without a direct replacement

| Pstack source | Treatment in the generic port |
| --- | --- |
| `poteto-mode` | [wcygan-mode](../skills/wcygan-mode/SKILL.md) is the generic orchestrator, with all 23 adapted playbooks and four Python tool entrypoints. |
| `poteto-help` | The [catalog README](../README.md) and this mapping provide navigation; there is no help skill. |
| `setup-pstack` | Omitted. Tool availability, model selection, and host configuration remain outside the skill instructions. |
| `comment-sicko` agent | No named agent or harness API is required. The dedicated `no-comments` skill adapts the workflow with schema and contract exceptions. |
| `typescript-best-practices` | Omitted as a language-specific reference; no equivalent TypeScript skill was added. |
| `teach` | No dedicated teaching workflow was added. Investigation and clear-writing components cover parts of explanation, without promising the upstream visual teaching flow. |
| `make-bot-ui` and the separate Benny automation pack | Omitted. No webhook, bot, messaging, secrets, or hosted automation integration is included. |
| 24 `principle-*` skills | No standalone principle catalog was imported. Relevant criteria appear within workflows; `principle-prove-it-works` is explicitly a source for `verify-behavior` and `wcygan-verify`. |
| Poteto Mode playbooks | All 23 now have generic Markdown counterparts. Six have plainer filenames; see the [playbook mapping](../skills/wcygan-mode/references/parity.md#playbook-mapping). Runtime capabilities remain conditional. |
| Agent definitions | Omitted. No fixed model roster, custom agent registration, or scheduler is installed. |
| Runtime helper scripts | Reimplemented in Python with uv: orchestration records, PR/stack watching, generic plan validation, and observational worktree auditing. |

## What changed during adaptation

The playbooks remove platform tool calls, model names, transcript locations, fixed
installation paths, and automatic publication. The executing environment supplies
its own tools. Project verification skills derive concrete commands from the
actual project rather than assuming a framework or operating system.

Independent execution is optional. Sequential exploration is supported, and a
separate pass must not be presented as independent review. Concurrent work still
requires isolated writers, explicit ownership, and inspection of returned artifacts.

The engineering requirements remain concrete: compare structural alternatives,
pin behavior before refactoring, prove a bug's failure and correction, measure
performance fairly, verify real user outcomes, retain evidence after cleanup, and
report missing coverage honestly. Available history is scoped to the task;
summaries cannot substitute for detailed execution records in a full audit.

The upstream explicit-invocation settings are omitted in favor of portable
frontmatter and focused descriptions. Hosts determine skill selection. The port
also replaces automatic PR creation and landing with delivery to the destination
the user authorized, while preserving authorization already granted.

## Installation and maintenance

Components can be installed individually. Procedures refer to sibling components
through relative links, so install their referenced components alongside them;
installing the full catalog supplies every procedure dependency. See the
[installation instructions](../README.md#install).

Every adaptation records its original source paths and pinned revision in metadata
and includes the upstream MIT license notice. These are locally maintained skills,
not entries in the upstream synchronization lock. The exact provenance mapping is
in [LOCAL-ATTRIBUTIONS.md](../vendor/LOCAL-ATTRIBUTIONS.md).

The prior catalog remains preserved in the [dated archive](../archive/2026-10-14/README.md).
The generic port does not restore archived skills into the active catalog.

## Verification status

The 31 component and procedure adaptations passed Agent Skills validation; the
new orchestrator passed its own validation, bringing the adaptation count to 32.
Local verification on 2026-10-14 also established:

- `just check-full` passed 69 repository tests, catalog verification, and the
  GitHub skill publication dry run. The dry run reported warnings about the
  repository's `.agents/skills/` directory and absent tag protection rules.
- All 31 Python tool tests passed on macOS and Linux. They cover store lifecycle
  and locking, corrupt state, revision-specific verdicts, inbox recovery, gates,
  frontier resolution, watcher policy and retries, plan validation, and temporary
  Git worktrees. GitHub responses and watcher time are controlled fixtures.
- Relative links and all 23 playbooks were checked.
- An isolated installation discovered all 35 catalog skills. All four Python
  entrypoints were exercised, and the installed catalog was unchanged afterward.

The tools are included in the existing repository test gate through
[`tests/test_mode_tools.py`](../tests/test_mode_tools.py). The distributable
catalog snapshot was refreshed after implementation.

These checks establish format, packaging, and repository consistency. Real-task
behavioral trials remain outstanding; the port does not claim equivalent runtime
behavior across harnesses. The work has not been published or globally installed
as part of this port.
