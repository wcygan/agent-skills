# Locally maintained skill attributions

## Pstack adaptations

The components and procedures below are locally maintained adaptations of Lauren
Tan's pstack, version 0.15.24, at revision
`1e5c90a4b6f249917bd21fe361b3a2a7deb741b8` in
<https://github.com/cursor/plugins>.

Each skill includes the upstream MIT notice, copyright (c) 2026 Lauren Tan, in
`references/LICENSE.txt`. Its frontmatter records the source revision and original
paths. These adaptations have no `.vendored` marker or synchronization lock entry.

Changes: shortened instructions; generic names; removed platform APIs, model
routing, fixed installation paths, mandatory delegation, and automatic publication.
Components are self-contained. New `wcygan-*` procedures compose them conditionally
without duplicating their detailed instructions. Evidence requirements, alternative
designs, honest coverage, ownership, and scope boundaries remain explicit.

These are locally maintained workflows, not a complete or behavior-identical port
of pstack. Sequential execution is supported without claiming independence.
Original explicit-invocation settings are omitted in favor of portable skill
frontmatter and focused descriptions; selection behavior belongs to the host.

| Local skill | Layer | Original source paths within `pstack/` |
| --- | --- | --- |
| [wcygan-mode](../skills/wcygan-mode/SKILL.md) | orchestrator, playbooks, Python tools | `skills/poteto-mode` (entrypoint, all playbooks, references, and scripts) |
| [explain-code](../skills/explain-code/SKILL.md) | component | `skills/how` |
| [design-options](../skills/design-options/SKILL.md) | component | `skills/architect` |
| [compare-solutions](../skills/compare-solutions/SKILL.md) | component | `skills/arena` |
| [review-changes](../skills/review-changes/SKILL.md) | component | `skills/interrogate` |
| [explain-history](../skills/explain-history/SKILL.md) | component | `skills/why` |
| [in-your-own-words](../skills/in-your-own-words/SKILL.md) | component | `skills/in-your-own-words` |
| [no-comments](../skills/no-comments/SKILL.md) | component | `skills/no-comments`, `agents/comment-sicko.md` |
| [clarify-task](../skills/clarify-task/SKILL.md) | component | `skills/sharpen`, `skills/in-your-own-words`, `skills/figure-it-out` |
| [implement-change](../skills/implement-change/SKILL.md) | component | `skills/poteto-mode/playbooks/feature.md`, `skills/poteto-mode/playbooks/refactoring.md` |
| [reproduce-bug](../skills/reproduce-bug/SKILL.md) | component | `skills/tdd` |
| [assess-impact](../skills/assess-impact/SKILL.md) | component | `skills/blast-radius` |
| [verify-behavior](../skills/verify-behavior/SKILL.md) | component | `skills/principle-prove-it-works`, `skills/figure-it-out`, `skills/create-verification-skill` |
| [measure-performance](../skills/measure-performance/SKILL.md) | component | `skills/benchmark-checklist`, `skills/poteto-mode/playbooks/hillclimb.md` |
| [coordinate-work](../skills/coordinate-work/SKILL.md) | component | `skills/swarm`, `skills/poteto-mode/playbooks/orchestrate.md` |
| [decision-log](../skills/decision-log/SKILL.md) | component | `skills/show-me-your-work` |
| [progress-report](../skills/progress-report/SKILL.md) | component | `skills/ketchup`, `skills/bro` |
| [recover-context](../skills/recover-context/SKILL.md) | component | `skills/recall`, `skills/poteto-mode/playbooks/session-pickup.md` |
| [improve-workflow](../skills/improve-workflow/SKILL.md) | component | `skills/reflect` |
| [prevent-recurrence](../skills/prevent-recurrence/SKILL.md) | component | `skills/correct` |
| [personalize-workflow](../skills/personalize-workflow/SKILL.md) | component | `skills/automate-me` |
| [create-verification-skill](../skills/create-verification-skill/SKILL.md) | component | `skills/create-verification-skill` |
| [maintain-verification-skill](../skills/maintain-verification-skill/SKILL.md) | component | `skills/maintain-verification-skill` |
| [deliver-change](../skills/deliver-change/SKILL.md) | component | `skills/poteto-mode/playbooks/opening-a-pr.md`, `skills/poteto-mode/playbooks/shipping.md`, `skills/poteto-mode/playbooks/babysit.md` |
| [write-clearly](../skills/write-clearly/SKILL.md) | component | `skills/unslop`, `skills/technical-writing`, `skills/bro` |
| [wcygan-investigate](../skills/wcygan-investigate/SKILL.md) | procedure | `skills/how`, `skills/why`, `skills/recall` |
| [wcygan-design](../skills/wcygan-design/SKILL.md) | procedure | `skills/architect`, `skills/arena`, `skills/interrogate` |
| [wcygan-implement](../skills/wcygan-implement/SKILL.md) | procedure | `skills/poteto-mode/playbooks/feature.md`, `skills/poteto-mode/playbooks/refactoring.md`, `skills/tdd` |
| [wcygan-verify](../skills/wcygan-verify/SKILL.md) | procedure | `skills/create-verification-skill`, `skills/maintain-verification-skill`, `skills/principle-prove-it-works` |
| [wcygan-review](../skills/wcygan-review/SKILL.md) | procedure | `skills/interrogate`, `skills/blast-radius` |
| [wcygan-experiment](../skills/wcygan-experiment/SKILL.md) | procedure | `skills/benchmark-checklist`, `skills/arena`, `skills/figure-it-out` |
| [wcygan-coordinate](../skills/wcygan-coordinate/SKILL.md) | procedure | `skills/swarm`, `skills/figure-it-out`, `skills/poteto-mode/playbooks/orchestrate.md` |
| [wcygan-record](../skills/wcygan-record/SKILL.md) | procedure | `skills/show-me-your-work`, `skills/recall`, `skills/reflect`, `skills/automate-me`, `skills/ketchup` |
| [wcygan-deliver](../skills/wcygan-deliver/SKILL.md) | procedure | `skills/poteto-mode/playbooks/opening-a-pr.md`, `skills/poteto-mode/playbooks/shipping.md` |

