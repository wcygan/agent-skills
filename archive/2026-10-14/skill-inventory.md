# Pstack reset inventory

Updated 2026-10-14. This report separates removal groups from your own orchestrators and specialists. It supports a nearly complete archive/reset; it does not presume that old Matt outputs or local workflows must be preserved. No catalog archive, deletion, installation or publication has been executed.

## How to read the sections

- **Orchestrator:** coordinates several specialist skills or worker agents, manages their evidence and produces one integrated result.
- **Non-orchestrator:** a specialist, standalone workflow, execution loop or wrapper. Several steps alone do not make it an orchestrator.
- **With companions:** another named skill participates in its own work, even if conditional or replaceable. This is different from requiring that skill to be installed.
- **Without skill dependencies:** its own output can be produced without invoking another named skill. It can still require tools, libraries, model access, bundled scripts or references.
- **Recorded authorship:** author metadata names William Cygan. **Unconfirmed:** repository-owned with local addition history, but original authorship is not recorded. All 71 local skills are included in the own-skill sections; the distinction remains visible.
- A skill that designs orchestrators or creates routers is classified by what it does now, not by what its output later does.

## Section counts

| Section | Count |
| --- | ---: |
| Matt Pocock origin: archive/remove group | 22 |
| Your orchestrators with skill companions | 11 |
| Your orchestrators without other skill dependencies | 1 |
| Your non-orchestrators with skill companions/dependencies | 18 |
| Your non-orchestrators without other skill dependencies | 41 |
| Other upstream/vendor-origin skills | 23 |
| **Published catalog total** | **116** |

## Matt Pocock skills — archive/remove all 22

Treat every Matt-origin leaf as removable, including locally maintained adaptations. There is no prerequisite to recreate their old capabilities. The cleanup obligation is to remove or rewrite references in whatever local skills you decide to restore.

| Skill | What it does / when to use it | Current maintenance |
| --- | --- | --- |
| [ask-matt](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/ask-matt/SKILL.md) | Select the smallest Matt/local engineering skill or workflow that fits the request. | Locally maintained upstream adaptation |
| [code-review](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/code-review/SKILL.md) | Review a PR or diff against repository standards and requested behavior; report actionable findings. | Locally maintained upstream adaptation |
| [codebase-design](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/codebase-design/SKILL.md) | Design module boundaries and APIs that hide implementation complexity and improve testability. | Locally maintained upstream adaptation |
| [diagnosing-bugs](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/diagnosing-bugs/SKILL.md) | Reproduce a bug or performance regression, investigate its cause, implement a focused repair and check it. | Locally maintained upstream adaptation |
| [domain-modeling](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/domain-modeling/SKILL.md) | Clarify domain concepts, boundaries and shared terminology; maintain glossary or architecture-decision documents when requested. | Locally maintained upstream adaptation |
| [grill-with-docs](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/grill-with-docs/SKILL.md) | Interview the user about a design while recording terminology, decisions and durable project notes. | Locally maintained upstream adaptation |
| [grilling](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/grilling/SKILL.md) | Challenge a plan or idea through sustained questions that expose assumptions and unresolved choices. | Locally maintained upstream adaptation |
| [handoff](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/handoff/SKILL.md) | Produce a continuation document so another agent can resume the current work with its state and decisions. | Managed vendor |
| [implement](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/implement/SKILL.md) | Carry a sufficiently defined specification or ticket through implementation and relevant checks. | Locally maintained upstream adaptation |
| [improve-codebase-architecture](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/improve-codebase-architecture/SKILL.md) | Find opportunities for deeper module boundaries and explain them through a visual architecture report. | Locally maintained upstream adaptation |
| [prototype](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/prototype/SKILL.md) | Build a disposable UI or logic artifact to answer a specific design question through observation. | Locally maintained upstream adaptation |
| [research](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/research/SKILL.md) | Investigate a bounded technical question against primary sources and save a cited research note. | Locally maintained upstream adaptation |
| [resolving-merge-conflicts](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/resolving-merge-conflicts/SKILL.md) | Finish a conflicted Git merge or rebase while preserving the intent of both sets of changes. | Locally maintained upstream adaptation |
| [setup-matt-pocock-skills](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/setup-matt-pocock-skills/SKILL.md) | Configure the issue tracker, triage labels and domain-document conventions used by Matt’s engineering workflows. | Locally maintained upstream adaptation |
| [tdd](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/tdd/SKILL.md) | Implement features or fixes through a test-first red-green-refactor workflow. | Locally maintained upstream adaptation |
| [to-spec](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/to-spec/SKILL.md) | Synthesize the conversation into a specification and publish it to the configured project issue tracker. | Locally maintained upstream adaptation |
| [to-tickets](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/to-tickets/SKILL.md) | Break a specification into verifiable vertical work slices and record their dependencies in implementation tickets. | Locally maintained upstream adaptation |
| [triage](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/triage/SKILL.md) | Process incoming issues and external PRs through classification, verification and clarification into actionable briefs. | Locally maintained upstream adaptation |
| [wait-what](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/wait-what/SKILL.md) | Explain a confusing previous answer again with a different framing and enough context to make it clear. | Managed vendor |
| [wayfinder](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/wayfinder/SKILL.md) | Map a large uncertain effort into shared decision tickets, then resolve the decisions across sessions. | Locally maintained upstream adaptation |
| [wizard](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/wizard/SKILL.md) | Generate an interactive shell walkthrough for provisioning or setup steps that only the human can perform. | Locally maintained upstream adaptation |
| [writing-for-agents](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/writing-for-agents/SKILL.md) | Write and revise skills and agent instructions using clear triggers, information hierarchy and completion criteria. | Managed vendor |

