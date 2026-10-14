# agent-skills

A public Agent Skills catalog with one orchestrator, 30 focused components, nine
procedural skills, and three specialist skills. Components work independently. Procedures load only
the components needed for the task, using relative links within the catalog.

## Orchestrator

[wcygan-mode](skills/wcygan-mode/SKILL.md) selects and sequences workflows for an
end-to-end task. It includes 25 generic Markdown playbooks and Python tools for
orchestration state, PR observation, plan validation, and worktree audits.
Read its [tool usage](skills/wcygan-mode/references/tools.md) for uv commands and
external environment placement, and its
[parity matrix](skills/wcygan-mode/references/parity.md) for upstream behavior and
intentional changes. GitHub observation uses Git and authenticated `gh`; the
playbooks assume no particular agent harness or model.

Wcygan-mode considers ambition on every substantive task: a more valuable outcome,
a limiting assumption worth challenging, or a stronger method. Use
`discover-ambitious-goals` to choose opportunities, `prepare-agent-objective` to
prove readiness, and `maintain-outcome` to sustain an objective. Stretch experiments
separate required outcomes from exploration targets. Scope, truthful verification,
and resource budgets remain explicit; ongoing operation requires a real trigger.

## Procedures

Choose a procedure for an end-to-end task. Each preserves scope and prior
authorization across phases; it does not require a particular harness, model,
or delegation API.

| Procedure | Owns |
| --- | --- |
| [wcygan-investigate](skills/wcygan-investigate/SKILL.md) | Understand behavior and history. |
| [wcygan-design](skills/wcygan-design/SKILL.md) | Compare structures and define interfaces. |
| [wcygan-implement](skills/wcygan-implement/SKILL.md) | Make small changes with clear ownership. |
| [wcygan-verify](skills/wcygan-verify/SKILL.md) | Check real results against requirements. |
| [wcygan-review](skills/wcygan-review/SKILL.md) | Challenge correctness and tradeoffs with independent scrutiny where available. |
| [wcygan-experiment](skills/wcygan-experiment/SKILL.md) | Measure alternatives with a fair, repeatable method. |
| [wcygan-coordinate](skills/wcygan-coordinate/SKILL.md) | Divide work, manage dependencies, and integrate results. |
| [wcygan-record](skills/wcygan-record/SKILL.md) | Preserve decisions, evidence, and unresolved issues. |
| [wcygan-deliver](skills/wcygan-deliver/SKILL.md) | Present or publish the verified result within authorized scope. |

## Components

Use a component for a focused task without invoking an entire procedure. Components
are self-contained: they have no required sibling skills, agent roles, or model
providers. Independent execution is optional and its absence is stated honestly.

| Component | Purpose |
| --- | --- |
| [discover-ambitious-goals](skills/discover-ambitious-goals/SKILL.md) | Find valuable outcomes, stretch goals, and evidence-backed first experiments. |
| [prepare-agent-objective](skills/prepare-agent-objective/SKILL.md) | Prove the inputs, execution, verification, and authority needed to pursue an outcome. |
| [maintain-outcome](skills/maintain-outcome/SKILL.md) | Run bounded improvement cycles with operational evidence and durable state. |
| [explain-code](skills/explain-code/SKILL.md) | Explain subsystem behavior and ownership from evidence. |
| [design-options](skills/design-options/SKILL.md) | Compare designs and sketch interfaces before implementation. |
| [compare-solutions](skills/compare-solutions/SKILL.md) | Compare competing solutions and verify a coherent synthesis. |
| [review-changes](skills/review-changes/SKILL.md) | Challenge a change or design and synthesize evidence-backed findings. |
| [explain-history](skills/explain-history/SKILL.md) | Explain the evidence behind a design decision or past failure. |
| [in-your-own-words](skills/in-your-own-words/SKILL.md) | Restate the user’s goal and underlying problem in clear, plain language. |
| [no-comments](skills/no-comments/SKILL.md) | Remove implementation commentary while preserving schema and contract documentation. |
| [clarify-task](skills/clarify-task/SKILL.md) | Turn an ambiguous task into an observable outcome and bounded scope. |
| [implement-change](skills/implement-change/SKILL.md) | Implement a bounded feature or refactor in verifiable steps. |
| [reproduce-bug](skills/reproduce-bug/SKILL.md) | Establish a failing-before and passing-after check for a bug. |
| [assess-impact](skills/assess-impact/SKILL.md) | Trace what a change could break beyond its immediate diff. |
| [verify-behavior](skills/verify-behavior/SKILL.md) | Check actual results against acceptance criteria. |
| [measure-performance](skills/measure-performance/SKILL.md) | Measure a performance claim fairly and repeatably. |
| [coordinate-work](skills/coordinate-work/SKILL.md) | Assign independent units, control shared writes, and reconcile results. |
| [decision-log](skills/decision-log/SKILL.md) | Keep an auditable record of consequential choices and evidence. |
| [progress-report](skills/progress-report/SKILL.md) | Catch the user up on changes, status, and decisions awaiting them. |
| [recover-context](skills/recover-context/SKILL.md) | Reconstruct the current state of prior work from scoped records and live artifacts. |
| [improve-workflow](skills/improve-workflow/SKILL.md) | Find evidence-backed improvements to an engineering process. |
| [prevent-recurrence](skills/prevent-recurrence/SKILL.md) | Prevent a demonstrated class of repeated mistakes through structure or checks. |
| [personalize-workflow](skills/personalize-workflow/SKILL.md) | Capture a user’s established working preferences in a concise skill. |
| [create-verification-skill](skills/create-verification-skill/SKILL.md) | Create a project skill that launches, exercises, and verifies real application behavior. |
| [maintain-verification-skill](skills/maintain-verification-skill/SKILL.md) | Check and repair a project verification skill against source and live behavior. |
| [deliver-change](skills/deliver-change/SKILL.md) | Present or publish a verified result within authorized scope. |
| [write-clearly](skills/write-clearly/SKILL.md) | Make technical prose, captions, and labels concise, concrete, and accurate. |
| [slice-changes](skills/slice-changes/SKILL.md) | Plan coherent PRs with verifiable intermediate states. |
| [technical-visuals](skills/technical-visuals/SKILL.md) | Explain technical relationships in 2D, or explicitly requested 3D, with paired light/dark themes. |
| [prepare-pull-request](skills/prepare-pull-request/SKILL.md) | Assemble a concise visual review package from the actual diff and evidence. |

