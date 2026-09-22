# Decisions and effects

Use when domain calculations are difficult to understand or test because they
also read clocks, fetch data, mutate storage, or call external systems.

## Source basis

[Gary Bernhardt's functional core/imperative shell explanation](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)
places computation over values in a core and external interactions in a shell.
It is practitioner guidance. The examples and constraints below are engineering
applications; they do not imply every system can be reduced to one read and write.

## Find the calculation

Inventory the information used by a decision, including hidden inputs such as
current time, randomness, configuration, and mutable global state. Then separate
the decision from obtaining its facts and applying its result when doing so makes
the contract clearer.

```text
facts = loadFacts(request)
decision = decide(request, facts, explicitTime)
outcome = apply(decision)
```

The core should return enough information to explain the decision. Avoid creating
a general command language merely to return a result that a small domain type
could express.

## Example: deciding whether to remind a customer

Assumptions: a reminder is eligible after a deadline if the invoice is unpaid and
no reminder of this kind has been recorded. Selection uses a specified instant.

```text
decideReminder(invoiceSnapshot, now)
    if invoiceSnapshot.paid: return Skip("paid")
    if now < invoiceSnapshot.deadline: return Skip("not due")
    if invoiceSnapshot.reminderRecorded: return Skip("already recorded")
    return RequestReminder(invoiceSnapshot.id, invoiceSnapshot.version)
```

This calculation can be tested with ordinary values. But `RequestReminder` is a
proposal based on a snapshot. Between selection and application, another worker
may record the reminder or a payment may arrive.

Choose the actual business contract: eligibility at selection time, or eligibility
rechecked when the reminder is committed. For the latter, the application step
must validate relevant state under appropriate isolation or a version check. The
calculation's purity does not solve this race.

## Own the external outcome

Recording intent and delivering a message are different effects. If delivery must
survive process failure, an implementation might record intent transactionally
and deliver it separately. Such a design must state how duplicate delivery,
acknowledgment loss, and retries are handled. A transaction in the local database
does not include an unrelated external service.

This is an example of a boundary requiring more design, not a directive to add an
outbox to every application. A local report generator may simply return the
chosen reminders without sending anything.

## Where the simple shape stops fitting

- Streaming inputs may require incremental state and decisions.
- Interactive protocols need repeated observation and action.
- Very large facts may be expensive to materialize before calculation.
- Transactions may require calculation near the protected state.
- Effects can reveal new facts necessary for the next decision.

In these cases, isolate coherent calculations within the loop while leaving the
protocol explicit. Prefer understandable coordination over forcing every effect
through a generic interpreter.

## Verification and documentation

Test exact deadline behavior and each decision outcome. Separately test the
application step's version conflict and retry handling. Use integration evidence
for actual transactional guarantees.

[PostgreSQL's isolation documentation](https://www.postgresql.org/docs/18/transaction-iso.html)
illustrates why a transaction's isolation level and whole-transaction retry
behavior matter. It is evidence about PostgreSQL, not a guarantee for all stores.

Record where a decision's facts are valid, where they are revalidated, and which
part owns a partially completed effect.