Removing the Matt source from vendor/skills-lock.json addresses only handoff, wait-what and writing-for-agents. The other 19 live outside that source mapping. Preserve attribution for any Matt-derived material you intentionally restore; archiving every consumer avoids needing to retarget them now.

## Your orchestrators with skill companions

These compose other skills and own the combined result. Companions are predominantly conditional or replaceable, not hard installation prerequisites. **[Matt]** marks a target in the removal group; [other upstream] marks a separate vendor/adaptation.

| Skill | What it orchestrates | Skill companions | Authorship |
| --- | --- | --- | --- |
| [check-my-prs](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/check-my-prs/SKILL.md) | Combines stack, presentation, review and CI evidence into one PR/stack health report; also routes follow-up work. | `gh-stack` [other upstream], `gh-stack-companion`, `pr-guidelines`, `github-pr-media-proof`, `code-review` **[Matt]**, `gh-address-comments` [other upstream], `gh-fix-ci` [other upstream] | Unconfirmed |
| [delegate-and-verify](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/delegate-and-verify/SKILL.md) | Dispatches a worker, independently judges its artifacts, and manages correction attempts. | `route-agent-models` | Recorded |
| [design-workflow-graph](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-workflow-graph/SKILL.md) | Reconciles graph design with optional concurrency, route, signal and verification specialists into one design pack. | `choose-workflow-control-model`, `model-concurrency`, `route-agent-models`, `design-verification-strategy`, `audit-observability-path` | Recorded |
| [diagnose-difficult-bug](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/diagnose-difficult-bug/SKILL.md) | Coordinates reproduction, failure tracing, concurrency and signal lenses into a causal diagnosis. | `reproduce-bug`, `trace-failure-path`, `model-concurrency`, `audit-observability-path` | Recorded |
| [find-and-fix](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/find-and-fix/SKILL.md) | Coordinates diagnosis, execution/data/failure tracing, repair planning and verification of one issue. | `diagnosing-bugs` **[Matt]**, `trace-codepath`, `trace-failure-path`, `trace-data-lineage`, `audit-resilience`, `plan-safe-refactor`, `route-agent-models` | Recorded |
| [flow-simplification](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/flow-simplification/SKILL.md) | Combines tracing, proof design, change shaping and focused edits into a verified redesign. | `trace-codepath`, `design-verification-strategy`, `shape-safe-change`, `plan-safe-refactor`, `simplify-code`, `logical-compaction`, `humanizer` [other upstream], `route-agent-models` | Recorded |
| [incident-learning-loop](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/incident-learning-loop/SKILL.md) | Routes unresolved causal, impact and signal questions; reconciles findings and proof plans. | `diagnose-difficult-bug`, `map-production-scenario`, `audit-observability-path`, `design-verification-strategy` | Recorded |
| [map-production-scenario](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/map-production-scenario/SKILL.md) | Integrates execution, lineage, signal and optional failure evidence into one dossier. | `trace-codepath`, `trace-data-lineage`, `audit-observability-path`, `trace-failure-path` | Recorded |
| [productionize-flow](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/productionize-flow/SKILL.md) | Coordinates resilience analysis, hardening, signals, implementation and runtime proof. | `audit-resilience`, `find-and-fix`, `model-concurrency`, `audit-observability-path`, `design-verification-strategy`, `shape-safe-change`, `plan-safe-refactor`, `incremental-execution`, `live-test-changes`, `computer-use-ui-testing`, `route-agent-models` | Recorded |
| [shape-safe-change](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/shape-safe-change/SKILL.md) | Sequences seam design, domain/impact analysis, transition planning and proof into one change-design pack. | `codebase-design` **[Matt]**, `map-change-impact`, `plan-safe-refactor`, `design-verification-strategy`, `domain-modeling` **[Matt]** | Recorded |
| [understand-system](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/understand-system/SKILL.md) | Combines selected execution/data/operational lenses and visual presentation into one system map. | `trace-codepath`, `trace-data-lineage`, `map-production-scenario`, `style-technical-visuals`, `domain-modeling` **[Matt]**, `route-agent-models` | Recorded |

