# agent-skills

An Agent Skills catalog for engineering work. The catalog exposes 15 skills.
Run `just skills` to inspect the published entrypoints.

| Request | Start here |
| --- | --- |
| Own a feature, bug fix, investigation, design, or handoff end to end | [wcygan-mode](skills/wcygan-mode/SKILL.md) |
| Verify changed behavior against observable acceptance criteria | [verify-behavior](skills/verify-behavior/SKILL.md) |
| Review a change or render the review as an HTML evidence page | [review-changes](skills/review-changes/SKILL.md) |
| Prepare a PR title, description, and evidence | [prepare-pull-request](skills/prepare-pull-request/SKILL.md) |
| Compare alternatives or measure performance | [wcygan-experiment](skills/wcygan-experiment/SKILL.md) |
| Create or maintain reusable project verification instructions | [verification-skill](skills/verification-skill/SKILL.md) |
| Model-check state transitions and draw a statechart | [statechart](skills/statechart/SKILL.md) |
| Clarify technical prose, labels, and summaries | [write-clearly](skills/write-clearly/SKILL.md) |
| Design or restyle a web interface and verify it in use | [design-loop](skills/design-loop/SKILL.md) |
| Explain a system visually or draw a focused Mermaid diagram | [visual-explainer](skills/visual-explainer/SKILL.md) |
| Add or troubleshoot just recipes and project commands | [just](skills/just/SKILL.md) |
| Design or troubleshoot MySQL queries, schema, or operations | [mysql](skills/mysql/SKILL.md) |
| Design or troubleshoot PostgreSQL queries, schema, or operations | [postgres](skills/postgres/SKILL.md) |
| Organize project work in Rex sessions and panes | [rex-workflow](skills/rex-workflow/SKILL.md) |
| Manage Python projects, dependencies, and tools with uv | [uv-python](skills/uv-python/SKILL.md) |

Wcygan-mode selects a playbook and opens relevant methods and engineering
principles. To steer the work, ask for a rule by name, for example “Use
wcygan-mode and apply Boundary Discipline.” A former token such as
`$principle-boundary-discipline` also identifies the rule. See the [principle
index](skills/wcygan-mode/references/principles.md), [source mapping](docs/pstack-principles.md),
and [upstream attribution](vendor/LOCAL-ATTRIBUTIONS.md).

## Replacements for retired skill names

Update project instructions and automations that invoke a retired name. The
catalog no longer exposes the names below as standalone skills.

