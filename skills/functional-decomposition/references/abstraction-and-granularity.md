# Abstraction and granularity

Use when deciding whether a responsibility should be an expression, a helper, a
private abstraction, a public module, or a separate package.

## Source basis

[Ousterhout's design notes](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring15/lecture.php?topic=complexity)
favor substantial functionality behind a manageable interface and flag chains of
similar interfaces. The following extraction criteria are synthesis. Function
length, file count, and the number of methods are not acceptance thresholds.

## Choose the boundary's audience

| Form | Useful contribution | Typical obligation |
|---|---|---|
| Named expression | Makes a local condition legible | Meaningful name |
| Private helper | Explains a subproblem or shares one local rule | Explicit inputs and clear control flow |
| Private data abstraction | Protects an internal representation | Invariant-preserving operations |
| Public module | Provides a capability to independent callers | Stable behavioral contract |
| Package | Owns distribution or a substantial dependency boundary | Compatibility and dependency management |

The forms are not a maturity ladder. A private helper may remain the best choice
for the lifetime of a system. A public interface creates obligations even if its
implementation is only a few lines.

## Example: a useful extraction

```text
if paidAt is absent and now >= dueAt and not disputed:
    ...
```

If this means "eligible for late notice" and the rule appears in several real
paths, a predicate named for that meaning can clarify ownership. Give it the
required facts, not an entire application context. If the condition occurs once
and is already obvious beside its action, a local name may be enough.

Now consider `getDueDate`, `getCurrentTime`, `compareDates`, `isNotDisputed`, and
`combineBooleans` as separate public helpers. The reader may have to assemble the
same rule across five files while learning additional contracts. Combining these
operations inside the policy can improve both readability and change locality.

## Evaluate an extraction's complete cost

Ask what becomes simpler for callers and what becomes harder for implementers.
Include conversion types, callback protocols, dependency injection setup, error
translation, and test construction. Reduced indentation is a benefit only if the
new data and control relationships remain easier to understand.

One useful thought experiment is to inline a wrapper mentally. What knowledge or
behavior would move into its caller? If little changes, inspect whether the
wrapper serves another concrete role before removing it: compatibility,
authorization, tracing, protocol translation, or a replaceable dependency.

Thin adapters can be valuable because crossing a real protocol boundary is their
responsibility. A wrapper's short body is neither proof of waste nor proof of a
good abstraction.

## Generalize from evidence

Use existing variants to identify common meaning. Two syntactically similar
rules that change independently may deserve separate implementations. A single
implementation can still justify an interface that hides substantial complexity;
two interchangeable implementations are not a prerequisite for abstraction.

For uncertain future variants, keep the implementation easy to change instead of
adding speculative strategy registries and boolean switches. Explain the specific
variation before adding a mechanism to support it.

## Stopping point

Stop splitting when the part has a coherent explanation, its contract supports
local reasoning, and further extraction adds more concepts than it hides. If a
large part remains difficult, first identify its competing responsibilities or
intertwined state rather than applying a line-count rule.

Read [Overdecomposition](example-overdecomposition.md) for a worked simplification
that preserves a useful adapter while removing forwarding layers.