### Dependency strength for these orchestrators

| Skill | Requirement or fallback |
| --- | --- |
| check-my-prs | Optional specialists with direct-work fallback; follow-up routes retain their own request scope. |
| delegate-and-verify | Worker-agent capability is required; route-agent-models is a conditional helper, not the worker itself. |
| design-workflow-graph | Companions provide evidence; the entrypoint explicitly says they are not installation prerequisites. |
| diagnose-difficult-bug | All four companions have direct-analysis fallbacks. |
| find-and-fix | diagnosing-bugs is the prescribed core loop; the entrypoint explicitly permits replacing missing companions with direct work. |
| flow-simplification | Conditional companions; direct work is allowed if equivalent evidence can be established. |
| incident-learning-loop | Conditional companions; direct analysis allowed. Downstream remediation handoffs are excluded here. |
| map-production-scenario | Three baseline lenses and one failure branch; missing companions may be replaced by direct analysis. |
| productionize-flow | Replaceable specialists; required evidence does not require installation of every companion. |
| shape-safe-change | Companion contracts are explicit; particular installed skills are not prerequisites. |
| understand-system | Visual presentation is a core phase; missing specialists may be replaced by direct analysis/presentation. |

## Your orchestrators without other skill dependencies

| Skill | What it orchestrates | External capability still needed | Authorship |
| --- | --- | --- | --- |
| [multi-agent-orchestration](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/multi-agent-orchestration/SKILL.md) | Dispatches workers, manages task dependencies and integration, and verifies the combined result. | Worker/agent dispatch and access to their artifacts | Unconfirmed |

This is a useful distinction for a reset: multi-agent-orchestration is an orchestrator even though it does not require another installed skill.

## Your non-orchestrators with skill companions or dependencies

### Required parent dependencies: wrappers

These two wrappers explicitly require their parent to be installed. They select a model and invoke one workflow; their parent owns the orchestration.

| Skill | Required skill | Authorship |
| --- | --- | --- |
| [luna](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/luna/SKILL.md) | `delegate-and-verify` | Recorded |
| [sol](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/sol/SKILL.md) | `delegate-and-verify` | Recorded |

### Specialists and standalone workflows with conditional companions

