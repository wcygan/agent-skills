# Worked example: document import

Use to apply decomposition to a pipeline with format interpretation, domain
validation, and persistence. This is an original design exercise. Pseudocode
omits language-specific error and resource syntax; it is not a production parser.

## Requirements and assumptions

Import a bounded UTF-8 CSV file of customer records. Each row has an external
customer ID, display name, and email address. The exact email-validity policy is
supplied by the application; the example does not invent one.

- Quoting and embedded newlines follow the chosen CSV dialect.
- Invalid domain records are reported and skipped.
- Syntax errors prevent committing the file; parsing finishes before writes.
- Accepted records commit independently after parsing succeeds.
- Identity is `(sourceSystem, externalCustomerId)`.
- Repeating the same identity and canonical payload returns the established result;
  a different payload for that identity is reported as a conflict.
- Storage unavailability stops further writes. Earlier commits remain.
- The caller retains the input so it can retry; crash-resumable progress is not
  part of this version.

These assumptions deliberately separate syntax failure, domain rejection, and
partial persistence. A different import policy can require a different structure.

## Initial implementation

Imagine one loop that splits lines on commas, checks fields, queries for an
existing customer, inserts a row, and increments counters. Extracting those five
steps into public classes would preserve several problems:

- Physical lines are not necessarily CSV records.
- A prior existence check does not protect against another writer.
- A counter increment cannot establish whether a timed-out write committed.
- Database columns may leak into validation if all steps share one mutable map.

These are observations about the illustrative implementation. In real code,
confirm the actual parser, consistency mechanism, and contract before changing it.

## Proposed responsibilities

| Owner | Contract | Private decisions |
|---|---|---|
| Format reader | Bytes to source records or syntax failure | Encoding, dialect, source positions |
| Customer rules | Source fields to canonical valid customer or rejection | Field normalization and domain validity |
| Customer store | Identity/payload to created, existing, conflict, or unavailable | Constraints, transaction, provider errors |
| Import coordinator | Input to summary or partial/uncertain outcome | Continuation and failure-report policy |

Source records carry locations for diagnostics. Canonical customer values carry
domain fields, not database handles or CSV parser offsets. The coordinator keeps
source provenance beside them for reporting.

## Candidate implementation shape

```text
importCustomers(sourceSystem, bytes):
    records = reader.parseAll(bytes)
    if syntax failure: return InvalidFile(details)

    summary = emptySummary()
    for sourceRecord in records:
        result = rules.interpretAndValidate(sourceRecord.fields)
        if rejected:
            summary.addRejection(sourceRecord.location, result.reason)
            continue

        identity = (sourceSystem, result.customer.externalId)
        outcome = store.createOrMatch(identity, result.customer)
        if unavailable:
            return Interrupted(summary, sourceRecord.location,
                               outcome.commitKnowledge)
        summary.add(sourceRecord.location, outcome)
    return Completed(summary)
```

`createOrMatch` must atomically enforce identity uniqueness and compare the
canonical payload according to the contract. A caller-level lookup followed by
an unconditional insert is insufficient. A concrete implementation must resolve
the actual database semantics and race handling.

If a reply is lost, the interrupted row may have committed. Retrying identical
input can discover `Existing`; the summary must not promise exact per-attempt
creation counts that cannot be reconstructed. Report established outcomes and
uncertainty explicitly.

## Compare alternatives

**Private functions in one module** may be sufficient for a single small importer.
**Separate reader/rules/store modules** become useful when different formats reuse
customer rules or when persistence details already have an independent owner.
Both can implement the same responsibility map.

A **generic plugin pipeline** is unjustified by these requirements alone. It
would introduce stage registration, shared context conventions, and extension
contracts without a demonstrated caller needing them.

## Exercise changes

| Change | Expected owner | Additional question |
|---|---|---|
| Support quoted commas correctly | Reader | Does the parser preserve source positions? |
| Change display-name normalization | Rules | Does canonical payload equality change? |
| Move to another database | Store | Are conflict and uncertain-outcome semantics preserved? |
| Add JSON input | Another reader | Can both produce the same source-field contract? |
| Make the entire import atomic | Coordinator and store | Staging, limits, and rollback behavior change |

Normalization illustrates a real cross-boundary consequence: if canonical equality
changes, old stored values may require compatibility handling. Information hiding
does not make a changed domain contract local by definition.

## Verification plan

Use fixtures for quoted delimiters, embedded newlines, invalid encoding, and a
syntax failure late in the file; the last case must leave storage unchanged.
Check domain rejection without writes, repeated identical identities, conflicting
payloads, and concurrent inserts for the same identity. Inject a failure after a
commit but before acknowledgment and check safe retry plus honest reporting.

Check the coordinator with a small known fixture end to end. Keep store integration
tests for guarantees a fake cannot establish. These are proposed checks for this
example, not claims that a production implementation has been tested.

## Documentation connection

This example applies [information hiding](information-hiding.md),
[orchestration and dataflow](orchestration-and-dataflow.md), and
[contracts and interfaces](contracts-and-interfaces.md).
[PostgreSQL's transaction documentation](https://www.postgresql.org/docs/18/transaction-iso.html)
is one concrete reference for resolving isolation and conflicting-write behavior;
verify the deployed engine before choosing SQL.
