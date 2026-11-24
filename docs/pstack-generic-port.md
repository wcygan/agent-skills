# Pstack generic port

The opening counts and decision record describe the initial port. The
adaptation tables link to the current destinations. For current usage, see the
[README](../README.md) and [parity record](pstack-parity.md).

The initial port adapted pstack into short, harness-agnostic engineering skills. It contained **one orchestrator, 30 self-contained components, and
nine `wcygan-*` procedures**, alongside the retained `uv-python`, `just`, and `design-loop`
specialists: 43 skills in total.

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
   [capability matrix](pstack-parity.md); controlled
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
Its Markdown playbooks route to focused methods and public skills. Python tools
support PR observation and worktree auditing; see [tool usage](../skills/wcygan-mode/references/tools.md)
and [script parity](pstack-parity.md).

**Methods** describe what to investigate, decide, produce, or verify, with
explicit completion criteria. Most now live in wcygan-mode's reference tree.

**Procedures** sequence methods for a broader task. They load detailed
instructions when the stated condition applies and preserve scope, prior
authorization, and requested checkpoints across phases.

The investigation playbook combines `explain-code` and `explain-history`.
`design-options` can use `compare-solutions` or `review-changes` when needed.
A one-off check can use `verify-behavior` directly.

## Upstream skill to current method

Some upstream skills are condensed together; others contribute to more than one
component. Rows naming a playbook refer to a file inside `poteto-mode`, rather
than a standalone upstream skill. Local names link to the implemented instructions.

| Pstack source | Current destination | Engineering behavior retained |
| --- | --- | --- |
| in-your-own-words | [clarify-task](../skills/wcygan-mode/references/methods/clarify-task.md) | Plain-language restatement when requested. |
| no-comments | [no-comments](../skills/wcygan-mode/references/methods/no-comments.md) | Remove implementation narration; preserve schema documentation, contracts, required directives, and verified external constraints. |
| how | [explain-code](../skills/wcygan-mode/references/methods/explain-code.md) | Trace behavior, ownership, and runtime flow with code evidence. |
| why | [explain-history](../skills/wcygan-mode/references/methods/explain-history.md) | Separate historical facts, inferred rationale, and unknowns. |
| architect | [design-options](../skills/wcygan-mode/references/methods/design-options.md) | Sketch caller usage and compare at least two structural alternatives. |
| arena | [compare-solutions](../skills/wcygan-mode/references/methods/compare-solutions.md) | Compare candidates against predefined criteria and verify the synthesis. |
| interrogate | [review-changes](../skills/review-changes/SKILL.md) | Challenge the work and classify findings by evidence and impact. |
| sharpen; figure-it-out | [clarify-task](../skills/wcygan-mode/references/methods/clarify-task.md) | Establish the outcome, scope, uncertainties, and stopping conditions. |
| poteto-mode: feature and refactoring playbooks | [implement-change](../skills/wcygan-mode/references/methods/implement-change.md) | Implement coherent units while preserving behavior contracts and ownership. |
| tdd | [reproduce-bug](../skills/wcygan-mode/references/methods/reproduce-bug.md) | Demonstrate failure before a fix and success after it with a practical check. |
| blast-radius | [assess-impact](../skills/wcygan-mode/references/methods/assess-impact.md) | Trace downstream contracts and prove the crucial safety assumptions. |
| principle-prove-it-works; figure-it-out; create-verification-skill | [verify-behavior](../skills/verify-behavior/SKILL.md) | Verify the actual artifact and distinguish verified, failed, and inconclusive criteria. |
| benchmark-checklist; poteto-mode: hillclimb playbook | [measure-performance](../skills/wcygan-experiment/references/measurement.md) | Use comparable conditions, repeated measurements, and evidence that work occurred. |
| swarm; poteto-mode: orchestrate playbook | [coordinate-work](../skills/wcygan-mode/references/methods/coordinate-work.md) | Assign ownership, isolate writes, reconcile results, and verify integration. |
| show-me-your-work | [decision-log](../skills/wcygan-mode/references/methods/decision-log.md) | Keep an append-only decision trail with evidence and explicit audit limitations. |
| ketchup; bro | [progress-report](../skills/wcygan-mode/references/methods/progress-report.md) | Give a concise status update and identify decisions that need the user. |
| recall; poteto-mode: session-pickup playbook | [recover-context](../skills/wcygan-mode/references/methods/recover-context.md) | Reconcile scoped history with live artifacts before resuming work. |
| reflect | [improve-workflow](../skills/wcygan-mode/references/methods/improve-workflow.md) | Propose or apply scoped process improvements grounded in observed failures. |
| correct | [prevent-recurrence](../skills/wcygan-mode/references/methods/prevent-recurrence.md) | Prefer structural prevention and prove guards reject a real past mistake. |
| automate-me | [personalize-workflow](../skills/wcygan-mode/references/methods/personalize-workflow.md) | Capture explicit and repeated preferences without turning one-off requests into rules. |
| statechart | [statechart](../skills/statechart/SKILL.md) | Check reader-agreed rules with TLC; label states and steps in the reader's words; mark breaking states and replay each bug path against real code. |
| create-formal-verification-skill | [create-formal-verification-skill](../skills/verification-skill/references/formal.md) | Choose the highest-value target and a fitting verification tool; show each property fail on a broken variant; generate and exercise a rerunnable project skill. |
| create-verification-skill | [verification-skill](../skills/verification-skill/SKILL.md) | Create project-specific launch, drive, evidence, cleanup, and feature-map instructions; exercise a full journey. |
| maintain-verification-skill | [verification-skill](../skills/verification-skill/SKILL.md) | Check every mapped feature against source and live behavior; separate drift from product regressions. |
| poteto-mode: opening-a-pr, shipping, and babysit playbooks | [deliver-change](../skills/wcygan-mode/references/methods/deliver-change.md) | Confirm current proof, authorized destination, dependency order, and resulting publication state. |
| unslop; technical-writing; bro | [write-clearly](../skills/write-clearly/SKILL.md) | Use concrete prose while preserving technical meaning, qualifications, and evidence. |

