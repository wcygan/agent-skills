# Formal verification

Verify one consequential property under explicit bounds and assumptions. A
model checker explores every reachable state of a model within its configured
scope. A code verifier checks the program under stated bounds and preconditions.
A proof assistant can establish a theorem for every input covered by its
hypotheses. When the user requests a reusable skill, leave a project-local skill
that runs the check. For a one-off question, use scratch space.

## Choose the property and verifier

Start with the area or bug the user named. Otherwise inspect the project for a
promise whose failure harms users and whose failure cases tests seldom reach.
Choose the strongest relevant property you can verify within the task's scope.
State the promise and the harm of a break in one plain sentence each.

| Question | Method |
| --- | --- |
| Can events arrive in an order that breaks safety or progress? | Model-check a small concurrent or distributed design with a tool such as TLA+ and TLC. |
| Can program execution violate memory safety, overflow bounds, or a data invariant? | Choose a verifier that runs on the code, such as an SMT-backed verifier. Set explicit input and execution bounds when required. |
| Must a pure function satisfy a property at every size? | Consider Lean 4 or another proof assistant. A property test can answer a question that only requires sampled evidence. |

Prefer a tool developers can run with the project's existing setup. Get explicit
approval before installing a verifier or adding a development dependency.
Explain the choice and record the pinned tool version.

## Tie the check to the implementation

- Use names from the repository. Map model variables, steps, and proof
  definitions to relevant source paths. Match each modeled atomic step to the
  implementation's actual atomic boundary.
- For a stateful model, state safety invariants, allowed transitions, progress
  properties, and assumptions about scheduling, retries, recovery, and
  cancellation. Report actor and data bounds, omitted behaviors, and whether
  exploration completed. Replay counterexample traces against the implementation
  where practical. When checking TLA+ with TLC and visual evidence is requested,
  use the statechart skill if available.
- Prefer checking the production definition when the tool supports it. For a
  separate model, establish what connects the model to the implementation,
  such as replaying the same generated inputs through both. The proof covers the
  model. Differential evidence covers the inputs tested.

## Leave and exercise one reproducible check

1. Create one command that runs the pinned verifier, checks correspondence
   with the current source where applicable, and preserves evidence. Keep
   repeated runs short enough for the changes they are intended to guard.
2. Make a realistic scratch break for each property. Confirm the check
   catches it. With a model and differential harness, also mutate the real
   implementation and confirm that the mismatch is detected. Restore every
   scratch change and rerun to confirm the original result.
3. For a reusable skill, follow the project's skill directory convention or
   use `.agents/skills/<name>/SKILL.md`. Include matching Agent Skills name and
   description frontmatter. Give a fresh reader the relevant source paths, the
   exact command, the expected result, how to distinguish a finding from a
   modeling error, and what code changes require revisiting the check. Follow
   the generated instructions from start to finish while verifying the scratch
   break and the restored baseline. Mark an unrun skill as a draft and name
   the blocker.

Preserve findings in the current code. Report the counterexample in the
project's terms and leave product changes for the scope the user authorized.
Keep the agreed property and bounds visible when reporting a failure.

Post a short progress update when the target and tool are chosen, the check is
written, and the check is exercised. For a long model check, report progress
after the first few minutes.

Lead the handoff with whether the property holds within scope or the steps that
break it. Include assumptions, bounds, tool choice and version, the command,
the implementation correspondence, evidence that the check catches the scratch
break, and gaps in coverage.

Adapted from Lauren Tan's Pstack [create-formal-verification-skill](https://github.com/cursor/plugins/tree/4382e687a50b8d2c5ce4d141d001186589cff8d5/pstack/skills/create-formal-verification-skill). [MIT license](LICENSE.txt).
