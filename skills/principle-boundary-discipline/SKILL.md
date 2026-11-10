---
name: principle-boundary-discipline
description: "Apply when wiring validation, error handling, or framework adapters. Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-boundary-discipline
  upstream-author: Lauren Tan
  maintenance: local
---

# Boundary Discipline

**Trigger:** you are wiring validation, error handling, or a framework adapter.

**Rule:** place validation, type narrowing, and error handling at system boundaries. Inside the system, trust the types. Keep business logic in pure functions; keep the shell thin and mechanical.

**Why:** scattered validation is noisy and redundant, and it gives a false sense of safety because no one check is the one that must be right. Logic kept out of framework wiring can be tested without the framework.

**What counts as a boundary:** anywhere data enters the process from something you do not control: CLI arguments, config files, environment variables, network requests, external APIs, files on disk, a database row. Data re-entering from a cache, a queue, a message bus, or another service is a boundary again, even if your own code wrote it: another version, another writer, or corruption may have changed it since.

**What "trust internal code" means:** inside one process, once data has been parsed into domain types at a boundary, do not re-check it. A function that takes a `UserId` does not check that the id is well formed; the parser did. That trust holds only within the same process and only for data that already passed through a boundary parser. It does not extend across the exceptions above.

**The pattern:**
- **At boundaries:** validate, parse into domain types, return errors, handle defensively.
- **Inside the system:** typed data, error propagation, no re-validation.
- **Across the boundary:** expose domain concepts, not the boundary's private representation. Keep general-purpose mechanism inside and special-purpose policy at the edge.

**Applications:**

Validation and error handling:
- Validate config at parse time, not inside business logic.
- Parse raw data into domain types at the boundary; downstream code takes the domain type.
- Do not re-export transport, storage, framework, or wire types through the public surface.
- No redundant nil checks deep in call chains if the boundary already validated. A guard there hides a bug in the parser instead of surfacing it.

Code organization:
- Business logic in pure functions with no framework dependencies.
- Parse functions: pure transforms from raw bytes or strings to typed state.
- Rendering and formatting: structured state in, string or bytes out.
- Decisions and calculations (pricing, scheduling, ranking): pure transforms from typed state to typed results.
- The HTTP handler, CLI command, or job runner only parses input, calls the pure function, and formats the result.

**The tests:**
- "Is this data crossing a system boundary right now?" If not, validation here is redundant; if yes, validation belongs here and nowhere deeper.
- "Can this be a pure function that the shell just calls?" If yes, extract it.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
