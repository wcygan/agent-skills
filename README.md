# agent-skills

A public collection of reusable **agent skills** installable with the GitHub CLI:

```bash
gh skill install wcygan/agent-skills --agent codex --scope user --all
```

Skills follow the [Agent Skills](https://agentskills.io/specification) format
(`skills/<name>/SKILL.md`), which is what `gh skill install` discovers and
installs natively. The layout is also compatible with
[Agent Plugins](https://agent-plugins.org/) packaging, so the same tree can be
loaded as a plugin by plugin-capable clients.

> `gh skill` is a GitHub CLI preview feature and may change. Requires a recent
> GitHub CLI: `gh --version` (2.60+ recommended).

## Skills in this repo

| Skill | What it does | Install |
|-------|--------------|---------|
| `animate` | Builds production-ready UI animations from a request using deliberate motion, tooling, easing, interruption, and accessibility decisions. | `gh skill install wcygan/agent-skills animate --agent codex --scope user` |
| `animation-vocabulary` | Names web animation and motion effects from vague descriptions. | `gh skill install wcygan/agent-skills animation-vocabulary --agent codex --scope user` |
| `audit-observability-path` | Audits whether one scenario can be detected, correlated, explained, and reconstructed across system boundaries. | `gh skill install wcygan/agent-skills audit-observability-path --agent codex --scope user` |
| `audit-resilience` | Audits a bounded system for fragile states, failure amplification, weak recovery, and verification gaps, then ranks hardening patterns. | `gh skill install wcygan/agent-skills audit-resilience --agent codex --scope user` |
| `audit-workflow-graph` | Audits an existing workflow graph for structural, state, recovery, authority, observability, and proof risks without redesigning it. | `gh skill install wcygan/agent-skills audit-workflow-graph --agent codex --scope user` |
| `better-colors` | Designs OKLCH palettes, checks contrast, and guides web color systems. | `gh skill install wcygan/agent-skills better-colors --agent codex --scope user` |
| `better-ui` | Applies design-engineering principles for polished interface details and interactions. | `gh skill install wcygan/agent-skills better-ui --agent codex --scope user` |
| `check-my-prs` | Produces a read-only terminal health report for the current PR or stack, including review threads, CI, merge order, stack health, and PR-guideline findings. | `gh skill install wcygan/agent-skills check-my-prs --agent codex --scope user` |
| `choose-workflow-control-model` | Chooses the smallest justified deterministic, graph, agent-loop, or multi-agent control model for a bounded workflow. | `gh skill install wcygan/agent-skills choose-workflow-control-model --agent codex --scope user` |
| `code-review` | Reviews changes against repository standards and the originating specification. | `gh skill install wcygan/agent-skills code-review --agent codex --scope user` |
| `codebase-design` | Designs deep modules and shared vocabulary for maintainable, testable code. | `gh skill install wcygan/agent-skills codebase-design --agent codex --scope user` |
| `design-bounded-loop` | Designs or audits a read-only Loop Contract with explicit authority, progress, budgets, terminal states, and final evidence. | `gh skill install wcygan/agent-skills design-bounded-loop --agent codex --scope user` |
| `design-llm-evaluation-suite` | Designs regression-oriented LLM and agent evaluation suites with bounded cases, authoritative oracles, trace evidence, framework selection, and CI gates. | `gh skill install wcygan/agent-skills design-llm-evaluation-suite --agent codex --scope user` |
| `design-verification-strategy` | Designs risk-based proof across test tiers, authoritative oracles, fixtures, environments, held-out checks, and acceptance gates. | `gh skill install wcygan/agent-skills design-verification-strategy --agent codex --scope user` |
| `design-workflow-graph` | Designs a bounded graph workflow as a reconciled pack of state, node, edge, recovery, authority, observability, and proof contracts. | `gh skill install wcygan/agent-skills design-workflow-graph --agent codex --scope user` |
| `diagnose-difficult-bug` | Orchestrates a faithful reproduction, failure trace, causal diagnosis, regression oracle, and repair boundary for difficult bugs. | `gh skill install wcygan/agent-skills diagnose-difficult-bug --agent codex --scope user` |
| `domain-modeling` | Builds and sharpens a project's domain model, terminology, decisions, and glossary. | `gh skill install wcygan/agent-skills domain-modeling --agent codex --scope user` |
| `effect-ts` | Builds production TypeScript applications with Effect v4, including workflows, services, schemas, configuration, schedules, caches, streams, HTTP clients, and tests. | `gh skill install wcygan/agent-skills effect-ts --agent codex --scope user` |
| `emil-design-eng` | Applies Emil Kowalski's design-engineering philosophy to UI polish, component details, and animation decisions. | `gh skill install wcygan/agent-skills emil-design-eng --agent codex --scope user` |
| `ephemeral-chooser` | Creates, compares, shares, and promotes temporary component variants. | `gh skill install wcygan/agent-skills ephemeral-chooser --agent codex --scope user` |
| `evaluate-agent-workflow` | Diagnoses agent behavior across model inputs, tool contracts, orchestration, durable events, projections, output, and focused regression evals. | `gh skill install wcygan/agent-skills evaluate-agent-workflow --agent codex --scope user` |
| `find-animation-opportunities` | Identifies UI moments that benefit from motion and proposes precise recipes. | `gh skill install wcygan/agent-skills find-animation-opportunities --agent codex --scope user` |
| `find-skills` | Helps users discover and install agent skills for specialized tasks. | `gh skill install wcygan/agent-skills find-skills --agent codex --scope user` |
| `gh-stack` | Manages stacked branches and pull requests with the GitHub CLI's `gh stack` workflow. | `gh skill install wcygan/agent-skills gh-stack --agent codex --scope user` |
| `gh-stack-companion` | Reconciles local and remote stack topology, explains health and merge order, and recommends safe sync, rebase, and recovery paths. | `gh skill install wcygan/agent-skills gh-stack-companion --agent codex --scope user` |
| `grill-with-docs` | Runs a relentless design interview while creating ADRs and a glossary. | `gh skill install wcygan/agent-skills grill-with-docs --agent codex --scope user` |
| `grilling` | Relentlessly stress-tests a plan, decision, or idea through a design tree. | `gh skill install wcygan/agent-skills grilling --agent codex --scope user` |
| `handoff` | Compacts the current conversation into a handoff document for another agent. | `gh skill install wcygan/agent-skills handoff --agent codex --scope user` |
| `hill-climbing` | Runs a guarded, metric-driven optimization loop using one-variable experiments, a numeric measure, behavioral guard, and plateau rules. | `gh skill install wcygan/agent-skills hill-climbing --agent codex --scope user` |
| `ideate-orchestrator-skill` | Designs higher-order skill compositions as orchestrators, routers, or decision frameworks with explicit phase, authority, and portability contracts. | `gh skill install wcygan/agent-skills ideate-orchestrator-skill --agent codex --scope user` |
| `improve-agent-harness` | Improves an agent harness through batch-derived failure clusters, bounded single-variable experiments, cold replay, and held-out evidence. | `gh skill install wcygan/agent-skills improve-agent-harness --agent codex --scope user` |
| `improve-animations` | Audits animation code and produces prioritized, self-contained improvement plans. | `gh skill install wcygan/agent-skills improve-animations --agent codex --scope user` |
| `improve-codebase-architecture` | Scans a codebase for deepening opportunities and presents a visual HTML report. | `gh skill install wcygan/agent-skills improve-codebase-architecture --agent codex --scope user` |
| `improve-development-loop` | Finds and automates repeated developer and agent work to shorten the path from a change to trustworthy feedback. | `gh skill install wcygan/agent-skills improve-development-loop --agent codex --scope user` |
| `incremental-execution` | Delivers one bounded local change through vertical implementation slices, evidence-backed verification, bounded recovery, and optional authorized Git finalization. | `gh skill install wcygan/agent-skills incremental-execution --agent codex --scope user` |
| `incident-learning-loop` | Turns one closed or stabilized incident into a read-only, evidence-backed learning pack with reconciled causes, impact, gaps, ranked actions, and proof requirements. | `gh skill install wcygan/agent-skills incident-learning-loop --agent codex --scope user` |
| `just` | Designs, inspects, and maintains justfile command workflows with safe parameters, dependencies, environment handling, and validation. | `gh skill install wcygan/agent-skills just --agent codex --scope user` |
| `live-test-changes` | Deploys one application change locally, exercises its public paths and feature-flag states, and produces reproducible runtime evidence. | `gh skill install wcygan/agent-skills live-test-changes --agent codex --scope user` |
| `map-change-impact` | Maps the blast radius, compatibility obligations, rollout risks, and validation needs of a proposed change. | `gh skill install wcygan/agent-skills map-change-impact --agent codex --scope user` |
| `map-production-scenario` | Produces one read-only dossier that reconciles a bounded production scenario's execution, data lineage, operational signals, and optional failure path. | `gh skill install wcygan/agent-skills map-production-scenario --agent codex --scope user` |
| `model-concurrency` | Models actors, state, ordering, invariants, and counterexample schedules for concurrent and distributed behavior. | `gh skill install wcygan/agent-skills model-concurrency --agent codex --scope user` |
| `monitor-until` | Watches one authoritative state source read-only with bounded polling, normalized transitions, terminal outcomes, and truthful wakeup limits. | `gh skill install wcygan/agent-skills monitor-until --agent codex --scope user` |
| `multi-agent-orchestration` | Coordinates bounded multi-agent software delivery through dependency-aware assignments, safe checkout topology, semantic integration, and combined verification. | `gh skill install wcygan/agent-skills multi-agent-orchestration --agent codex --scope user` |
| `new-plugin` | Scaffolds a new Agent Skill (or Agent Plugins package) into this repo with valid frontmatter, and validates the result. | `gh skill install wcygan/agent-skills new-plugin --agent codex --scope user` |
| `operate-kubernetes-gitops` | Diagnoses and safely repairs GitOps-managed Kubernetes systems by reconciling desired, rendered, controller, live, dependency, and user-visible state. | `gh skill install wcygan/agent-skills operate-kubernetes-gitops --agent codex --scope user` |
| `pi-coding-agent` | Uses and investigates the Pi coding-agent CLI, including sessions, models, skills, and extensions. | `gh skill install wcygan/agent-skills pi-coding-agent --agent codex --scope user` |
| `pi-sdk` | Builds, debugs, and explains TypeScript integrations with the Pi coding-agent SDK. | `gh skill install wcygan/agent-skills pi-sdk --agent codex --scope user` |
| `plan-safe-refactor` | Plans staged, behavior-preserving refactors with invariants, checkpoints, compatibility, rollback, and cleanup. | `gh skill install wcygan/agent-skills plan-safe-refactor --agent codex --scope user` |
| `planetscale-mysql` | Plans and reviews MySQL schemas, indexes, queries, transactions, migrations, and operations. | `gh skill install wcygan/agent-skills planetscale-mysql --agent codex --scope user` |
| `planetscale-postgres` | Applies PostgreSQL and PlanetScale Postgres practices for schema, queries, performance, connections, and operations. | `gh skill install wcygan/agent-skills planetscale-postgres --agent codex --scope user` |
| `pr-guidelines` | Evaluates an individual PR's description, testing evidence, naming, reviewability, CI, scope, and AI-generated-code risks. | `gh skill install wcygan/agent-skills pr-guidelines --agent codex --scope user` |
| `prototype` | Builds throwaway logic/state or UI prototypes to answer a focused design question. | `gh skill install wcygan/agent-skills prototype --agent codex --scope user` |
| `reconcile-documentation` | Discovers project documentation wherever it lives, classifies drift against authoritative evidence, updates confirmed stale docs, and validates the result. | `gh skill install wcygan/agent-skills reconcile-documentation --agent codex --scope user` |
| `research` | Researches a question from high-trust primary sources and records cited findings in the repository. | `gh skill install wcygan/agent-skills research --agent codex --scope user` |
| `reproduce-bug` | Turns intermittent or poorly understood symptoms into controlled, repeatable reproductions with reliable regression oracles. | `gh skill install wcygan/agent-skills reproduce-bug --agent codex --scope user` |
| `resolving-merge-conflicts` | Resolves in-progress Git merge or rebase conflicts by preserving the competing changes’ intent. | `gh skill install wcygan/agent-skills resolving-merge-conflicts --agent codex --scope user` |
| `review-animations` | Reviews animation and motion code against a high craft bar. | `gh skill install wcygan/agent-skills review-animations --agent codex --scope user` |
| `shadcn` | Manages shadcn components and projects, including discovery, styling, debugging, composition, and registries. | `gh skill install wcygan/agent-skills shadcn --agent codex --scope user` |
| `shape-safe-change` | Shapes architecture-sensitive changes into one read-only design pack covering domain meaning, seams, impact, compatibility, staged transition, rollback, and proof. | `gh skill install wcygan/agent-skills shape-safe-change --agent codex --scope user` |
| `skill-intake` | Formalizes rough automation ideas into a skill decision, structured brief, and paste-ready implementation handoff. | `gh skill install wcygan/agent-skills skill-intake --agent codex --scope user` |
| `sloppy-commit-push` | Stages all repository changes, creates a concise Conventional Commit, and pushes the current branch. | `gh skill install wcygan/agent-skills sloppy-commit-push --agent codex --scope user` |
| `setup-matt-pocock-skills` | Configures issue tracking, triage labels, and domain-document layout for Matt Pocock's engineering skills. | `gh skill install wcygan/agent-skills setup-matt-pocock-skills --agent codex --scope user` |
| `to-spec` | Synthesizes the current conversation and codebase context into a specification published to the configured issue tracker. | `gh skill install wcygan/agent-skills to-spec --agent codex --scope user` |
| `to-tickets` | Breaks a plan, specification, or conversation into tracer-bullet tickets with explicit blocking edges. | `gh skill install wcygan/agent-skills to-tickets --agent codex --scope user` |
| `trace-codepath` | Traces one execution path across functions, services, transports, asynchronous work, and resources with evidence-backed diagrams. | `gh skill install wcygan/agent-skills trace-codepath --agent codex --scope user` |
| `trace-data-lineage` | Traces a field, record, event, or dataset through transformations, ownership boundaries, copies, and exposures. | `gh skill install wcygan/agent-skills trace-data-lineage --agent codex --scope user` |
| `trace-failure-path` | Traces a concrete failure through propagation, partial state, retries, recovery, and user or operator outcomes. | `gh skill install wcygan/agent-skills trace-failure-path --agent codex --scope user` |
| `triage` | Categorizes and verifies issues and external pull requests, then moves them through a triage state machine with durable agent briefs. | `gh skill install wcygan/agent-skills triage --agent codex --scope user` |
| `tdd` | Applies test-driven development with a red-green-refactor loop and durable tests. | `gh skill install wcygan/agent-skills tdd --agent codex --scope user` |
| `typst-author` | Generates, edits, and troubleshoots Typst documents and projects. | `gh skill install wcygan/agent-skills typst-author --agent codex --scope user` |
| `uv-python` | Guides Python work with uv across versions, scripts, tools, projects, dependencies, lockfiles, configuration, resolution, and caching. | `gh skill install wcygan/agent-skills uv-python --agent codex --scope user` |
| `vercel-composition-patterns` | Applies scalable React composition patterns for flexible component libraries and reusable APIs. | `gh skill install wcygan/agent-skills vercel-composition-patterns --agent codex --scope user` |
| `vercel-react-best-practices` | Applies Vercel React and Next.js performance optimization guidelines. | `gh skill install wcygan/agent-skills vercel-react-best-practices --agent codex --scope user` |
| `vercel-react-view-transitions` | Implements native-feeling React View Transition animations for routes, components, lists, and shared elements. | `gh skill install wcygan/agent-skills vercel-react-view-transitions --agent codex --scope user` |
| `verify-and-revise` | Revises one authorized artifact against a fixed rubric through a bounded producer-verifier loop and attempt ledger. | `gh skill install wcygan/agent-skills verify-and-revise --agent codex --scope user` |
| `wait-what` | Requests a clearer re-pitch when the previous message did not land. | `gh skill install wcygan/agent-skills wait-what --agent codex --scope user` |
| `web-design-guidelines` | Reviews UI code for Web Interface Guidelines compliance, accessibility, UX, and best practices. | `gh skill install wcygan/agent-skills web-design-guidelines --agent codex --scope user` |
| `writing-for-agents` | Guides writing skills, AGENTS.md, CLAUDE.md, and other documents for agents. | `gh skill install wcygan/agent-skills writing-for-agents --agent codex --scope user` |

## PR and stack health

From a repository checkout, the `check-my-prs` terminal inspector checks the current PR and expands an official GitHub PR stack when detected:

```bash
uv run skills/check-my-prs/scripts/check_my_prs.py
```

Use `--pr 123`, `--repo OWNER/REPO`, `--plain`, or `--json` to change the target or presentation. The inspector is read-only; exit `0` means healthy, `1` means action is needed, `2` means evidence is incomplete, and `3` means the environment or input prevented inspection.

## Installation

### Requirements

- [GitHub CLI](https://cli.github.com/) with the `gh skill` commands
  (`gh skill --help`).
- [uv](https://docs.astral.sh/uv/) to run the optional `check-my-prs` terminal inspector.
- A public GitHub repository hosting this repo (clone/clone-able via HTTPS).

### Install all skills for one agent

```bash
# Global (user scope) for Codex
gh skill install wcygan/agent-skills --agent codex --scope user --all

# Project scope (inside a git repo) for Claude Code
gh skill install wcygan/agent-skills --agent claude-code --scope project --all
```

- `--agent` values include `github-copilot`, `claude-code`, `cursor`, `codex`,
  `gemini-cli`, `opencode`, `warp`, and more. Run `gh skill install --help` for
  the full list.
- `--scope` is `project` (current git repo, default) or `user` (your home
  directory, available everywhere). At project scope several agents share
  `.agents/skills`, so a skill is installed only once.
- Skip `--all` to choose interactively, or pass a skill name to install just one:

```bash
gh skill install wcygan/agent-skills new-plugin --agent codex --scope user
```

### Pin a specific version

```bash
# Tags or commit SHAs; semver tags recommended
gh skill install wcygan/agent-skills --agent codex --scope user --all --pin v1.0.0
# or per skill: gh skill install wcygan/agent-skills new-plugin@v1.0.0 ...
```

### Install from a local checkout (for testing)

```bash
gh skill install . --from-local --all --dir /tmp/skill-check
```

## Updating

```bash
# Update all installed skills
gh skill update --all

# Update one skill for one agent/scope
gh skill update new-plugin --agent codex --scope user

# See what would update without changing anything
gh skill update --dry-run
```

## Vendored skills

This repository vendors selected skills from external repositories so the
collection can be installed as one tested, versioned set. Source repositories,
selected skills, and pinned revisions are recorded in
`vendor/skills-lock.json`; attribution is kept in `vendor/ATTRIBUTIONS.md`.

Use the `uv`-managed maintenance tool to check or update an external source:

```bash
uv run tools/sync_skills.py check
uv run tools/sync_skills.py check planetscale/database-skills
uv run tools/sync_skills.py check --jobs 1  # sequential fallback
uv run tools/sync_skills.py check --color always  # preserve color when piping
uv run tools/sync_skills.py update planetscale/database-skills
uv run tools/sync_skills.py validate
```

`check` is non-mutating and checks sources concurrently with up to four workers.
Use `--jobs` to change that bound; output remains in lock-file order. Status
prefixes are green for up-to-date sources and yellow when an update is
available. Color defaults to terminal-aware `auto`, respects `NO_COLOR`, and
can be controlled with `--color always|never`.

A source can declare `remove_frontmatter` in the lock file for upstream,
client-specific top-level keys that the Agent Skills specification rejects.
The sync tool applies that compatibility normalization on every update.
Provider-specific `openai.yaml` and `openai.yml` manifests are excluded from
every vendored skill copy and rejected by vendored-skill validation.

Vendored skills keep their upstream names when those names are collision-free.
Sources with generic names are namespaced (`planetscale-mysql`,
`planetscale-postgres`, and so on) to avoid collisions with independently
maintained skills. Updating a source changes the vendored files and lock
revision; tag the repository afterward to publish a tested collection version.

Notes:
- Skills installed with `--pin` are skipped until you unpin
  (`gh skill update new-plugin --unpin`).
- `gh skill update` compares a tree SHA that gh stores in the installed skill's
  frontmatter against the remote repo.
- gh injects source-tracking `metadata.github-*` into installed skills, which
  is what makes `gh skill update` work. Keep this metadata out of the repo —
  `gh skill publish --fix` strips it if it ever gets committed.

## Managing installed skills

```bash
gh skill list                 # all hosts, project + user scope
gh skill list --agent codex --scope user
gh skill preview wcygan/agent-skills new-plugin   # inspect before installing
gh skill search <query>       # find skills across GitHub
```

The CLI does not currently provide `gh skill uninstall`; to remove a skill,
delete its directory from the location shown in `gh skill list`.

## For repository maintainers

This repo is distributed via `gh skill install`, so it follows the
**Agent Skills** conventions:

- Every skill is an immediate child of `skills/`: `skills/<name>/SKILL.md`.
- `SKILL.md` frontmatter `name` must match the directory name (1-64 chars,
  lowercase `a-z0-9` + hyphens, no `--`, no leading/trailing hyphen) and must
  include a `description` (1-1024 chars).
- Adding `plugin.json` at the repo root turns the same tree into an Agent
  Plugins package for plugin-capable clients (VS Code, Cursor, Copilot,
  ChatGPT/Codex, Kiro).

### Validate and release

```bash
gh skill publish --dry-run          # validate all skills in this repo
gh skill publish --tag v1.0.0       # add the `agent-skills` topic + create a release
```

Run `gh skill publish --dry-run` before pushing changes, and cut a semver git
tag (`v1.*`) when you want users to be able to pin a release.

# Contributing
- Add a new skill: use the `new-plugin` skill (or read `AGENTS.md`).
- Validate before pushing: `gh skill publish --dry-run` from the repo root.
- Skills must follow the Agent Skills specification: https://agentskills.io/specification

## Official documentation

- Agent Skills specification (skill format): <https://agentskills.io/specification>
- `gh skill install` manual: <https://cli.github.com/manual/gh_skill_install>
- Agent Plugins (portable plugin packaging): <https://agent-plugins.org/>
- Agent Plugins specification: <https://agent-plugins.org/specification>
- Plugin manifest (`plugin.json`): <https://agent-plugins.org/plugin-authors/manifest>
- Agent Plugins skills: <https://agent-plugins.org/plugin-authors/skills>

## License

MIT — see [LICENSE](LICENSE).