## Scope of this adaptation

The first four local names were replaced, not retained as duplicate skills:
`how` → `explain-code`, `architect` → `design-options`, `arena` →
`compare-solutions`, and `interrogate` → `review-changes`.

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
The dedicated in-your-own-words adaptation retains the upstream restatement task
and adds write-clearly guidance. Local technical visuals are described below. This catalog
covers core engineering work; it does not promise those additional capabilities.

Historical provenance and licenses for the retired catalog remain preserved in
[the dated archive](../archive/2026-10-14/README.md).

## Engineering principles

All 24 standalone `principle-*` skills are locally maintained adaptations of
Lauren Tan's Pstack at `afd51cf66a3100a95f878d6c4b93a01f6508e3b0` in
<https://github.com/cursor/plugins>. Names and source paths are unchanged:
`skills/principle-<name>` maps to `pstack/skills/principle-<name>`.
Each skill records that exact revision, author, and path in its metadata and
includes the upstream MIT notice in `references/LICENSE.txt`.

The [complete mapping](../docs/pstack-principles.md) enumerates every leaf.
Seventeen bodies retain the original text; seven remove unavailable dependencies
or preserve host authorization with targeted edits. Portable frontmatter and an
attribution footer are added to all leaves. The [principle parity matrix](../skills/wcygan-mode/references/parity.md#principle-catalog)
records the exceptions; [the source checker](../tools/check_principle_parity.py)
verifies all text against the immutable source and explicit replacement list.
These skills have no `.vendored` markers or synchronization-lock entries.

Wcygan-mode and its nine procedures load one shared index and name principles
only when they changed a specific choice. These routing additions are local;
the original procedure, playbook, and tool source revisions remain unchanged.

## Orchestrator and Python tools

`wcygan-mode` adapts the source entrypoint and all 23 playbooks. Its four Python
entrypoints and shared modules adapt the upstream orchestration store, PR watcher,
plan checker, worktree audit, and their tests at the same pinned revision.
The upstream MIT notice is included in the skill and applies to these adaptations.

See the [behavior matrix](../skills/wcygan-mode/references/parity.md) for every
script capability, retained interfaces, and deliberate changes. Runtime code is
Python 3.11+ using uv and the standard library. Git and `gh` remain integrations;
Bun, TypeScript, shell implementations, Origin CLI support, and harness-specific
transcript discovery are not required. This remains locally maintained work.


## Original communication components

`technical-visuals`, `slice-changes`, and `prepare-pull-request` are original local
components by William Cygan, licensed MIT. The technical-visuals design system and
example implementation are new; historical topic/style precedent is documented in
its `references/precedent.md`. No retired example code or upstream teaching workflow
was copied. The existing pstack-derived `write-clearly` retains its attribution and
license, with new local examples for concise prose, labels, captions, and evidence.
Local routing additions connect these components to wcygan-mode and its procedures.


## Original ambition workflows

`discover-ambitious-goals`, `prepare-agent-objective`, and `maintain-outcome` are
original local components by William Cygan, licensed MIT. The ambition routing in
wcygan-mode and stretch-target guidance in wcygan-experiment are local extensions;
the existing Pstack adaptations retain their source attribution and MIT notices.

Conceptual inspiration: Felix Rieseberg's
[How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/)
(2026-10-13), discussed with the catalog owner. These workflows are original
instructions for evidence-backed goal discovery, tested operating contracts,
bounded maintenance cycles, and honest stretch-target experiments. No article
text is copied or relicensed as part of the catalog.