| Skill | Role | Companions | Requirement or fallback | Authorship |
| --- | --- | --- | --- | --- |
| [design-llm-evaluation-suite](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-llm-evaluation-suite/SKILL.md) | specialist | `route-agent-models` | Conditional multi-agent routing reference prescribes route-agent-models for route records; not needed for every eval suite. | Recorded |
| [distill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/distill/SKILL.md) | specialist | `show-me` | show-me is optional and an equivalent direct visual is explicitly allowed. | Recorded |
| [effect-ts](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/effect-ts/SKILL.md) | specialist | `pi-sdk`, `opencode-sdk` | Only Pi/OpenCode integration branches call these SDK specialists; each has official-docs fallback. | Unconfirmed |
| [evaluate-agent-workflow](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/evaluate-agent-workflow/SKILL.md) | specialist | `route-agent-models` | Conditional routing inspection; direct route evidence is an explicit fallback. | Recorded |
| [functional-decomposition](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/functional-decomposition/SKILL.md) | specialist | `codebase-design` **[Matt]**, `simplify-code`, `plan-safe-refactor`, `model-concurrency` | Explicitly optional narrower specialists; not prerequisites. | Recorded |
| [gh-stack-companion](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/gh-stack-companion/SKILL.md) | specialist | `gh-stack` [other upstream], `pr-guidelines`, `resolving-merge-conflicts` **[Matt]** | gh-stack supplies command semantics; pr-guidelines and conflict help are narrower branches. The CLI is a separate tool dependency. | Unconfirmed |
| [github-pr-media-proof](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/github-pr-media-proof/SKILL.md) | specialist | `playwright-cli` [other upstream] | Preferred capture specialist; equivalent capture tools are explicitly allowed. | Unconfirmed |
| [ideate-orchestrator-skill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/ideate-orchestrator-skill/SKILL.md) | specialist | `route-agent-models` | Designs orchestrators; does not execute one. Routing helper applies when designing selectable agent routes. | Recorded |
| [improve-agent-harness](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/improve-agent-harness/SKILL.md) | standalone workflow | `writing-for-agents` **[Matt]**, `route-agent-models` | Prescribed helpers in instruction-editing and model-route experiment branches; no hard-install requirement is declared. | Unconfirmed |
| [improve-development-loop](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/improve-development-loop/SKILL.md) | standalone workflow | `just`, `uv-python`, `writing-for-agents` **[Matt]** | Prescribed helpers when using just, Python scripts or agent-skill promotion; not required for every development-loop change. | Recorded |
| [new-plugin](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/new-plugin/SKILL.md) | specialist | `writing-for-agents` **[Matt]** | writing-for-agents is explicitly optional; essentials are included locally. | Unconfirmed |
| [new-router-skill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/new-router-skill/SKILL.md) | specialist | `ideate-orchestrator-skill`, `writing-for-agents` **[Matt]** | Optional composition exploration and authoring helpers; also contains adapted authoring guidance locally. | Recorded |
| [opencode-sdk](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/opencode-sdk/SKILL.md) | specialist | `effect-ts` | Optional Effect application guidance; no named companion is an installation prerequisite. | Unconfirmed |
| [pr-guidelines](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/pr-guidelines/SKILL.md) | specialist | `github-pr-media-proof` | Conditional visual-capture/update branch; code-review is an alternative request owner, not a dependency of presentation review. | Unconfirmed |
| [prompt-kit](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/prompt-kit/SKILL.md) | specialist | `shadcn` [other upstream] | shadcn supplies generic CLI behavior during setup; research and general UI review are alternate request routes. | Unconfirmed |
| [reconcile-documentation](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/reconcile-documentation/SKILL.md) | specialist | `writing-for-agents` **[Matt]** | Optional helper for agent-facing edits, with local-format fallback. | Recorded |

new-router-skill also embeds adapted writing-for-agents essentials in references/writing-for-agents.md. Removing the invocation does not remove that material. Its reset inventory marks the embedded upstream guidance separately.

## Your non-orchestrators without other skill dependencies

These own their analysis, guidance or execution. Some contain navigation references, which are documented in the following section; those references do not make another skill a prerequisite for their own output.

