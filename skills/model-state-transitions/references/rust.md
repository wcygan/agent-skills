# Rust: enum state and owned protocols

Use an enum when a value's state is discovered at runtime, persisted, rendered,
or changed by asynchronous events. Put the data required by a state inside that
variant. Use exhaustive matches rather than a wildcard so new variants expose
missing decisions during compilation.

The runnable [search example](search.rs) owns its current state and monotonically
allocates request IDs. A new search replaces the previous search; cancellation
clears results; only a completion matching the active request can change state.
IDs distinguish repeated searches with identical queries. The explicit policy
for other completions is to ignore them, including duplicate completions.

From the repository root:

```sh
example_output=$(mktemp -d)
rustc --edition=2021 --test skills/model-state-transitions/references/search.rs -o "$example_output/search-tests"
"$example_output/search-tests"
rm -rf "$example_output"
```

The tests exercise replacement, cancellation, restart, late success, late failure,
and failure of the current request. The owner's `apply` method returns effect
descriptions. An adapter executes fetches/aborts and turns their outcomes into
events. Abort is best effort: request identity preserves correctness even if it
does not stop the underlying work. A single owner must serialize calls to `apply`.

## When typestate is a better fit

Use typestate when the main rule concerns which operations are available after
an earlier operation. A consuming method can move a resource into a different
type; private fields prevent callers from constructing the later state directly:

```rust
mod protocol {
    pub struct Draft { text: String }
    pub struct Submitted { text: String }

    impl Draft {
        pub fn new(text: String) -> Self { Self { text } }
        pub fn submit(self) -> Submitted { Submitted { text: self.text } }
    }
    impl Submitted {
        pub fn text(&self) -> &str { &self.text }
    }
}
let draft = protocol::Draft::new("hello".into());
let submitted = draft.submit();
assert_eq!(submitted.text(), "hello");
// draft.submit(); // Compile error: draft was moved.
```

This proves consumption of this value, not delivery to an external service.
Real submission needs an explicit failure result and a decision about retaining
the draft. Avoid `Clone` when duplicating a capability would defeat its protocol.
Typestate can complicate heterogeneous collections and runtime-selected states;
an enum is often simpler there.

## Boundaries and limits

- An enum makes invalid payload combinations unavailable through ordinary safe
  construction; it does not restrict every valid state-to-state assignment.
  Keep constructors and mutation behind the owner when transition history matters.
- Deserialize and validate external data before creating domain state. Rust types
  alone do not establish business predicates, authorization, or trustworthy IDs.
- The example's IDs are local to one owner lifetime; exhaustion fails explicitly.
  Persist identity or add an epoch if replies can cross restarts or owner instances.
- Effect execution, timeouts, retries, crash recovery, and eventual completion
  require separate policies and verification. These tests establish selected
  traces, not every temporal or distributed property.

Primary references: [Rust enums](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html),
[exhaustive matches](https://doc.rust-lang.org/book/ch06-02-match.html),
[ownership](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html), and
[typestate programming](https://doc.rust-lang.org/stable/embedded-book/static-guarantees/typestate-programming.html).
