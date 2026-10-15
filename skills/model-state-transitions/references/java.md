# Java 21: state variants and asynchronous results

Use sealed interfaces for a closed family of states and records for each state's
required payload. [Search.java](Search.java) is a standalone Java 21 example;
it uses no preview features or dependencies.

`Loading` requires a request identity and query; `Ready` requires results;
`Failed` requires an explanation. An idle state cannot accidentally carry a
failure payload. Compact constructors reject null or invalid payloads and copy
result lists. Java reference types still admit null at compile time: these
constructor checks are runtime boundary validation, not a nullability proof.
Parse external JSON into these constructors through the application's boundary
adapter; records do not validate arbitrary deserialized data by themselves.

`transition` is pure: it returns the next state and descriptions of effects.
The owner commits that state before passing `Fetch`/`Abort` to an adapter. The
adapter performs I/O and delivers `Succeeded` or `Rejected` carrying the original
request ID. Allocate a fresh ID for every logical search, including replacement
searches; never reuse an ID while an old completion could still arrive.

Replacement transitions request aborting old work and starting new work. Cancellation leaves
`Loading`; completions are accepted only for the active request. Abort is best
effort: ignoring an obsolete result does not undo remote work. This policy is
appropriate for search; operations with external writes need explicit receipt,
idempotency, and reconciliation policies.

Both event dispatch and state rendering use exhaustive switches without
`default`. Adding a permitted event or state forces its switch to be updated at
compile time. The compiler checks coverage, not business correctness or the
truth of the request-ID guard. State/event combinations intentionally ignored
here remain unchanged; a different domain may need an explicit rejection.

Run from the repository root with a JDK 21 or later:

```sh
example_output=$(mktemp -d)
javac --release 21 -d "$example_output" skills/model-state-transitions/references/Search.java
java -cp "$example_output" Search
rm -rf "$example_output"
```

The executable checks success, failure, duplicate completion, replacement,
cancellation, late completion, and invalid payload construction. Checks throw
explicitly, so `-ea` is unnecessary. Expected output:
`Search behavior checks passed`.

One owner must serialize calls against its current state. Immutable records and
exhaustive switches do not prevent two owners from committing conflicting
updates to shared storage. Use the authoritative store's conditional write or
transaction when that race exists. Saved records also require schema-version
validation/migration when their shape changes across deployments.

Official language references:

- [Sealed classes and interfaces](https://docs.oracle.com/en/java/javase/21/language/sealed-classes-and-interfaces.html)
- [Record classes and compact constructors](https://docs.oracle.com/en/java/javase/21/language/records.html)
- [Pattern matching for switch: exhaustiveness and null](https://docs.oracle.com/en/java/javase/21/language/pattern-matching-switch.html)