| Skill | Role | Own capability | Authorship |
| --- | --- | --- | --- |
| [audit-observability-path](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-observability-path/SKILL.md) | specialist | Audit observability for one request, event, or job | Recorded |
| [audit-resilience](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-resilience/SKILL.md) | specialist | Audit a system for fragile behavior and difficult recovery | Recorded |
| [audit-skill-catalog](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-skill-catalog/SKILL.md) | specialist | Audit a skill catalog for confusing selection, overlap, and fragmentation | Recorded |
| [audit-workflow-graph](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-workflow-graph/SKILL.md) | specialist | Audit an existing workflow graph for stalled, duplicated, unsafe, or unobservable execution | Recorded |
| [better-colors](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/better-colors/SKILL.md) | specialist | Design web palettes and color tokens in OKLCH | Unconfirmed |
| [better-ui](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/better-ui/SKILL.md) | specialist | Polish UI components and visual details | Unconfirmed |
| [choose-workflow-control-model](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/choose-workflow-control-model/SKILL.md) | specialist | Choose between code, a graph, and an agent loop for one workflow | Recorded |
| [computer-use-ui-testing](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/computer-use-ui-testing/SKILL.md) | specialist | Test a user interface journey by operating the real visible app through supported Computer Use tools | Recorded |
| [design-bounded-loop](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-bounded-loop/SKILL.md) | specialist | Design or audit a feedback loop before execution | Unconfirmed |
| [design-loop](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-loop/SKILL.md) | standalone workflow | Design, style, or redesign websites and apps through investigation, layout, design-system creation, implementation, validation, and delivery | Recorded |
| [design-verification-strategy](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-verification-strategy/SKILL.md) | specialist | Plan evidence that proves a change works | Recorded |
| [explore-topic](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/explore-topic/SKILL.md) | specialist | Explore a broad topic and produce a landscape map of core ideas, vocabulary, viewpoints, open questions, and representative resources | Recorded |
| [hill-climbing](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/hill-climbing/SKILL.md) | standalone workflow | Run an explicitly requested metric-driven improvement loop | Unconfirmed |
| [identify-hill-climbing-opportunities](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/identify-hill-climbing-opportunities/SKILL.md) | specialist | Identify measurable optimization targets and editable drivers | Recorded |
| [incremental-execution](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/incremental-execution/SKILL.md) | standalone workflow | Run an explicitly requested delivery loop for one bounded local change | Recorded |
| [just](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/just/SKILL.md) | specialist | Design, inspect, debug, and maintain justfile command workflows | Recorded |
| [live-test-changes](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/live-test-changes/SKILL.md) | standalone workflow | Run and exercise a completed change in an isolated local environment | Recorded |
| [logical-compaction](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/logical-compaction/SKILL.md) | specialist | Reduce code and control-flow complexity by deliberately removing secondary capabilities while preserving a useful core | Recorded |
| [map-change-impact](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/map-change-impact/SKILL.md) | specialist | Map the affected callers, consumers, data, and operations of a proposed change | Recorded |
| [mine-transcript-learnings](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/mine-transcript-learnings/SKILL.md) | specialist | Extract recurring failures and reusable workflow lessons from local agent transcripts | Recorded |
| [model-concurrency](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/model-concurrency/SKILL.md) | specialist | Model concurrent behavior and counterexample schedules | Recorded |
| [operate-kubernetes-gitops](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/operate-kubernetes-gitops/SKILL.md) | specialist | Diagnose and repair Kubernetes workloads managed by Flux or Argo CD | Recorded |
| [pi-coding-agent](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/pi-coding-agent/SKILL.md) | specialist | Use or investigate the Pi coding agent CLI | Unconfirmed |
| [pi-sdk](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/pi-sdk/SKILL.md) | specialist | Build or debug TypeScript integrations with the Pi coding agent SDK | Unconfirmed |
| [plain-language-rewrite](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/plain-language-rewrite/SKILL.md) | specialist | Rewrite supplied text or Markdown in plain language while preserving facts, technical artifacts, structure, and the source language | Recorded |
| [plan-safe-refactor](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/plan-safe-refactor/SKILL.md) | specialist | Plan a staged refactor that preserves behavior | Recorded |
| [reproduce-bug](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/reproduce-bug/SKILL.md) | specialist | Establish a reliable reproducer for an intermittent or hard-to-trigger bug | Recorded |
| [route-agent-models](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/route-agent-models/SKILL.md) | specialist | Choose and verify an agent model route | Recorded |
| [show-me](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/show-me/SKILL.md) | specialist | Explain technical topics with concise, copyable visuals | Unconfirmed |
| [simplify-code](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/simplify-code/SKILL.md) | specialist | Simplify a bounded code target while preserving its behavior | Recorded |
| [skill-intake](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/skill-intake/SKILL.md) | specialist | Assess a rough skill idea, choose whether to create or extend a skill, and prepare an implementation handoff | Recorded |
| [sloppy-commit-push](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/sloppy-commit-push/SKILL.md) | specialist | Stages all repository changes, creates a concise Conventional Commit, and pushes the current branch | Unconfirmed |
| [style-technical-visuals](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/style-technical-visuals/SKILL.md) | specialist | Build and style technical diagrams, charts, and interactive visualizations in 2D or 3D | Recorded |
| [system-design-interview](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/system-design-interview/SKILL.md) | specialist | Coach system design interview practice, run mock interviews, and review architecture answers using scoped requirements, estimates, request flows, tradeoffs, and failure recovery | Unconfirmed |
| [trace-codepath](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/trace-codepath/SKILL.md) | specialist | Trace one execution path from an entrypoint to a requested sink | Recorded |
| [trace-data-lineage](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/trace-data-lineage/SKILL.md) | specialist | Trace a field or record from origin through transformation and storage to its consumers | Recorded |
| [trace-failure-path](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/trace-failure-path/SKILL.md) | specialist | Trace how a concrete failure propagates, is handled, and reaches its final outcome | Recorded |
| [ts-application-skeleton](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/ts-application-skeleton/SKILL.md) | specialist | Scaffold, adapt, or plan a minimal single-process Bun TypeScript application with an Effect v4 backend, TanStack Start React UI, Tailwind CSS, Oxlint, OpenRouter, Pi agents, and typed decision models | Unconfirmed |
| [typst-author](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/typst-author/SKILL.md) | specialist | Create or edit Typst documents and troubleshoot compilation | Unconfirmed |
| [uv-python](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/uv-python/SKILL.md) | specialist | Develop and troubleshoot Python projects with uv | Recorded |
| [verify-and-revise](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/verify-and-revise/SKILL.md) | standalone workflow | Revise one authorized artifact against a fixed acceptance rubric | Unconfirmed |