The first four local drafts used the upstream names `how`, `architect`, `arena`,
and `interrogate`. Their replacements are `explain-code`, `design-options`,
`compare-solutions`, and `review-changes`; the old names are not alias skills.

## Local compositions

The early port composed methods in `wcygan-*` procedure skills. Wcygan-mode's
playbooks now route to most of those methods. [Review changes](../skills/review-changes/SKILL.md)
and [wcygan-experiment](../skills/wcygan-experiment/SKILL.md) remain public
entrypoints for targeted review and experimentation.

## Upstream capabilities without a direct replacement

| Pstack source | Treatment in the generic port |
| --- | --- |
| `poteto-mode` | [wcygan-mode](../skills/wcygan-mode/SKILL.md) is the generic orchestrator. See the [parity record](pstack-parity.md) for playbook routes and the two current Python tools. |
| `poteto-help` | The [catalog README](../README.md) and this mapping provide navigation; there is no help skill. |
| `setup-pstack` | Omitted. Tool availability, model selection, and host configuration remain outside the skill instructions. |
| `comment-sicko` agent | No named agent or harness API is required. The `no-comments` method adapts the workflow with schema and contract exceptions. |
| `typescript-best-practices` | Omitted as a language-specific reference; no equivalent TypeScript skill was added. |
| `teach` | No dedicated teaching workflow was added. Investigation and clear-writing components cover parts of explanation, without promising the upstream visual teaching flow. |
| `make-bot-ui` and the separate Benny automation pack | Omitted. No webhook, bot, messaging, secrets, or hosted automation integration is included. |
| 24 `principle-*` skills | Originally omitted, then imported as standalone skills. The original names now identify reference files under wcygan-mode. See the [principle mapping](pstack-principles.md). |
| Poteto Mode playbooks | The original 23 received generic Markdown routes. Six received plainer filenames; see the [playbook mapping](pstack-parity.md#playbook-mapping). Runtime capabilities remain conditional. |
| Agent definitions | Omitted. No fixed model roster, custom agent registration, or scheduler is installed. |
| Runtime helper scripts | The port originally reimplemented four helpers in Python. PR watching and worktree auditing remain. The orchestration store and plan checker were retired. |

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

Each public skill can be installed individually with its references and scripts.
Install the full catalog to make all sibling skills available to playbooks.
See the [installation instructions](../README.md#install).

Public adaptations and their reference material retain the original source paths,
pinned revisions, and upstream MIT notice. The exact provenance mapping is in
[LOCAL-ATTRIBUTIONS.md](../vendor/LOCAL-ATTRIBUTIONS.md).

The prior catalog remains preserved in the [dated archive](../archive/2026-10-14/README.md).
The generic port does not restore archived skills into the active catalog.

## Initial verification, 2026-10-14

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
