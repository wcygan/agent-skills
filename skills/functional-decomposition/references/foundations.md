# Foundations

Use this reference when terminology or the goal of decomposition is unclear.
The vocabulary below is the skill's working vocabulary; preserve established
project names when they convey the same meaning.

## Three views of a system

| View | Describes | Example |
|---|---|---|
| Execution | What happens and in what order | Read, interpret, validate, store |
| Responsibility | Who owns behavior, knowledge, and consistency | Format reader, record rules, record store |
| Deployment | Where execution occurs | One process with one database |

These views can have different shapes. A single store can support several
execution steps. A responsibility can have private helpers. Several
responsibilities can remain in the same file or process.

Functional decomposition identifies constituent behaviors. Stepwise refinement
makes a behavior increasingly concrete. Modularization assigns responsibilities
and controls what other parts can depend on. Information hiding selects knowledge
to keep private. Abstraction presents a usable concept with irrelevant detail
removed. These distinctions combine the concerns of
[Wirth](https://john.cs.olemiss.edu/~hcc/csci658/notes/localcopy/WirthStepwiseRefinement.pdf)
and [Parnas](https://www.cs.lafayette.edu/~gexia/cs301/resources/parnas.html).

## Working vocabulary

- **Responsibility:** an outcome, rule, or resource for which a part is accountable.
- **Module:** a part with a caller-facing contract and an implementation; no
  particular language construct or physical size is implied.
- **Contract:** everything a caller needs to use a part correctly, including
  behavior outside its formal signature.
- **Invariant:** a condition that holds at specified observation points, such as
  after each completed operation. Specify those points for concurrent code.
- **Cohesion:** how meaningfully the contents belong together.
- **Coupling:** dependencies through which one part constrains another, including
  assumptions about representation, time, or shared state.
- **Local reasoning:** assessing one part using its contract and explicit
  assumptions about collaborators.
- **Change locality:** how narrowly a particular change can be implemented and
  verified. This depends on which change is being considered.

## Example: generating an invoice

Execution might be:

```text
load activity → calculate charges → apply adjustments → render document
```

Responsibility ownership could be:

```text
Billing policy: what is chargeable and how amounts are calculated
Activity access: how relevant activity is retrieved
Document renderer: layout and output encoding
Coordinator: which period/customer is processed and overall outcome
```

The diagram alone does not establish a good decomposition. Ask what changes when
the rounding rule changes. If both the renderer and policy calculate amounts,
ownership is still unclear. Have the renderer consume finalized amounts if the
requirement is that all outputs share the same calculation.

Conversely, a short invoice preview with no persistence or alternate outputs may
need only a calculation function and a renderer. The responsibility map is a way
to reason about the code, not a requirement to create one class per label.

## Goals and limits

Look for less knowledge needed per task, a predictable home for changes, and
clearer correctness evidence. Reuse and parallel development may follow, but
forcing every responsibility to be independently reusable can increase cost.

Choose the smallest useful target. Clarifying a parser's internal algorithm and
splitting an application into services are different assignments. A logical
decomposition is not evidence for a network boundary.

For evidence categories and the historical sources' limitations, consult
[Research and evidence](research-and-evidence.md).