design-loop, hill-climbing, incremental-execution, live-test-changes and verify-and-revise are standalone workflows/loops under this definition. They may own several phases or logical producer/verifier roles, but they do not require a coordinated set of other skills or a worker fleet. ideate-orchestrator-skill and new-router-skill design orchestration artifacts; they are not runtime orchestrators themselves.

## References that are not runtime dependencies

The previous automated inventory found 22 local skills with a direct upstream name reference. That count included comparison text, navigation and examples. This revised classification reviews the actual instruction and keeps those apart from live companions.

| Skill | Reference treatment |
| --- | --- |
| [audit-resilience](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-resilience/SKILL.md) | Bounded downstream handoffs to local specialists; not invoked to produce the audit. |
| [audit-skill-catalog](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-skill-catalog/SKILL.md) | ask-matt and ideate-orchestrator-skill are discovery/design handoffs; remove the Matt navigation pointer. |
| [audit-workflow-graph](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/audit-workflow-graph/SKILL.md) | Local redesign/modeling/proof handoffs occur after the report; explicitly not invoked during the audit. |
| [choose-workflow-control-model](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/choose-workflow-control-model/SKILL.md) | Hands the completed decision to graph design or multi-agent work; not a runtime orchestrator. |
| [computer-use-ui-testing](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/computer-use-ui-testing/SKILL.md) | design-loop and live-test-changes distinguish adjacent jobs; they are not test dependencies. |
| [design-bounded-loop](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-bounded-loop/SKILL.md) | References other execution loops to distinguish scope. |
| [design-llm-evaluation-suite](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/design-llm-evaluation-suite/SKILL.md) | Adjacent-owner table is mostly navigation; the conditional route-record branch is listed above. |
| [distill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/distill/SKILL.md) | wait-what/handoff are alternative requested outputs; remove old Matt navigation. |
| [explore-topic](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/explore-topic/SKILL.md) | research/prototype/find-skills select different requested jobs; exploration can proceed directly. |
| [ideate-orchestrator-skill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/ideate-orchestrator-skill/SKILL.md) | Examples include Matt skills and other catalog skills. Those sample designs are not live dependencies; remove obsolete examples after reset. |
| [identify-hill-climbing-opportunities](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/identify-hill-climbing-opportunities/SKILL.md) | Downstream optimization/tracing/proof handoffs; discovery itself owns its analysis. |
| [incremental-execution](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/incremental-execution/SKILL.md) | Explicitly has no required companion; adjacent workflow table is navigation. |
| [live-test-changes](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/live-test-changes/SKILL.md) | Adjacent implementation/planning workflows are alternative job owners; proof is executed here. |
| [logical-compaction](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/logical-compaction/SKILL.md) | simplify-code and shape-safe-change route different scope/uncertainty; no mandatory companion. |
| [mine-transcript-learnings](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/mine-transcript-learnings/SKILL.md) | evaluate-agent-workflow/improve-agent-harness/skill-intake are alternative or future jobs; mining itself is read-only and self-contained. |
| [pr-guidelines](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/pr-guidelines/SKILL.md) | code-review is a different review output. playwright-cli is reached through the media specialist rather than directly required. |
| [prompt-kit](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/prompt-kit/SKILL.md) | research/web-design-guidelines/reconcile-documentation select adjacent jobs; preserve only navigation that survives reset. |
| [simplify-code](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/simplify-code/SKILL.md) | code-review/plan-safe-refactor/shape-safe-change/reproduce-bug route adjacent requests; bounded simplification does not compose them. |
| [skill-intake](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/skill-intake/SKILL.md) | new-plugin is the recipient of the produced handoff; writing-for-agents appears in the authoring handoff template. Intake does not run either. |
| [understand-system](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/understand-system/SKILL.md) | improve-codebase-architecture is an alternative output owner, not a system-map dependency. |
| [verify-and-revise](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/verify-and-revise/SKILL.md) | Explicitly does not invoke its nearby tdd/code-review/hill-climbing companions. Producer/verifier are logical roles and may run in one agent. |

## Your local skills that directly use Matt-origin companions

This is the narrower list to inspect if you restore local skills after removing Matt. These edges are conditional or replaceable; they do not necessarily prevent direct execution.

