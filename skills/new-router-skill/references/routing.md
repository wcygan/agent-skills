# Routing

How a router skill is shaped: when it earns its shape, what a routing map is,
and how the body is laid out so the route fires reliably.

## When a router earns its shape

A router is the right pattern when classification is the hard part and one
specialist should own the work. Compare the candidates before committing:

| Pattern | Job | Choose when |
| --- | --- | --- |
| Router | select one owner | branches are distinct and one specialist handles each |
| Orchestrator | combine specialists | several specialists contribute to one end result |
| Decision framework | record a choice | the durable value is the rubric, not the downstream work |
| Script | run a deterministic flow | no agent judgment is needed |
| Extend an existing skill | reuse an owner | trigger, output, and authority already match one skill |

Use `ideate-orchestrator-skill` when that choice needs exploration. A supplied blueprint or a clear set of distinct routes is enough to proceed directly.

## The routing map

The routing map is the router's core: a table of branches, predicates, and
owners.

- **Branch** — a distinct case an agent can arrive with. One trigger per
  branch; synonyms that rename one branch are one branch.
- **Predicate** — the observable condition that selects the owner. It must be
  checkable from the agent's context, without reading the owner's body.
- **Owner** — the one skill that handles the branch. One owner per branch; no
  overlapping routes.

Every branch needs all three. A branch with no owner routes nowhere — cut it.
Two branches with the same owner and no distinguishing predicate are one
branch.

## Activation — the description is the pointer

The description states the capability and distinguishing trigger early. Put the full branch map in the body; include a branch in the description only when it materially distinguishes activation from a nearby skill.

## Body layout for a router

- Keep purpose, route predicates, essential knowledge, completion, and authority in `SKILL.md`.
- Route-specific detail lives in `references/`, one level deep, reached by
  relative paths.
- State the evidence needed to select a route and finish the requested work. Specify order only where decisions depend on earlier results.
- Define fallback behavior for unavailable owners: use available capabilities when sufficient; otherwise identify the missing evidence or capability and continue independent work.

## Avoid the playlist trap

A router that merely lists skills in order is a playlist, not a route: it has
no predicates and no single owner per branch. If two routes overlap or a
branch has no predicate, the map is unfinished — fix the map before composing
the body, and say so rather than shipping a shallow list.
