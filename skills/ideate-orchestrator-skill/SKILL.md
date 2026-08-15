---
name: ideate-orchestrator-skill
description: Ideate and structure higher-order agent skills that compose existing skills as orchestrators, routers, or decision frameworks. Use when designing a reusable workflow skill from several specialist skills, deciding whether composition is warranted, defining routing and authority boundaries, or documenting phase contracts and examples before implementation; produce a read-only composition brief and skill blueprint, not the child skills themselves.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Ideate Orchestrator Skill

Design a higher-order skill without creating or editing it. Treat composition as
an explicit protocol between independently owned skills, not as filesystem
inclusion.

## Keep the pass read-only

- Inspect skill descriptions and instructions when available.
- Analyze overlaps, routing predicates, phase boundaries, and outputs.
- Return a composition decision and an implementation-ready blueprint.
- Do not create, modify, install, or publish skills.
- Do not invoke a child skill's mutating workflow merely to evaluate the design.
- Keep this ideation pass read-only even when the proposed runtime skill would
  have broader authority; describe that future authority instead of exercising
  it.
- If the user later requests implementation, hand the blueprint to the
  repository's skill-authoring workflow as a separate task.

## Decide whether composition is warranted

Create a higher-order skill only when it owns one recurring job that is clearer
than its ingredients. Require all of these:

1. A recognizable trigger or family of closely related triggers.
2. An integrated output that no single companion already owns.
3. Meaningful sequencing, routing, reconciliation, or authority decisions.
4. A stable boundary that will survive changes to individual companions.

Reject a proposed composition when it is only a playlist. Prefer:

- extending an existing skill when the trigger, output, and authority are
  substantially the same;
- a router when exactly one specialist should own the request;
- a decision framework when the reusable value is a choice or rubric;
- a script when the workflow is deterministic and mechanical;
- documentation when no agent judgment or reusable procedure is needed;
- a one-off plan when the workflow is unlikely to recur.

## Choose one primary pattern

### Orchestrator

Use an orchestrator when several specialists must contribute to one end-to-end
result.

The orchestrator must:

- own the integrated output and stopping condition;
- define required and conditional companions;
- pass explicit artifacts between phases;
- state completion criteria for every phase;
- reconcile conflicts and duplicate findings;
- preserve the strictest applicable authority boundary;
- define what happens when a required companion is unavailable.

### Router

Use a router when classification is the hard part and one specialist should own
the work. The router returns the selected skill, the evidence for that choice,
and any missing input. It stops after routing and does not merge specialist
outputs.

### Decision framework

Use a decision framework when the durable value is a rubric or decision tree.
It gathers evidence, applies named criteria, records the decision, and may
recommend a next skill. Its primary output is the decision record, not the
downstream work.

Hybrids are allowed only when one pattern remains primary. For example, an
orchestrator may contain conditional routing between phases, but it still owns
one integrated result.

## Model composition as contracts

For every proposed companion, record:

| Contract | Required question |
|---|---|
| Role | What unique responsibility does this companion own? |
| Predicate | Is it always required, or exactly when is it selected? |
| Input | What bounded artifact does it receive? |
| Output | What bounded artifact must it return? |
| Completion | What proves this phase is done? |
| Authority | What may it inspect or mutate? |
| Route | Which role, context fork, tools, and effective model route does an agent companion require? |
| Failure | How does the parent behave if it is unavailable or inconclusive? |

Then define the parent contract:

- trigger and explicit non-triggers;
- integrated output and intended consumer;
- phase order and legal branches;
- conflict-resolution rule;
- authority ceiling and mutation gates;
- route selection, inheritance, fallback, and child-spawn policy;
- stop condition and handoff boundary;
- portability and missing-companion behavior.

The parent may narrow a child's authority but never broaden it. A read-only
parent remains read-only even if a child can implement changes in other uses.
An agent route cannot add tools, permissions, credentials, or external effects.
Model inspection, command execution, temporary or ignored artifacts, durable
file writes, and external mutations separately. A child's mutating prerequisite
also counts as mutation: supply a non-mutating alternative, require the needed
input directly, or stop rather than invoking it implicitly.

## Keep compositions portable

Agent Skills do not provide a dependency manifest. Design accordingly:

- Refer to companion skills by their exact installed names.
- Use `route-agent-models` when an agent companion can inherit, override, or
  specialize its model route.
- Do not reference sibling paths such as `../other-skill/SKILL.md`.
- Do not copy companion instructions into the parent.
- State whether companions are required, optional, or replaceable.
- Detect missing required companions and stop with an actionable message.
- When a client cannot enumerate installed skills, state that limitation and
  treat availability as unknown until the named companion returns its required
  artifact; do not claim that it is installed or missing without evidence.
- Allow an explicit degraded mode only when its output remains truthful.
- State collection-install assumptions when the composition depends on a
  catalog being installed together.
- Keep client-specific invocation metadata out unless the target repository
  explicitly requires it.

Embedding is therefore semantic: the higher-order skill names a companion,
defines when it participates, and specifies the artifact contract across that
boundary.

## Workflow

1. **Frame the job.** Rewrite the idea as one trigger-to-output transformation.
   List non-goals and the authority ceiling.
2. **Inventory ownership.** Search the current repository and available
   installed catalog for skills that already own parts of the job. Search the
   broader ecosystem only when requested or when a read-only discovery skill is
   available. Record the search boundary and note overlap before inventing a
   new name.
3. **Select the primary pattern.** Choose orchestrator, router, or decision
   framework. Record any secondary mechanics and explain why the other patterns
   are secondary or unsuitable.
4. **Define companion contracts.** Separate always-required companions from
   conditional ones. Give every conditional edge a concrete predicate. Require
   a Route Record for each selectable agent route.
5. **Design artifact flow.** Specify phase inputs, outputs, completion criteria,
   reconciliation, and the integrated final artifact.
6. **Audit authority and portability.** Preserve read-only boundaries, add
   mutation gates, and define missing-companion behavior without sibling paths.
7. **Test the idea with counterexamples.** Check whether one existing skill can
   already do the job, two routes overlap, a branch has no predicate, or the
   output is merely concatenated child reports.
8. **Return the brief.** Produce the format below and stop before implementation.

## Output format

```markdown
## Composition decision

- Proposed name:
- Primary pattern:
- Secondary mechanics:
- Disposition: create new skill | extend existing skill | create router | document | script | one-off | defer
- Recurring job:
- Trigger:
- Non-triggers:
- Integrated output:
- Ideation authority: read-only
- Proposed runtime authority:
- Overlap search boundary:
- Why this is not a playlist:

## Composition map

| Companion | Role | Predicate | Input | Output | Completion | Authority | Route / context | Missing behavior |
|---|---|---|---|---|---|---|---|---|

## Phase sequence

| Phase | Owner | Entry condition | Artifact produced | Completion criterion | Next |
|---|---|---|---|---|---|

## Parent contract

- Reconciliation rule:
- Stop condition:
- Handoff boundary:
- Portability/install assumption:
- Degraded mode:
- Route inheritance and fallback:
- Child-spawn policy:

## Skill blueprint

- Suggested description:
- Required sections:
- Reference files, if any:
- Acceptance examples:
- Counterexamples:

## Risks and open decisions
```

Load `references/patterns-and-examples.md` when comparing patterns or grounding
the brief in worked examples.