| Local skill | Matt-origin companion |
| --- | --- |
| [check-my-prs](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/check-my-prs/SKILL.md) | `code-review` |
| [find-and-fix](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/find-and-fix/SKILL.md) | `diagnosing-bugs` |
| [functional-decomposition](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/functional-decomposition/SKILL.md) | `codebase-design` |
| [gh-stack-companion](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/gh-stack-companion/SKILL.md) | `resolving-merge-conflicts` |
| [improve-agent-harness](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/improve-agent-harness/SKILL.md) | `writing-for-agents` |
| [improve-development-loop](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/improve-development-loop/SKILL.md) | `writing-for-agents` |
| [new-plugin](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/new-plugin/SKILL.md) | `writing-for-agents` |
| [new-router-skill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/new-router-skill/SKILL.md) | `writing-for-agents` |
| [reconcile-documentation](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/reconcile-documentation/SKILL.md) | `writing-for-agents` |
| [shape-safe-change](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/shape-safe-change/SKILL.md) | `codebase-design`, `domain-modeling` |
| [understand-system](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/understand-system/SKILL.md) | `domain-modeling` |

Transitive examples: productionize-flow -> find-and-fix -> diagnosing-bugs; incident-learning-loop -> map-production-scenario -> local tracing specialists; flow-simplification -> shape-safe-change -> codebase-design. If the entire old local stack is archived, no active old dependency graph needs to be repaired. If a skill is restored, review its selected companion branches and their transitive targets first.

## Other upstream/vendor-origin skills — separate decision

These 23 are neither Matt-origin nor established original local skills. Locally adapting an upstream skill changes maintenance ownership, not provenance. Review them separately when deciding what to import into the reset catalog. The descriptions below summarize the current local versions. “Managed vendor” means automatic synchronization still owns the skill; “Locally maintained adaptation” means it originated upstream but you now maintain its changes.

