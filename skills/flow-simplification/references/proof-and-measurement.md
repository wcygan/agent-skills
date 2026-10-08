# Proof and measurement

Read the relevant section when coverage is missing, expectations change,
stateful effects need proof, or performance requires comparison. Record each
guarantee's scenario, expected-result source, check, environment, captured
result, and limitation against the final candidate revision.

## Preserve an independent expected result

Choose evidence that can distinguish the simpler implementation from a broken
one: unchanged contract tests, independently derived expected results, a trusted
reference, differential execution, or representative held-out scenarios.

Characterize necessary weakly specified behavior before implementation changes.
Capture outputs, errors, effects, and relevant order, not private call counts
that merely encode the old architecture. Where practical, demonstrate that the
check detects a known bad outcome. Keep one authoritative expected-result source
unchanged or independent of the rewrite.

Treat the old implementation as a reference only for behavior the contract
requires. A proven, authorized bug correction gets its own expected-result source
and failing-then-passing evidence before structural equivalence is assessed.

Map every removed or changed expectation to an authorized behavior change or
demonstrably redundant check. Retain checks for preserved behavior inside mixed
tests. Source inspection, compilation, and a jointly rewritten test suite cannot
by themselves establish unchanged outcomes.

## Check outcomes at the right boundary

Exercise the smallest boundary that exposes the guarantee. Use focused tests
for pure rules, integration checks for transactions and component effects, and
complete-flow checks when success depends on assembled execution.

For stateful flows, distinguish request acceptance, durable handoff, processing,
and terminal effects. Cover applicable rejection, partial failure, retry,
cancellation, duplicate delivery, restart, and access variants. Preserve real
ordering, transaction, cleanup, and recovery semantics when collapsing phases.
Mocked success cannot prove live persistence or distributed recovery.

Use isolated, controlled local inputs and starting state for experiments.
Record fidelity gaps when the required boundary or environment is unavailable;
qualify affected claims rather than treating a narrower check as equivalent.

## Compare performance under equivalent conditions

Select metrics material to the flow: latency, throughput, allocations, memory,
I/O, startup, or recovery cost. Establish workloads, data shape and size,
concurrency, cache state, environment, and acceptance criteria before editing.
Use existing requirements and budgets; state a justified comparison criterion
when none exists. Escalate a product tradeoff only when it changes the agreed
contract.

Measure baseline and candidate with the same harness and representative
conditions. Repeat enough to distinguish the change from noise; retain sample
counts, variability, warm-up, and material environment differences. Check
relevant input scales when a new algorithm or representation changes complexity.
Account for runtime cost shifted to another component.

Fewer lines do not establish faster execution. Passing a small-input benchmark
does not establish production capacity. Report each measured metric separately
from unmeasured performance claims. If a required budget is violated, revise or
undo the affected change; if representative proof is unavailable, mark that
acceptance gate unverified.

## Measure real reduction

Use the same production scope and counting method before and after. Count
support code added or moved outside the original files; report production,
tests, generated output, and documentation separately. State exactly what a
reported percentage measures.

Compare structural dimensions relevant to the candidate alongside code size.
Explain which phase, representation, branch, state owner, or interface ceased
to exist and how its responsibility is fulfilled. Dense syntax and relocated
code reduce visible lines without demonstrating simpler machinery.

## Acceptance examples

| Candidate | Required disposition |
|---|---|
| Several adapters repeatedly convert the same value; one authoritative representation fulfills all consumers. | Verify semantic, validation, and boundary equivalence; include changed consumers and support code in the comparison. |
| Removing retries deletes a subsystem but changes recovery guarantees. | Treat as a capability cut requiring authority and declared failure outcomes; retain unrelated core invariants. |
| A rewrite passes only tests whose expected results changed alongside it. | Obtain an unchanged oracle or independent check before claiming preserved behavior. |
| Fewer branches introduce quadratic work at representative input sizes. | Reject the candidate when it violates the performance criteria, regardless of code reduction. |
| Temporary old/new paths remain after safe stages pass. | Report partial completion until required transition cleanup and final verification are complete. |
