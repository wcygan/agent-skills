# Pstack principles in the Wcygan stack

The earlier generic port omitted the standalone principles. Individual workflows
contained overlapping criteria, but did not provide a shared vocabulary, complete
rule coverage, or a requirement to identify the decision each principle changed.
This integration adds all 24 as standalone skills beneath the existing workflows.

Source: Lauren Tan's [Pstack principles](https://github.com/cursor/plugins/blob/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/docs/guide/08-principles.md)
at `afd51cf66a3100a95f878d6c4b93a01f6508e3b0`, MIT licensed.
Every skill preserves its name, description, examples, and decision rules.
Seventeen bodies are unchanged; seven have targeted exceptions documented in the
[parity matrix](../skills/wcygan-mode/references/parity.md#principle-catalog).
Pstack-specific invocation metadata is replaced by portable frontmatter, source
metadata, and an attribution footer. Each leaf contains its original MIT notice.

## Complete mapping

Every local `skills/principle-<name>` maps to the identically named
`pstack/skills/principle-<name>` directory at the pinned revision. The workflow
column shows where the rule commonly shapes decisions; it is not exclusive routing.

| Standalone skill | Common workflow |
| --- | --- |
| [Laziness Protocol](../skills/principle-laziness-protocol/SKILL.md) | Design, implementation, review |
| [Foundational Thinking](../skills/principle-foundational-thinking/SKILL.md) | Design, implementation, coordination |
| [Redesign from First Principles](../skills/principle-redesign-from-first-principles/SKILL.md) | Design, refactoring |
| [Attack the Premise](../skills/principle-attack-the-premise/SKILL.md) | Investigation, debugging, experiments |
| [Subtract Before You Add](../skills/principle-subtract-before-you-add/SKILL.md) | Design, implementation, refactoring |
| [Minimize Reader Load](../skills/principle-minimize-reader-load/SKILL.md) | Design, implementation, review |
| [Outcome-Oriented Execution](../skills/principle-outcome-oriented-execution/SKILL.md) | Planned migrations, implementation |
| [Experience First](../skills/principle-experience-first/SKILL.md) | Product design, implementation, delivery |
| [Exhaust the Design Space](../skills/principle-exhaust-the-design-space/SKILL.md) | Design, prototypes, experiments |
| [Build the Lever](../skills/principle-build-the-lever/SKILL.md) | Implementation, investigation, verification |
| [Model the Domain](../skills/principle-model-the-domain/SKILL.md) | Design, implementation |
| [Boundary Discipline](../skills/principle-boundary-discipline/SKILL.md) | Design, implementation, review |
| [Type System Discipline](../skills/principle-type-system-discipline/SKILL.md) | Design, implementation, review |
| [Make Operations Idempotent](../skills/principle-make-operations-idempotent/SKILL.md) | Implementation, recovery, verification |
| [Migrate Callers Then Delete Legacy APIs](../skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | Design, migrations, refactoring |
| [Separate Before Serializing Shared State](../skills/principle-separate-before-serializing-shared-state/SKILL.md) | Design, coordination |
| [Prove It Works](../skills/principle-prove-it-works/SKILL.md) | Verification, review, delivery |
| [Fix Root Causes](../skills/principle-fix-root-causes/SKILL.md) | Investigation, debugging |
| [Sequence Work into Verifiable Units](../skills/principle-sequence-verifiable-units/SKILL.md) | Implementation, coordination, delivery |
| [Test Behavior, Not Implementation](../skills/principle-test-behavior-not-implementation/SKILL.md) | Implementation, verification, review |
| [Explain the Number](../skills/principle-explain-the-number/SKILL.md) | Experiments, performance, evals |
| [Guard the Context Window](../skills/principle-guard-the-context-window/SKILL.md) | Investigation, coordination, records |
| [Never Block on the Human](../skills/principle-never-block-on-the-human/SKILL.md) | All substantive workflows |
| [Encode Lessons in Structure](../skills/principle-encode-lessons-in-structure/SKILL.md) | Implementation, retrospectives, records |

## Use

Wcygan-mode and all nine procedural entrypoints read the
[shared index](../skills/wcygan-mode/references/principles.md). They read selected
leaves in full, revisit the selection when evidence changes, and name each applied
principle with the specific choice it changed. There is no required response heading
or requirement to apply all 24. A principle name can steer the work, and each leaf
can also be invoked directly, for example `$principle-type-system-discipline`.

Principles supply decision rules. Existing procedures and components supply methods
such as reproducing a bug, measuring performance, or recording a decision. Leaves
remain usable independently; missing upstream helper skills are replaced with
essential inline guidance rather than introducing required dependencies.

## Verification

Check source fidelity without following a moving upstream branch:

```sh
uv run --locked tools/check_principle_parity.py
# Or use a local checkout/snapshot of the pinned cursor/plugins source:
uv run --locked tools/check_principle_parity.py --upstream /path/to/cursor-plugins
```

The checker compares complete skill text with the pinned source plus an explicit
list of replacements. It is read-only and prints a diff for any unrecorded change.
It does not update source, install skills, or synchronize a newer revision.

```sh
uv tool run --from skills-ref agentskills validate skills/principle-type-system-discipline
uv run --locked python -m unittest discover -s tests -p test_principle_catalog.py -v
just catalog-snapshot
just check-full
```

Repository tests check catalog coverage, workflow routing, provenance, license
packaging, and link resolution. Format and fidelity checks establish faithful
distribution; they do not establish that every model applies every rule correctly.
Use isolated representative trials for behavioral evidence, and preserve their
inputs, outputs, and limitations separately from deterministic catalog checks.

### Local evidence, 2026-10-14

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