| Former invocation | Current entrypoint and request |
| --- | --- |
| `principle-*` | Ask [wcygan-mode](skills/wcygan-mode/SKILL.md) to apply the [named principle](skills/wcygan-mode/references/principles.md). |
| `clarify-task`, `design-options`, `compare-solutions`, `assess-impact`, `explain-code`, `explain-history` | Ask [wcygan-mode](skills/wcygan-mode/SKILL.md) to scope, design, compare, or investigate the work. |
| `implement-change`, `reproduce-bug`, `no-comments`, `coordinate-work`, `slice-changes`, `deliver-change` | Ask wcygan-mode for the task or name the [method](skills/wcygan-mode/references/methods/). |
| `discover-ambitious-goals`, `prepare-agent-objective`, `maintain-outcome` | Ask wcygan-mode to discover, prepare, or sustain a goal. |
| `decision-log`, `improve-workflow`, `personalize-workflow`, `prevent-recurrence`, `progress-report`, `recover-context` | Ask wcygan-mode to record progress, recover prior work, or improve a workflow. |
| `in-your-own-words` | Ask wcygan-mode to restate the request only using [clarify-task](skills/wcygan-mode/references/methods/clarify-task.md). |
| `wcygan-coordinate`, `wcygan-deliver`, `wcygan-design`, `wcygan-investigate`, `wcygan-record` | Ask [wcygan-mode](skills/wcygan-mode/SKILL.md) to coordinate, deliver, design, investigate, or record the work, respectively. |
| `wcygan-review` | Ask [review-changes](skills/review-changes/SKILL.md) to review the change. |
| `review-report` | Ask [review-changes](skills/review-changes/SKILL.md) for an [HTML review report](skills/review-changes/references/html-report.md). |
| `draw-diagram` | Ask [visual-explainer](skills/visual-explainer/SKILL.md) for a [focused Mermaid diagram](skills/visual-explainer/references/mermaid.md). |
| `measure-performance` | Ask [wcygan-experiment](skills/wcygan-experiment/SKILL.md) to [measure performance](skills/wcygan-experiment/references/measurement.md). |
| `create-verification-skill`, `maintain-verification-skill` | Ask [verification-skill](skills/verification-skill/SKILL.md) to create or maintain project verification instructions. |
| `create-formal-verification-skill` | Ask [verification-skill](skills/verification-skill/SKILL.md) to create a [formal verification skill](skills/verification-skill/references/formal.md). |
| `agent-desktop`, `lean-verify`, `model-state-transitions`, `typescript-app-stack` | These specialist packages were retired. Their source remains in [catalog history](https://github.com/wcygan/agent-skills/tree/71b741ce640e0275929fe55f03f059970a82477f/skills). |

## Install

Use a GitHub CLI build with `gh skill` support. Install to the shared user
directory explicitly:

```sh
gh skill install wcygan/agent-skills --agent codex --scope user --all --dir ~/.agents/skills
```

Install the full catalog for workflow composition. Individual installs include
that skill's reference files and scripts. When a workflow links to another
public skill, install that skill alongside it.

Add `--pin <full-commit>` for a fixed version. Other supported agents are listed
by `gh skill install --help`. For project scope, select `--scope project`.
Test discovery and installation from a local checkout in an isolated directory:

```sh
gh skill install . --from-local --all --dir /tmp/skill-check
```

## Dated archive and reset

[archive/2026-10-14](archive/2026-10-14/README.md) preserves the full prior
repository at its exact source commit: 116 skills, references, scripts, assets,
source locks, licenses, attribution and maintenance files. Its manifest contains
the bundle SHA-256 and the original catalog snapshot. The active catalog retired
113 skills and retained `uv-python`, `just`, and `design-loop`. The generic pstack
adaptations were added after that reset.

The archive stores pre-reset entrypoints inside `catalog.tar.gz`. Keeping
them compressed prevents GitHub CLI from discovering them as another catalog.
Restore a skill deliberately from the bundle, validate it and refresh the snapshot.

## Update a fork

Read [docs/catalog-inheritance.md](docs/catalog-inheritance.md). Adopted forks
track parent ownership and an exact source commit:

```sh
just parent-upgrade-preview
just parent-upgrade
just check
```

Upgrades remove inherited skills retired by the parent, retain child-owned
additions and blocked names, and copy the dated archive. Modified inherited
files require explicit reconciliation. Plain Git forks can merge upstream;
[BOOTSTRAP.md](BOOTSTRAP.md) describes adoption for templates and other arrival
routes. A repository update does not by itself remove globally installed copies.

## Install on this machine

One command commits and pushes this catalog, pins the new commit in dotfiles,
and installs it into `~/.agents/skills` with links in `~/.claude/skills`:

```sh
just install                    # commit, install, pin, start both pushes
just install --wait             # return after both pushes finish
just install -m "feat: ..."     # the same, with your commit message
just install --full             # also rewrite skills whose content did not change
just install --timings          # compare the step timings of recent runs
```

Run it on the default branch of both repositories. It stages and commits every
change in this checkout, so review `git status` first. Each step does only what
is not already true, so a rerun after a failure continues where it stopped. A
skill removed from the catalog is moved out of the global directories into
`~/.local/state/dotfiles/agent-skills-archives/`; entries from other sources are
never touched. The [really-fast-reinstall](.agents/skills/really-fast-reinstall/SKILL.md)
skill describes the contract and the timing record.

## Author and validate

Skills remain immediate children of `skills/`, following the
[Agent Skills specification](https://agentskills.io/specification). The layout
also supports Agent Plugins packaging. Source ownership for future vendors is
recorded in `vendor/skills-lock.json`; adapted upstream work must preserve its
provenance and license. The vendor lock is currently empty.

```sh
just validate-skills
just catalog-snapshot
just check-full
```

`just check` runs maintenance tests, validates public skill frontmatter with the
Agent Skills reference validator, and verifies the snapshot. `check-full` also
checks GitHub CLI publication. The design reference app retains
its focused CI workflow and `just design-reference-check` command.
