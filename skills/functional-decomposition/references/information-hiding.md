# Information hiding

Use when deciding which responsibilities a module should own or when a local
change repeatedly requires editing its callers.

## Source basis

[Parnas's 1972 paper](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html)
contrasts two decompositions of a keyword-in-context index. One follows processing
stages sharing representations; another gives modules ownership of decisions
such as line storage. A storage change then has a narrower impact. The important
criterion is which knowledge is hidden, not how many routines are produced.

## Build a decision inventory

List the design choices currently known in more than one place. For each, ask:

| Question | Evidence to inspect |
|---|---|
| Who needs the result? | Callers and their actual operations |
| Who needs the representation? | Field access, casts, parsing, serialization |
| Who could own the choice? | Existing responsibility and lifecycle |
| What could change? | Requirements, history, supported variants |
| What must remain observable? | Compatibility, correctness, performance contract |

Possible private decisions include an encoding, indexing algorithm, cache layout,
vendor protocol, or policy calculation. Avoid declaring every imaginable future
variation a reason for an interface. Identify a current complexity or credible
change the boundary would contain.

## Example: document lookup

Suppose callers find a document by decoding a stored path:

```text
segments = record.storagePath.split("/")
bucket = segments[0]
objectKey = join(segments[1:])
bytes = objectClient.read(bucket, objectKey)
```

A candidate operation is:

```text
documentContent.read(documentId) -> Content | Missing | Unavailable
```

Its implementation owns location resolution and provider translation. Callers
know the document identity and required content, not the path layout. This is
useful only if the contract also answers relevant questions: does `Content`
stream, who closes it, and can a failure occur after reading begins?

If the caller needs a provider-specific object operation, hiding it behind
`read` would misrepresent the need. Either expose a truthful domain operation or
keep that integration caller explicitly provider-aware. Abstraction must preserve
necessary capabilities.

## Find leaks beyond fields

- Callers choose retries based on raw provider error strings.
- A caller must call `prepare`, mutate an internal list, and then call `finish`.
- Several modules reconstruct the same identity or rounding convention.
- An internal ordering is documented as permanent despite no caller needing it.
- A shared context exposes internal handles to unrelated participants.

For each leak, decide whether the information is accidental or part of a genuine
contract. A streaming lifetime, authorization context, or latency limit may be
essential; hiding its existence makes the interface less truthful.

## Boundary check

Mentally replace one internal decision while holding observable behavior fixed.
Name every caller change required. If callers still need the representation, the
proposed boundary may only relocate code. If the interface needs many configuration
switches to cover speculative replacements, specialize it to demonstrated needs.

This check is a design thought experiment, not a requirement to implement a second
backend. Use the result to explain what is actually isolated and what remains
coupled.
