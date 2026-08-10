---
name: verify-and-revise
description: Run a bounded producer-verifier revision loop for one explicitly authorized artifact against a fixed acceptance rubric or oracle. Use when an artifact needs repeated evidence-backed revision with actionable feedback, an attempt ledger, minimal coherent changes, and clear pass, retry-cap, plateau, authority, and conflict stopping rules.
license: MIT
---

# Verify and Revise

Improve one explicitly authorized **candidate artifact** through a bounded,
evidence-backed producer/verifier loop. The acceptance rubric or oracle is
fixed for the run; revisions may satisfy it but cannot redefine it. Label the
candidate an **Accepted Artifact** only after terminal pass evidence.

## Establish the revision contract

Before changing the artifact, record:

```text
Candidate artifact identity and authorized mutable scope:
Acceptance rubric or authoritative oracle:
Producer:
Verifier:
Baseline result and evidence:
Maximum attempts:
Repeated-evidence / plateau threshold:
Checkpoint and overlap boundary:
Final evidence:
```

The artifact may be code, a document, a configuration, a plan, or another
bounded deliverable. The rubric must state observable pass conditions, not a
general request to “make it better.” Confirm that its verifier can inspect the
same artifact identity the producer changed.

Use a separate producer and verifier role logically, even when one person or
agent performs both sequentially: verify the actual candidate after producing
it, and write feedback from the rubric rather than from the producer's intent.

This skill authorizes mutation only inside the stated artifact scope when the
user authorized that mutation. It grants no authority for adjacent files,
dependencies, commits, pushes, deployments, publication, messages, external
writes, or changes to the rubric or oracle.

## Keep an attempt ledger

Maintain the authoritative run state in the task unless the user approved a
durable location:

```text
attempt | artifact identity | rubric version | verifier evidence fingerprint
failed criterion | actionable feedback | smallest revision | result | decision
```

An evidence fingerprint identifies unchanged verifier evidence relevant to the
failed criterion. Read the ledger before each attempt. It prevents cycling on
the same feedback or claiming a changed result without changed evidence.

## Run one revision cycle

1. Preserve the rubric, oracle, and candidate identity from the contract.
2. Have the verifier evaluate the current artifact and return each failed
   criterion, evidence, and smallest known distinguishing observation.
3. Stop with `pass` when all acceptance criteria have evidence.
4. Translate one or more related failed criteria into actionable feedback:
   what is false, where it is observable, and what constraint a revision must
   preserve.
5. Produce the smallest coherent revision that addresses that feedback inside
   the authorized scope.
6. Verify the revised artifact against the unchanged rubric or oracle.
7. Record the result, evidence fingerprint, decision, and budget.
8. Evaluate every stopping rule before another revision.

A revision may address several criteria only when one coherent change is needed
for them. Keep unrelated cleanup, speculative redesign, and scope expansion out
of the cycle. A passing producer claim is not verification evidence.

## Stop and hand off precisely

Stop immediately on pass, retry-cap exhaustion, repeated unchanged evidence,
an oracle that cannot run or cannot identify the candidate, a blocker, new
authority, or an overlapping user edit in the checkpoint boundary. Preserve
the artifact and evidence; do not overwrite user changes or roll back beyond
the loop-owned revision.

On `passed`, emit the Accepted Artifact identity, fixed rubric/oracle, all
attempts and decisions, and terminal verifier evidence. On `stopped` or
`blocked`, report the last candidate identity, its final verifier evidence,
and the smallest next decision; do not label it accepted. Completion requires
terminal pass evidence, not a producer's statement or an exhausted attempt
count.

## Boundary with adjacent skills

- `design-verification-strategy` designs a proof strategy and oracle set; use
  it first if the acceptance rubric is missing or contested.
- `hill-climbing` optimizes a numeric metric with a behavioral guard; use it
  when keeping/discarding experiments is the primary decision.
- `tdd` is a test-first development practice, not a general artifact
  producer/verifier orchestrator.
- `code-review` assesses a change against a spec and standards; use it when
  review findings, rather than accepting one target artifact, are wanted.

This skill does not invoke those companions or copy their procedures.

## Examples

```text
Revise this installation guide until it passes the supplied seven-item
accessibility and accuracy rubric. You may edit only docs/install.md; stop
after three failed revisions.
```

```text
Revise the generated schema only inside schemas/customer.json until the fixed
validator reports success. Do not change the validator or adjacent sources.
```

## Counterexamples

- “Improve the whole product until reviewers are happy” has no bounded artifact
  or fixed oracle; establish both before using this skill.
- “Make the test pass by changing its expectations” weakens the rubric and is
  outside this loop's authority.