| Skill | What it does / when to use it | Original repository | Maintenance |
| --- | --- | --- | --- |
| [animate](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/animate/SKILL.md) | Implement animation for a component or transition, including timing and motion behavior. | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Locally maintained adaptation |
| [architecture-decision-record-skill](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/architecture-decision-record-skill/SKILL.md) | Document an architecture choice as an ADR: context, decision, alternatives and consequences; organize or supersede existing records. | [architecture-decision-record/architecture-decision-record](https://github.com/architecture-decision-record/architecture-decision-record) | Managed vendor |
| [define-goal](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/define-goal/SKILL.md) | Turn an explicitly requested goal into an outcome, scope and observable completion evidence. | [openai/skills](https://github.com/openai/skills) | Managed vendor |
| [diagram-design](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/diagram-design/SKILL.md) | Create styled technical diagrams and charts as HTML/SVG/PNG; import and redraw Mermaid, draw.io or Excalidraw material. | [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | Managed vendor |
| [emil-design-eng](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/emil-design-eng/SKILL.md) | Apply Emil Kowalski’s UI principles to component polish, interactions and the feel of motion. | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Locally maintained adaptation |
| [find-animation-opportunities](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/find-animation-opportunities/SKILL.md) | Identify currently unanimated UI elements where motion could improve feedback or understanding; produce proposals. | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Locally maintained adaptation |
| [find-skills](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/find-skills/SKILL.md) | Find installable agent skills for a missing capability and explain how to obtain them. | [vercel-labs/skills](https://github.com/vercel-labs/skills) | Locally maintained adaptation |
| [gh-address-comments](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/gh-address-comments/SKILL.md) | Inspect GitHub PR feedback and implement fixes for the comments the user selects or authorizes. | [openai/skills](https://github.com/openai/skills) | Locally maintained adaptation |
| [gh-fix-ci](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/gh-fix-ci/SKILL.md) | Investigate failing GitHub Actions checks, explain the cause and repair them when requested. | [openai/skills](https://github.com/openai/skills) | Locally maintained adaptation |
| [gh-stack](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/gh-stack/SKILL.md) | Operate the gh-stack CLI to create, navigate, synchronize, submit and merge dependent pull requests. | [github/gh-stack](https://github.com/github/gh-stack) | Locally maintained adaptation |
| [humanizer](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/humanizer/SKILL.md) | Rewrite prose to remove common AI writing habits while preserving meaning, evidence and the writer’s voice. | [blader/humanizer](https://github.com/blader/humanizer) | Managed vendor |
| [i-have-adhd](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/i-have-adhd/SKILL.md) | Adapt communication for ADHD: lead with the next action, number steps, restate context and reduce tangents. | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | Managed vendor |
| [improve-animations](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/improve-animations/SKILL.md) | Survey motion across a codebase and produce a prioritized improvement roadmap. | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Locally maintained adaptation |
| [pdf](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/pdf/SKILL.md) | Extract, create or review PDF content and inspect rendered pages when layout matters. | [openai/skills](https://github.com/openai/skills) | Locally maintained adaptation |
| [planetscale-mysql](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/planetscale-mysql/SKILL.md) | Design and troubleshoot MySQL/InnoDB schemas, indexes, queries, transactions, locking, migrations and replication. | [planetscale/database-skills](https://github.com/planetscale/database-skills) | Locally maintained adaptation |
| [planetscale-postgres](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/planetscale-postgres/SKILL.md) | Design and troubleshoot PostgreSQL schemas, queries, indexes, connections and database performance. | [planetscale/database-skills](https://github.com/planetscale/database-skills) | Locally maintained adaptation |
| [playwright-cli](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/playwright-cli/SKILL.md) | Drive a browser through the Playwright CLI to navigate, interact, inspect pages, capture evidence and test web behavior. | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | Managed vendor |
| [review-animations](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/review-animations/SKILL.md) | Review existing motion for usability, timing, feel, performance and accessibility. | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Locally maintained adaptation |
| [shadcn](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/shadcn/SKILL.md) | Install, compose, style and maintain shadcn/ui components, registries, presets and project configuration. | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | Locally maintained adaptation |
| [vercel-composition-patterns](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/vercel-composition-patterns/SKILL.md) | Design React component APIs using composition, shared state and compound components instead of proliferating boolean props. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Locally maintained adaptation |
| [vercel-react-best-practices](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/vercel-react-best-practices/SKILL.md) | Improve React/Next.js rendering, data fetching, server/client boundaries and bundle-loading performance. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Locally maintained adaptation |
| [vercel-react-view-transitions](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/vercel-react-view-transitions/SKILL.md) | Implement React ViewTransition motion for navigation, shared elements, Suspense reveals and state/list changes. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Locally maintained adaptation |
| [web-design-guidelines](https://github.com/wcygan/agent-skills/blob/fe444ec0b007d73cff0445db7d223a34c4cc8cd5/skills/web-design-guidelines/SKILL.md) | Review web UI against interface guidelines, including accessibility, interaction and general UX quality. | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Locally maintained adaptation |

## Repository-local publication skill — outside this catalog

[reinstall-agent-skills](/Users/wcygan/Development/agent-skills/.agents/skills/reinstall-agent-skills/SKILL.md) is outside the 116 published skills. It invokes a publication/reinstallation script and dotfiles-specific guidance. It is operational infrastructure, not a published engineering orchestrator. A reset must account for obsolete installed skills: the current publication workflow explicitly says removal cleanup requires a separate review.

## Archive-first reset sequence

1. Preserve the current catalog at an identifiable Git revision/archive, including scripts, assets, source locks and attribution. Preserve authored files with unconfirmed provenance rather than labeling them original work.
2. Establish a fresh pstack-based active catalog. Remove all 22 Matt-origin skills; old workflow output contracts do not require preservation.
3. Keep the old local orchestrators archived initially. Reintroduce a local skill only when the new baseline exposes a specific missing capability worth owning separately.
4. For each restored skill, use the sections above to inspect its actual companions, optional fallbacks, embedded provenance and tool requirements. Remove obsolete navigation instead of rebuilding the whole old dependency graph.
5. Validate the resulting active skills and publication snapshot, then deliberately clean obsolete global installations during cutover. A filesystem archive alone will not remove already installed skills.

Pstack still needs a Codex/distribution port: Cursor tool and agent conventions, model settings, external cursor-team-kit dependencies, bundled agent instruction placement, two frontmatter-name corrections, and delivery-scope handling. These are properties of the new source, independent of whether you preserve the old stack.

## Evidence and limits

Catalog: /Users/wcygan/Development/agent-skills/skills, revision fe444ec0b007d73cff0445db7d223a34c4cc8cd5. Pstack: version 0.15.24, source commit 1e5c90a4b6f249917bd21fe361b3a2a7deb741b8. The snapshot contains 116 published skills plus the separately noted publication skill.

This pass reads entrypoint instructions and relevant companion/reference files to classify roles and active named companions. Each named edge retains source-line evidence in inventory.json. Classification is structural, not a runtime dependency test: conditional branches vary by task, companions may permit direct work, and dynamically discovered skills or tool/package requirements are separate. Global installations and dotfiles consumers were not audited.

Authorship remains recorded for 49 local skills and unconfirmed for 22 repository-owned skills. All published skills appear in exactly one section, and every listed companion resolves to an existing inventory entry. The catalog remains unarchived; only these report artifacts were revised.

[Machine-readable inventory](skill-inventory.json) includes reset_classification, active companion evidence, navigation cleanup, role and authorship. reset_classification and reset_decision contain the current guidance; previous retain/carryforward recommendations have been removed.
