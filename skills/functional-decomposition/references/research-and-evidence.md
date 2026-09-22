# Research and evidence

Use this reference to justify a design principle, check its evidence, or extend
the research. Sources were checked on 2026-09-22. Dates below are publication
dates where known, not search-engine crawl dates. Links provide originals or
institutional copies; this skill does not redistribute their full text.

## How to interpret this collection

- **Foundational argument:** a design method demonstrated through reasoning and
  examples. Useful guidance, not a measured causal effect on maintenance cost.
- **Formal result:** a claim proved under a stated model and assumptions.
- **Empirical study:** observations within particular systems, measures, and tasks.
- **Practitioner guidance:** an author's method or teaching based on experience.
- **Official documentation:** authoritative behavior of a particular implementation.
- **Engineering synthesis:** this skill's checklists, examples, and applications.

Examples throughout the skill are original illustrations. They are not experiments
reported by the cited authors. Most operational guidance is engineering synthesis;
each source note identifies the narrower idea it supports.

## Annotated sources

### Wirth — Program Development by Stepwise Refinement (1971)

[Institutional PDF](https://john.cs.olemiss.edu/~hcc/csci658/notes/localcopy/WirthStepwiseRefinement.pdf).
Foundational research; free; intermediate, with older programming notation.
Supports developing algorithms and data representations through explicit
refinement decisions. Read for the reasoning process behind an implementation.
The small worked problem does not establish a universal architecture method.

### Parnas — On the Criteria To Be Used in Decomposing Systems into Modules (1972)

[Institutional transcription](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html).
Foundational research; free; accessible to working programmers. Supports hiding
design decisions and comparing boundaries through likely changes. The indexing
example is especially useful. The host warns that the transcription may contain
errors. Its example-based argument is not a controlled productivity study.

### Cornell CS3110 — Abstraction Functions and Representation Invariants (2009)

[Course notes](https://www.cs.cornell.edu/courses/cs3110/2009fa/Lectures/lec08.html).
University teaching material; free; intermediate. Explains the relationship
between internal representations, abstract values, and validity conditions.
Useful for state ownership and modular correctness. Primarily sequential
reasoning; concurrent behavior requires additional assumptions.

### Ousterhout — Managing Complexity, Stanford CS190 (2015)

[Author's lecture notes](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring15/lecture.php?topic=complexity).
Practitioner teaching; free; accessible. Supports comparing interface complexity
with the functionality hidden behind it. Useful for evaluating abstraction cost.
The notes include author heuristics, not universal empirical thresholds. This
skill does not adopt their class-size suggestions as rules.

### Bernhardt — Functional Core, Imperative Shell (2012)

[Author's explanation and screencast page](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell).
Practitioner demonstration; explanation freely readable; intermediate. Describes
placing computation in a functional core and external interactions in a shell.
Useful for effect boundaries and test setup. The older Ruby example is conceptual
guidance, not a requirement to adopt its language or tooling.

### Paixão, Harman, Zhang, and Yu — An Empirical Study of Cohesion and Coupling: Balancing Optimisation and Disruption (2018)

[UCL record and open accepted manuscript](https://discovery.ucl.ac.uk/id/eprint/1576532/).
Empirical research; free manuscript; advanced. The abstract reports 233 releases
from 10 systems and substantial disruption when optimizing structural measures.
Useful when balancing restructuring against its migration cost. Those measures
are not direct measurements of every team's maintainability or developer effort.
Do not convert reported metric improvements into promised productivity gains.
This skill uses the study's reported high-level results, not an independent
replication of its experiments.

### Herlihy and Wing — Linearizability: A Correctness Condition for Concurrent Objects (1990)

[Author-hosted PDF](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf).
Formal research; free; advanced. Linearizability relates concurrent operations to
legal sequential behavior while respecting the order of nonoverlapping calls.
Useful for specifying atomic component operations. It does not make an arbitrary
sequence of individually linearizable calls into one atomic transaction, or by
itself guarantee progress, durability, or exactly-once external effects.

### Fowler — Branch By Abstraction (2014)

[Author's article](https://martinfowler.com/bliki/BranchByAbstraction.html).
Practitioner account; free; intermediate. Explains gradual implementation
replacement through an abstraction while the application remains usable. Useful
for migrations too large for one coherent edit. The technique adds transitional
structure, which is a cost to justify and later remove when appropriate.

### PostgreSQL — Transaction Isolation, version 18

[Official documentation](https://www.postgresql.org/docs/18/transaction-iso.html).
Product documentation; free; intermediate/advanced. Shows why transaction scope,
isolation, and retries matter to read/decide/write workflows. PostgreSQL's Read
Committed transactions can observe different snapshots across statements;
serialization failures require retrying the transaction. Recheck the deployed
engine and version before selecting concrete SQL behavior.

### Hypothesis — Stateful tests

[Official documentation](https://hypothesis.readthedocs.io/en/latest/stateful.html).
Tool documentation; free; intermediate. Describes generated action sequences and
comparison with a simpler model. Useful for testing state transitions. The
reference is a technique example; this skill does not require Python or Hypothesis.
Generated tests sample behavior and depend on the quality of the model and inputs.

## Example: calibrating a recommendation

Weak claim: "Research proves that more modules make maintenance faster."

Supported account:

```text
Observation: changing the source encoding currently touches three components.
Proposal: give the reader sole ownership of decoding, returning domain values.
Rationale: this applies information hiding to an observed shared decision.
Evidence needed: encoding fixtures still work; rule/storage code no longer
depends on raw bytes; the next supported format fits without changing them.
Limit: this does not predict a percentage reduction in maintenance time.
```

## Tensions to preserve

Refinement helps discover executable steps; information hiding helps choose
ownership. Small helpers can clarify an algorithm while a larger module provides
a stable caller contract. Pure calculations can simplify tests while stateful
operations still require atomicity. Structural improvement can be worthwhile
while a wholesale reorganization remains too disruptive.

Keep these as design tradeoffs. A source's useful heuristic should not become an
unconditional extraction, size, purity, or dependency rule.

## Extending or refreshing the research

Open primary sources before adding claims. Record the supported claim, its scope,
the publication/version, and any access limit. For experiments, inspect the study
design before quoting precise effects. For library/database details, prefer
versioned official documentation and check the target environment.

Update a reference when new evidence changes a decision or corrects an error.
Stable concepts do not require a new web search during every skill invocation.
