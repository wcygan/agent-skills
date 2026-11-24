# Pstack principles in the Wcygan stack

The initial integration on 2026-10-14 shipped 24 standalone principle skills.
Wcygan-mode now distributes the same 24 rules as references. The
[shared index](../skills/wcygan-mode/references/principles.md) selects rules by
task, and each reference records its source and links to the shared MIT notice.

Source is Lauren Tan's
[Pstack principles](https://github.com/cursor/plugins/blob/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/docs/guide/08-principles.md)
at revision `afd51cf66a3100a95f878d6c4b93a01f6508e3b0`. The
[parity matrix](pstack-parity.md#principle-catalog) records the local adaptations.

## Complete mapping

Each file in `skills/wcygan-mode/references/principles/` retains the name of its
source directory under `pstack/skills/`. The workflow column shows where a rule
commonly shapes decisions.

| Principle | Common workflow |
| --- | --- |
| [Laziness Protocol](../skills/wcygan-mode/references/principles/principle-laziness-protocol.md) | Design, implementation, review |
| [Foundational Thinking](../skills/wcygan-mode/references/principles/principle-foundational-thinking.md) | Design, implementation, coordination |
| [Redesign from First Principles](../skills/wcygan-mode/references/principles/principle-redesign-from-first-principles.md) | Design, refactoring |
| [Attack the Premise](../skills/wcygan-mode/references/principles/principle-attack-the-premise.md) | Investigation, debugging, experiments |
| [Subtract Before You Add](../skills/wcygan-mode/references/principles/principle-subtract-before-you-add.md) | Design, implementation, refactoring |
| [Minimize Reader Load](../skills/wcygan-mode/references/principles/principle-minimize-reader-load.md) | Design, implementation, review |
| [Outcome-Oriented Execution](../skills/wcygan-mode/references/principles/principle-outcome-oriented-execution.md) | Planned migrations, implementation |
| [Experience First](../skills/wcygan-mode/references/principles/principle-experience-first.md) | Product design, implementation, delivery |
| [Exhaust the Design Space](../skills/wcygan-mode/references/principles/principle-exhaust-the-design-space.md) | Design, prototypes, experiments |
| [Build the Lever](../skills/wcygan-mode/references/principles/principle-build-the-lever.md) | Implementation, investigation, verification |
| [Model the Domain](../skills/wcygan-mode/references/principles/principle-model-the-domain.md) | Design, implementation |
| [Boundary Discipline](../skills/wcygan-mode/references/principles/principle-boundary-discipline.md) | Design, implementation, review |
| [Type System Discipline](../skills/wcygan-mode/references/principles/principle-type-system-discipline.md) | Design, implementation, review |
| [Make Operations Idempotent](../skills/wcygan-mode/references/principles/principle-make-operations-idempotent.md) | Implementation, recovery, verification |
| [Migrate Callers Then Delete Legacy APIs](../skills/wcygan-mode/references/principles/principle-migrate-callers-then-delete-legacy-apis.md) | Design, migrations, refactoring |
| [Separate Before Serializing Shared State](../skills/wcygan-mode/references/principles/principle-separate-before-serializing-shared-state.md) | Design, coordination |
| [Prove It Works](../skills/wcygan-mode/references/principles/principle-prove-it-works.md) | Verification, review, delivery |
| [Fix Root Causes](../skills/wcygan-mode/references/principles/principle-fix-root-causes.md) | Investigation, debugging |
| [Sequence Work into Verifiable Units](../skills/wcygan-mode/references/principles/principle-sequence-verifiable-units.md) | Implementation, coordination, delivery |
| [Test Behavior, Not Implementation](../skills/wcygan-mode/references/principles/principle-test-behavior-not-implementation.md) | Implementation, verification, review |
| [Explain the Number](../skills/wcygan-mode/references/principles/principle-explain-the-number.md) | Experiments, performance, evals |
| [Guard the Context Window](../skills/wcygan-mode/references/principles/principle-guard-the-context-window.md) | Investigation, coordination, records |
| [Never Block on the Human](../skills/wcygan-mode/references/principles/principle-never-block-on-the-human.md) | All substantive workflows |
| [Encode Lessons in Structure](../skills/wcygan-mode/references/principles/principle-encode-lessons-in-structure.md) | Implementation, retrospectives, records |

## Use

Wcygan-mode reads the index at the start of substantive work and opens only the
rules triggered by the task. Name the principle to steer the work, such as
“Apply Type System Discipline” or `$principle-type-system-discipline`. The
former standalone skill names now identify rules within wcygan-mode.

If a principle changes the approach, report the choice it changed. Use the
playbook for the method, such as reproducing a bug or recording a decision.

## Verification

`tests/test_principle_catalog.py` checks that all 24 rules ship within
wcygan-mode, that each appears in the index once, and that its provenance and
license link survive the move.

```sh
uv tool run --from skills-ref agentskills validate skills/wcygan-mode
uv run --locked python -m unittest discover -s tests -p test_principle_catalog.py -v
just check-full
```

### Local evidence for the standalone catalog, 2026-10-14

- The source checker passed against both a cached source snapshot and the remote
  immutable revision: all 24 leaves match the original plus the seven recorded adaptations.
- Agent Skills validation passed for all 34 changed skills: the 24 principles,
  wcygan-mode, and nine procedures. All changed documentation links resolve.
- `just check-full` passed 73 tests, snapshot verification for 67 skills, and the
  publication dry run. The dry run retained the existing warnings about the
  project-local `.agents/skills/` directory and absent tag protection rules.
- An isolated GitHub CLI installation discovered 67 skills and preserved all 24
  principle bodies and MIT notices. Type System Discipline also installed alone.
  GitHub CLI removes the leading blank line after frontmatter; rule text is unchanged.
- One independent scratch task used wcygan-implement to fix an importer that
  duplicated records on retry. The agent selected relevant principles, named the
  choices they changed, and produced executable regression evidence. Inspection
  and a separate rerun passed all 14 checks, including fresh-process replay and
  interruption around atomic replacement. This is one forward test, not a comparative
  eval or proof of consistent behavior across models, tasks, and all 24 principles.
- On macOS, the dotfiles `make test-pre` gate passed 365 tests. The existing
  installed catalog still verified at its prior pin; no interrupted setup operation
  required recovery. No consumer lock or global skill contents were changed.

These checks describe the authoring checkpoint before publication. Delivery uses
a reviewed provider commit, advances the exact dotfiles consumer pin, and installs
and verifies through the managed bootstrap workflow. Check current activation
against that pin rather than treating this historical checkpoint as live state.
