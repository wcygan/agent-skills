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

The full decision belongs to `ideate-orchestrator-skill` (a read-only brief);
this file is the implementation lens on top of it. When the request is still
an idea, run that brief first and scaffold from its blueprint.

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

The agent reaches the router from its description. The description
front-loads the leading word, lists the branches that should trigger it, and
states what the router returns. It earns pruning like any always-loaded line:
one trigger per branch, no identity the body already carries.

## Body layout for a router

- Keep `SKILL.md` small: the map and the steps only.
- Route-specific detail lives in `references/`, one level deep, reached by
  relative paths.
- Every step ends on a completion criterion that is checkable and exhaustive.

## Avoid the playlist trap

A router that merely lists skills in order is a playlist, not a route: it has
no predicates and no single owner per branch. If two routes overlap or a
branch has no predicate, the map is unfinished — fix the map before composing
the body, and say so rather than shipping a shallow list.
