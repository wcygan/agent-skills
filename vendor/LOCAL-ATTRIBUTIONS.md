# Locally maintained skill attributions

## Converted from vendored sources

These skills began as copies of upstream repositories and are now maintained
locally. Each keeps its upstream repository, pinned revision, original path, and
license in its frontmatter, and its license file stays in `references/`.

| Local skill | Upstream repository | Revision | Original path | License |
| --- | --- | --- | --- | --- |
| `mysql` | <https://github.com/planetscale/database-skills> | `f6ed002d03084cb39c01d1d58904d47a36f5322a` | `skills/mysql` | MIT |
| `postgres` | <https://github.com/planetscale/database-skills> | `f6ed002d03084cb39c01d1d58904d47a36f5322a` | `skills/postgres` | MIT |
| `visual-explainer` | <https://github.com/nicobailon/visual-explainer> | `9d5f880b7e8e0a9a80c890b8e1bb6918b68481ad` | `plugins/visual-explainer` | MIT |

The retired `agent-desktop` adaptation came from
[vercel-labs/agent-desktop](https://github.com/vercel-labs/agent-desktop) at
`5261b5287b5208e7c4bf3713df6f66faaaf2c4cc`, original path `skills/agent-desktop`,
under Apache-2.0. Its local source and license remain in
[Git history](https://github.com/wcygan/agent-skills/tree/71b741ce640e0275929fe55f03f059970a82477f/skills/agent-desktop).

`visual-explainer` (version 0.15.0) ships as one skill. Seven of the ten
`commands/` files become reference files (`compare`,
`diff-review`, `fact-check`, `plan-review`, `project-recap`, `state-machine`,
`visual-plan`). The entrypoint routes requests for pages, slides, and videos. The port omits the `.claude-plugin/plugin.json`
manifest and `mcp/` command registration server. The kit, renderer, and templates retain their upstream source. The style
guide points to the local entrypoint for output and validation.

## Pstack adaptations

The skills and methods below are locally maintained adaptations of Lauren
Tan's pstack, version 0.15.24, at revision
`1e5c90a4b6f249917bd21fe361b3a2a7deb741b8` in
<https://github.com/cursor/plugins>.

Public skills record their sources in frontmatter. The moved methods retain
their pinned sources and use their owning skill's `references/LICENSE.txt`,
which includes the upstream MIT notice, copyright (c) 2026 Lauren Tan.

The adaptation uses shorter instructions, generic names, and conditional
routing. It leaves model selection, tools, installation paths, and publication
approval to the host and user. Evidence requirements, alternative designs,
honest coverage, ownership, and scope boundaries remain explicit.

| Local material | Role | Original source paths within `pstack/` |
| --- | --- | --- |
| [wcygan-mode](../skills/wcygan-mode/SKILL.md) | orchestrator, playbooks, Python tools | `skills/poteto-mode` (entrypoint, all playbooks, references, and scripts) |
| [explain-code](../skills/wcygan-mode/references/methods/explain-code.md) | method | `skills/how` |
| [design-options](../skills/wcygan-mode/references/methods/design-options.md) | method | `skills/architect` |
| [compare-solutions](../skills/wcygan-mode/references/methods/compare-solutions.md) | method | `skills/arena` |
| [review-changes](../skills/review-changes/SKILL.md) | component | `skills/interrogate` |
| [explain-history](../skills/wcygan-mode/references/methods/explain-history.md) | method | `skills/why` |
| [no-comments](../skills/wcygan-mode/references/methods/no-comments.md) | method | `skills/no-comments`, `agents/comment-sicko.md` |
| [clarify-task](../skills/wcygan-mode/references/methods/clarify-task.md) | method | `skills/sharpen`, `skills/in-your-own-words`, `skills/figure-it-out` |
| [implement-change](../skills/wcygan-mode/references/methods/implement-change.md) | method | `skills/poteto-mode/playbooks/feature.md`, `skills/poteto-mode/playbooks/refactoring.md`, `skills/tdd` |
| [reproduce-bug](../skills/wcygan-mode/references/methods/reproduce-bug.md) | method | `skills/tdd` |
| [assess-impact](../skills/wcygan-mode/references/methods/assess-impact.md) | method | `skills/blast-radius` |
| [verify-behavior](../skills/verify-behavior/SKILL.md) | procedure | `skills/principle-prove-it-works`, `skills/figure-it-out`, `skills/create-verification-skill`, `skills/maintain-verification-skill` |
| [measure-performance](../skills/wcygan-experiment/references/measurement.md) | measurement reference | `skills/benchmark-checklist`, `skills/poteto-mode/playbooks/hillclimb.md` |
| [coordinate-work](../skills/wcygan-mode/references/methods/coordinate-work.md) | method | `skills/swarm`, `skills/poteto-mode/playbooks/orchestrate.md` |
| [decision-log](../skills/wcygan-mode/references/methods/decision-log.md) | method | `skills/show-me-your-work` |
| [progress-report](../skills/wcygan-mode/references/methods/progress-report.md) | method | `skills/ketchup`, `skills/bro` |
| [recover-context](../skills/wcygan-mode/references/methods/recover-context.md) | method | `skills/recall`, `skills/poteto-mode/playbooks/session-pickup.md` |
| [improve-workflow](../skills/wcygan-mode/references/methods/improve-workflow.md) | method | `skills/reflect` |
| [prevent-recurrence](../skills/wcygan-mode/references/methods/prevent-recurrence.md) | method | `skills/correct` |
| [personalize-workflow](../skills/wcygan-mode/references/methods/personalize-workflow.md) | method | `skills/automate-me` |
| [verification-skill](../skills/verification-skill/SKILL.md) | component | `skills/create-verification-skill`, `skills/maintain-verification-skill` |
| [deliver-change](../skills/wcygan-mode/references/methods/deliver-change.md) | method | `skills/poteto-mode/playbooks/opening-a-pr.md`, `skills/poteto-mode/playbooks/shipping.md`, `skills/poteto-mode/playbooks/babysit.md` |
| [write-clearly](../skills/write-clearly/SKILL.md) | component | `skills/unslop`, `skills/technical-writing`, `skills/bro` |
| [wcygan-experiment](../skills/wcygan-experiment/SKILL.md) | procedure | `skills/benchmark-checklist`, `skills/arena`, `skills/figure-it-out` |

## Scope of this adaptation

The first four local names changed from `how` to `explain-code`, `architect` to
`design-options`, `arena` to `compare-solutions`, and `interrogate` to
`review-changes`.

Other source names become plain descriptions: `why` → `explain-history`,
`correct` → `prevent-recurrence`, `automate-me` → `personalize-workflow`,
`show-me-your-work` → `decision-log`, `ketchup` → `progress-report`,
`recall` → `recover-context`, `reflect` → `improve-workflow`, and
`swarm` → `coordinate-work`. Feature, refactoring, verification, and shipping
playbooks contribute to the components and procedures listed above.

The source's setup/help configuration, bot UI and
Benny automation integration, strict comment-sicko persona, TypeScript reference,
and dedicated teaching workflow are not imported. The local no-comments adaptation
preserves schema and contract documentation and has no named-agent requirement.
The restatement branch of `clarify-task` retains the upstream restatement task.
The retired workflow wrappers combined the same pstack methods listed above.
Their local provenance is retained in [Git history](https://github.com/wcygan/agent-skills/tree/71b741ce640e0275929fe55f03f059970a82477f/skills). Current destinations are
listed in the [migration table](../README.md#replacements-for-retired-skill-names).

Historical provenance and licenses for the retired catalog remain preserved in
[the dated archive](../archive/2026-10-14/README.md).

## Formal verification

[Formal verification](../skills/verification-skill/references/formal.md)
adapts Lauren Tan's pstack `skills/create-formal-verification-skill`, added in
<https://github.com/cursor/plugins/pull/709> and pinned at merge commit
`4382e687a50b8d2c5ce4d141d001186589cff8d5`. It ships in `verification-skill`
with that skill's upstream MIT notice in `references/LICENSE.txt`.

The reference retains the formal workflow. The local routing requires an
explicit request and places generated skills in the project's existing skill
location, or `.agents/skills/` by default.

## Statechart

[statechart](../skills/statechart/SKILL.md) is a locally maintained adaptation of
Lauren Tan's pstack `skills/statechart`, pstack 0.15.46, pinned at revision
`0b46ec399d55f2829e88822998f53b84944837d3`. It includes the upstream MIT notice in
`references/LICENSE.txt`, and its frontmatter records that revision and path.

The local entrypoint summarizes the modeling and handoff instructions and
links to the [view projection](../skills/statechart/references/view.md) and
[TLC reporting](../skills/statechart/references/tlc.md) details adapted from the
upstream entrypoint. The local package documents runtime requirements, invokes
the launcher with `sh` for installed copies, and omits Cursor-specific names and
settings. The model checker and its tests retain the pinned implementation.

## Engineering principles

The 24 [engineering principles](../skills/wcygan-mode/references/principles.md)
are locally maintained adaptations of Lauren Tan's Pstack at
`afd51cf66a3100a95f878d6c4b93a01f6508e3b0` in
<https://github.com/cursor/plugins>. Each `principle-<name>.md` under
`wcygan-mode/references/principles/` maps to `pstack/skills/principle-<name>`.
Each rule links to its exact source and to the shared upstream MIT notice.

The rule bodies are locally revised. Wcygan-mode's routes select relevant rules
and report a principle when it changed a specific choice. The playbooks and
tools retain their own recorded source revision.

## Orchestrator and Python tools

`wcygan-mode` adapts the source entrypoint and playbooks. Its two Python
entrypoints and shared modules adapt the upstream PR watcher, worktree audit, and
their tests at the same pinned revision.
The upstream MIT notice is included in the skill and applies to these adaptations.

See the [behavior matrix](../docs/pstack-parity.md) for every
script capability, retained interfaces, and deliberate changes. Runtime code is
Python 3.11+ using only the standard library. Git and `gh` remain integrations;
Bun, TypeScript, shell implementations, Origin CLI support, and harness-specific
transcript discovery are not required. This remains locally maintained work.


## Original communication components

[Slice changes](../skills/wcygan-mode/references/methods/slice-changes.md) and
[prepare-pull-request](../skills/prepare-pull-request/SKILL.md) are original local
work by William Cygan, licensed MIT. The Pstack-derived `write-clearly` retains
its attribution and license with local examples for prose, labels, and evidence.

William Cygan wrote the [Mermaid diagram reference](../skills/visual-explainer/references/mermaid.md)
under the [MIT license](../skills/visual-explainer/references/LOCAL-LICENSE.txt).
Its rule to build a larger picture as a series that adds one part at a time
restates an idea from Pstack's `teach` skill.

William Cygan wrote the [HTML review report reference and renderer](../skills/review-changes/references/html-report.md)
under the [MIT license](../skills/review-changes/references/LOCAL-LICENSE.txt).
They turn the Act on and Consider findings of a `review-changes` review
into one evidence page.


## Original ambition workflows

[Discover ambitious goals](../skills/wcygan-mode/references/methods/discover-ambitious-goals.md),
[prepare an agent objective](../skills/wcygan-mode/references/methods/prepare-agent-objective.md),
and [maintain an outcome](../skills/wcygan-mode/references/methods/maintain-outcome.md)
are original local work by William Cygan, licensed MIT. The ambition routing in
wcygan-mode and stretch-target guidance in wcygan-experiment are local extensions;
the existing Pstack adaptations retain their source attribution and MIT notices.

Conceptual inspiration: Felix Rieseberg's
[How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/)
(2026-10-13), discussed with the catalog owner. These workflows are original
instructions for evidence-backed goal discovery, tested operating contracts,
bounded maintenance cycles, and honest stretch-target experiments. No article
text is copied or relicensed as part of the catalog.
