# Type System Discipline

Apply when designing types, reviewing a function signature, or writing code in any statically-typed language. Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, refuse to lie to the compiler, exhaust variants, derive from authoritative schemas.

Make the compiler reject impossible states, mismatched primitives, and unhandled variants, using the language's own idioms.

- **Make illegal states unrepresentable.** Model variants as sum types, not a bag of optional fields where contradictory combinations compile.
- **Brand semantic primitives.** If two arguments share a primitive type but mean different things, give each its own type. Validate once at creation.
- **External data is untyped until parsed.** JSON, RPC payloads, CLI args, config, environment variables, and database rows go through a parse function at the boundary that returns the typed model.
- **Don't lie to the compiler.** Trace each cast or unchecked assertion to the boundary and validate there.
- **Exhaust variants.** A match on a sum type must fail compilation when a new variant is added without a case.
- **Derive types from authoritative schemas.** When a schema file owns a shape, derive the type from it instead of hand-rolling a parallel one.

Strengthen a type only where a runtime check or "should never happen" throw shows it is too weak, then stop.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-type-system-discipline). [MIT license](../LICENSE.txt).