The initial names `how`, `architect`, `arena`, and `interrogate` are now
`explain-code`, `design-options`, `compare-solutions`, and `review-changes`.
There are no alias copies. Upstream provenance and the mapping for every adapted
skill are recorded in [vendor/LOCAL-ATTRIBUTIONS.md](vendor/LOCAL-ATTRIBUTIONS.md).
See [Pstack generic port](docs/pstack-generic-port.md) for the upstream-to-local
mapping, procedure composition, and adaptation scope.

`create-verification-skill` produces executable project-specific guidance and a
feature map. `maintain-verification-skill` checks that map against source and live
behavior, keeping product regressions distinct from documentation drift.

The communication components connect planning to review: `slice-changes` establishes
small review boundaries, `technical-visuals` supplies a useful explanation, and
`prepare-pull-request` combines it with accurate prose and verification evidence.
Browse the [visual design system](skills/technical-visuals/references/design-system.md)
and [interactive examples](skills/technical-visuals/examples/index.html). Open the
examples locally; GitHub's source view does not execute the HTML. 2D is the default,
and 3D requires an explicit request. See the
[example check instructions](skills/technical-visuals/references/examples.md) for
browser validation and export checks.

## Specialists

| Skill | Purpose |
| --- | --- |
| [uv-python](skills/uv-python/SKILL.md) | Python development and dependency workflows with uv. |
| [just](skills/just/SKILL.md) | Maintain clear, reusable justfile commands. |
| [design-loop](skills/design-loop/SKILL.md) | Design, implement and verify a bounded UI outcome. |

## Install

Use a GitHub CLI build with `gh skill` support. Install to the shared user
directory explicitly:

```sh
gh skill install wcygan/agent-skills --agent codex --scope user --all --dir ~/.agents/skills
```

Install the full catalog for procedural composition; individual component installs
are also supported. A procedure uses sibling components through relative links,
so install its referenced components alongside it.

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

Historical entrypoints exist only inside `catalog.tar.gz`. The archive does not
contain extracted SKILL.md files, because GitHub CLI also discovers nested
`skills/` trees. Archive bundles never participate in skill installation. Restore
a skill deliberately from the bundle, validate it and refresh the snapshot.

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

## Publish and reset this machine through dotfiles

The repository-local [reinstall-agent-skills](.agents/skills/reinstall-agent-skills/SKILL.md)
workflow owns provider publication, the exact dotfiles pin and global refresh:

```sh
uv run --script tools/reinstall_agent_skills.py
# Explicitly reset the entire shared user catalog:
uv run --script tools/reinstall_agent_skills.py --reset-global
# Use a clean alternate consumer checkout when preserving unrelated edits:
uv run --script tools/reinstall_agent_skills.py --dotfiles /path/to/dotfiles --reset-global
```

The script refreshes the snapshot, runs `just check-full`, commits and pushes
provider changes, advances the consumer pin, installs and verifies through
`./bootstrap.sh agent-skills`, then commits and pushes the pin. Standard refresh
archives retired provider-owned copies through `--prune`. `--reset-global`
archives every other shared user skill through `--reset --yes`. Machine archives
live under XDG state outside skill discovery roots. Unrelated dotfiles edits must
be preserved; the consumer checkout used by the script must be clean.

## Author and validate

Skills remain immediate children of `skills/`, following the
[Agent Skills specification](https://agentskills.io/specification). The layout
also supports Agent Plugins packaging. Source ownership for future vendors is
recorded in `vendor/skills-lock.json`; adapted upstream work must preserve its
provenance and license. The active vendor lock is empty after this reset.

```sh
uv tool run --from skills-ref agentskills validate ./skills/<name>
just catalog-snapshot
just check-full
```

`just check` runs maintenance tests, source validation and snapshot verification;
`check-full` also checks GitHub CLI publication. The design reference app retains
its focused CI workflow and `just design-reference-check` command.
