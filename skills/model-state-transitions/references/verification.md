# Verify transitions and observable behavior

Use this reference when defining acceptance criteria or checking a stateful change.
Scale the checks to the consequences and uncertainty; a simple toggle needs no
generated test harness or formal specification.

## Properties and progress

- State invariants describe what must hold in every reachable state, such as
  “displayed data belongs to the current request.” Check the initial state and
  the result of each meaningful transition.
- Transition properties describe permitted changes, such as “a stale completion
  leaves the current request unchanged.” Specify guards and observable effects.
- Progress properties describe eventual outcomes. Write their assumptions:
  worker availability, dependency recovery, scheduling fairness, retry limits,
  and whether cancellation ends the obligation. Safety can hold while work is
  stuck forever.
- A finite deadline test demonstrates bounded progress under its tested
  conditions; it does not establish unrestricted eventual completion.

## Meaningful traces

Exercise sequences through the public boundary, asserting what callers observe.
Cover the ordinary path, recovery, cancellation, and the sequences implicated by
the design. Use a deterministic clock or controlled completion order when time
or concurrency determines the outcome.

For request replacement, include both traces:

```text
start A → cancel A → start B → complete A → complete B
start A → cancel A → start B → complete B → complete A
```

In the first trace, A completes while B is still loading. A handler that accepts
any completion while `loading` violates the request identity invariant. The
second trace catches a stale result overwriting B's displayed result. Compare
request identity or generation according to the chosen domain model.

Define and check the policy for each relevant exceptional event:

- Invalid event in the current state: reject, ignore, or return a domain result.
- Duplicate event: preserve the intended result and any required idempotency.
- Stale event from an earlier attempt: prevent it from changing current work.
- Failure or restart between effects: recover according to the persistence and
  delivery guarantees actually provided.

Do not silently discard an event merely to make a test pass. Confirm that its
policy matches the caller's contract and that required effects still occur.

## Verify effects at their boundary

Pure transition tests can check the next state and requested effects. Integration
checks must also show that the adapter executes those effects correctly: starts
or cancels the intended request, persists the intended record, emits the intended
message, or renders the intended result. Check identity, ordering, and repetition
where they affect correctness. Select real boundaries appropriate to the change;
mock assertions alone do not demonstrate external behavior.

## Generated and model-based tests

Use generated sequences when the space of relevant histories is large enough to
justify them. Keep a small, independent oracle describing required behavior;
copying production branching into the model can reproduce the same defect.
Execute commands against the implementation and compare observable outcomes
after each step. Generate invalid actions separately if valid-command
preconditions would otherwise exclude them.

Control completion order when testing races. Preserve the seed, replay metadata,
and minimized failing trace; turn a useful counterexample into a readable
regression. Confirm that generators actually reach the scenarios of interest.

State, branch, or transition coverage does not imply coverage of histories or
concurrent schedules. Report what ran and its limits. Generated tests sample
behaviors; they do not prove the implementation correct.

## Optional model checking

Consider TLA+ or Alloy for consequential ownership, coordination, retry, or
interleaving rules that remain hard to assess. State properties, assumptions,
actor/data bounds, and the relationship between the model and implementation.
Translate counterexamples into implementation checks where practical.

A successful check establishes only the checked model's properties under its
assumptions and configured search. It does not automatically establish that the
implementation conforms. Distinguish an interrupted search, bounded checking,
and completed exploration. Alloy 6 can check all temporal traces within bounded
signature scopes using a supported complete model checker; it is not limited to
bounded-length traces. Larger scopes and omitted environmental behavior still
require separate consideration.

## Skill evaluation prompts

1. “A settings panel has one local on/off toggle. Model it simply and verify
   repeated toggles.” Expected: two states or a boolean, direct behavior checks,
   and no unnecessary state-machine framework or formal tooling.
2. “Search requests can be cancelled and replaced; responses may arrive out of
   order.” Expected: explicit attempt identity, both stale-completion traces
   above, and checks of visible results and request effects.
3. “A worker retries jobs after crashes and may receive duplicate completions.
   Explain how to verify it.” Expected: explicit duplicate/invalid-event policy,
   separate safety and progress claims with recovery assumptions, meaningful
   integration checks, and justified optional sequence generation/model checking
   with stated coverage limits.

## Primary references

- [Hypothesis stateful rules and invariants](https://hypothesis.readthedocs.io/en/latest/stateful.html)
- [fast-check model-based testing and replay](https://fast-check.dev/docs/advanced/model-based-testing/)
- [fast-check controlled asynchronous schedules](https://fast-check.dev/docs/advanced/race-conditions/)
- [Lamport: Safety, Liveness, and Fairness](https://lamport.org/tla/safety-liveness.pdf)
- [Alloy 6 temporal analysis and scopes](https://alloytools.org/alloy6.html)
