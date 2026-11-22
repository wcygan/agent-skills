---
name: lean-verify
description: "Prove a property of code for every input with the Lean 4 proof assistant, and leave a check that one command reruns. Use for Lean, Lake, or Mathlib work, \"prove this for all inputs\", or when a parser, codec, arithmetic routine, data-structure invariant, or policy rule must hold at every size and a bounded check or a test is not enough."
license: MIT
compatibility: Requires elan, which installs Lean 4 and Lake; the worked examples also need uv, and the Rust one needs cargo and nix. Checked against Lean 4.36; verify tactic and Lake syntax against the installed version.
metadata:
  kind: component
  maintenance: local
---

# Lean verify

Lean checks a proof that a statement holds for every input. Its kernel checks the proof, so the reader does not have to trust or read the proof. The reader does have to agree that the theorem says what they mean, so write each theorem for a reader who will read only its statement.

## Decide whether Lean fits

Lean fits a property of pure, sequential logic that must hold at every size: a decoder inverts its encoder, a merge gives the same result in either order, a policy never grants more than its rule allows.

Use another tool in these cases, and say why:

- **Events in a bad order**, such as a race, a retry, or a lost update. A model checker returns the steps that lead to the bug, and a failed proof does not. Use the statechart skill, when available.
- **A bounded property of the code itself**, such as overflow or memory safety. A verifier that runs on the code costs less.
- **A property that a few hundred random inputs would settle.** Write a property test.

## Tie the theorem to the code

A theorem is about Lean definitions. It says nothing about code in another language until you connect the two. Pick one connection and name it in the hand-off:

- **The code is Lean.** Prove the theorem about the definition that runs.
- **The code is safe Rust.** Aeneas translates it to Lean, so the proof is about the code and no model is needed. It needs the Charon and Aeneas tools and Mathlib, about 8 GB. Read its documentation for the supported subset, and check the generated file for `axiom`, which marks Rust that it could not translate.
- **Any other code.** Write a Lean model of the function, in this repo's names, with each definition pointing at the code it models. Then add a differential test: run the same generated inputs through the model and the real code, and compare the results. Without that test, the proof covers only the model.

Read the [worked examples](references/examples.md) before you set up your own: each is real code, its Lean side, the proof, and one command that reruns the check.

## Set up

Installing elan changes the user's machine, and a Lean folder changes what the project carries, so get a go-ahead for each unless the request asked for a Lean proof.

Keep a check that will be rerun in the repo, in its own folder. Use a scratch folder outside the repo for a one-off question.

```sh
lake new <name> lib
```

- `lean-toolchain` pins the Lean version. Commit it with `lake-manifest.json`.
- Give every `[[require]]` in `lakefile.toml` a `rev`. Without one, `lake update` takes the dependency's `main` and can download another toolchain.
- Run `lake update` after you change a dependency. Until then the build stops with `missing manifest`.
- Add Mathlib only when the proof needs its mathematics, because it is a large dependency. Fetch its compiled files with `lake exe cache get`, or the first build compiles all of Mathlib.

## State, test, then prove

1. Write the property and the harm of a break in one plain sentence each. Then write the theorem. Every hypothesis is an assumption about the caller, so list each one in the hand-off as scope.
2. Test the statement before you prove it. With the Plausible package, `by plausible` runs random inputs and prints a counterexample. `#guard clamp 1 5 9 = 5` checks one case at build time. A counterexample here is either a bug or a missing hypothesis; find out which from the code.
3. Prove it. Try the automatic tactics first: `grind`, `omega` for linear integer arithmetic, `simp`, `decide` for a small finite case, and `bv_decide` for fixed-width bit vectors, which needs `import Std.Tactic.BVDecide`. When they fail, read the goal that the error prints and reduce it by hand.

When the statement is false for the current code, report that finding with the counterexample in the code's words. Do not add a hypothesis or weaken the statement until it passes, because that hides the finding. Leave product code unchanged unless the user asks.

## Run the check

```sh
lake build --wfail
```

Plain `lake build` succeeds on a proof that contains `sorry`, with only a warning. `--wfail` turns that warning into a failure, so the check uses it.

Put `#print axioms <theorem>` after each theorem that the hand-off names, and read its line in the build output:

- `propext`, `Classical.choice`, and `Quot.sound` are Lean's standard axioms.
- `sorryAx` means a part of the proof is missing.
- An axiom with `_native` in its name, which `bv_decide` adds, means the proof trusts the Lean compiler and not only the kernel. Say so in the hand-off.
- Any other axiom is an assumption that someone declared. Name it as scope, or remove it.

## Show that the check can fail

A theorem whose hypotheses contradict each other is true and proves nothing. So break the definition the way a real bug would, such as a removed bound or a swapped argument, and run the check. It must fail. Then restore the definition and confirm that the check passes again. For a model of other code, also break the real code and confirm that the differential test fails.

## Hand off

Lead with the outcome: the property holds for every input, or the code breaks it and here is the counterexample. Then give each theorem as its plain sentence, the hypotheses, how the theorem is tied to the code, the axioms, and the command that reruns the check. Say what is not covered: the parts of the code outside the model, and any behavior that the hypotheses rule out.

To leave a project skill that tells the next agent when to rerun the check, use `create-formal-verification-skill`, when available.
