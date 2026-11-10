---
name: create-formal-verification-skill
description: "Generate a project-local skill that formally verifies the code where a bug costs the most and tests reach the least, in any language, with whichever verification tool fits. Use when explicitly asked to create a formal verification skill, \"model-check this race\", \"prove this invariant\", or when concurrency, retries, state machines, parsers, or unsafe code need more than tests."
license: MIT
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 4382e687a50b8d2c5ce4d141d001186589cff8d5
  upstream-path: pstack/skills/create-formal-verification-skill
  upstream-author: Lauren Tan
  maintenance: local
---
# Create a formal verification skill

A test checks the cases that someone thought to write. Formal verification checks every case in a stated scope: every order of steps in a model, every input up to a bound, or every input. This skill finds the part of the repo where that matters most, verifies one property of it, and leaves a project-local skill that lets the next agent check a change against that property. Write that skill for an agent who reads it cold, mid-change, and has never seen your work, so that the user can trust the result and act on it without learning the verification language.

Running checks, working on a scratch branch, and rerunning a check need no go-ahead. Get an explicit go-ahead before installing a verifier or adding a dev dependency, because both change what every developer on the project has to carry.

## Choose the target from the code

Answer from the codebase, and ask the user only what you cannot observe. If the user named an area or a bug, start there.

A good target is a promise the code makes, where a break harms users and tests rarely reach the case that breaks it. Choose the strongest such target in the repo, not the one that is easiest to verify.

## Let the question choose the tool

Pick the tool that answers the question at the lowest cost: a model checker (explores every reachable state of a small model), a proof assistant (checks a proof that a property holds at every size), an SMT-backed verifier (turns code and a property into logic that a solver decides), or another tool. Whether events can happen in a bad order usually suits a model checker over a small model of the design. Whether the code itself behaves for every input, as with memory safety, overflow, or a data-structure invariant, usually suits a verifier that runs on the code. A property that must hold at every size, where a bound is not enough, can need a proof. For concurrent and distributed designs, TLA+ (a specification language whose models the TLC model checker explores) is often the most useful place to start. Prefer a tool that the repo's developers can install and run, and tell the user why you chose it.

## What makes it good

- **True to the code.** Every part of the model or proof points to code that a reviewer can open. What the verification treats as one indivisible step is one indivisible step in the code. Names come from this repo.
- **Able to fail.** A check that you have never seen fail proves nothing. Show each property failing on a broken variant of the code it guards, such as a removed check or a reordered step.
- **Findings stay findings.** When the current code breaks the property, report it with the counterexample in the code's terms. Keep the property and the model as stated, because weakening them until they pass hides the finding; leave product code unchanged unless the user asks, because it is theirs to change.
- **Honest about scope.** Say what is verified, under which bounds and assumptions, and what is left out. A pass covers the model or the bound, not the whole system.
- **Readable without the tool.** State the property and the harm in one plain sentence each. Tell a counterexample as a short sequence of steps in the code's words.
- **Cheap to rerun.** One command, a reproducible tool version, and a run short enough that the next agent will use it on every relevant change. When a model-check run exceeds a few minutes, post a progress line so the user knows it is running rather than stuck.
- **Kept in step with the code.** When verified code changes, something tells the next agent that the verification needs another look.

## Generate the verify skill

Write a project-local skill with frontmatter that names the area and says when to use it, because without frontmatter the skill never registers. Put it where this project's agents already load skills; if the project has no convention, use `.agents/skills/<name>/SKILL.md` in the Agent Skills format, with a `name` that matches the directory and a `description`. From the skill alone, the next agent must be able to tell whether a change touches the verified code, run the check, tell a real bug from a modeling error, and update the verification when a change is intended. Use this repo's real commands, paths, and nouns, and leave no placeholders, because a placeholder stops the next agent cold.

## Prove it before you hand off

Follow the generated skill once, as the next agent would, on a scratch change that breaks the property in the real code. It must catch the break. Then drop the scratch change and confirm that the check is back where it started: passing, or failing only on the findings you will report. A verify skill that was never run is a draft. If the skill misses the break or a step does not run, fix the skill or the verification, because the scratch change is the test of the skill, not the thing under test.

Post a short progress update at each phase boundary: target chosen, tool chosen, check written, check proven.

## Hand off

Lead with the finding: whether the current code breaks the property, and if so the counterexample as steps in the code's words. Then say which tool you used and why, the bounds, how to run the check, and what it does not cover. End with a self-contained recap: the outcome, what was verified, what was not, and what is next. Suggest a second target only if you found a close one.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
