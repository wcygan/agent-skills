# Catalog Rationalization Rubric

Use this reference to compare catalog skills. Apply the same tests to every
candidate group.

## Compare the job, not the words

Use the selected local catalog as the audit boundary. A project skill directory
such as `.agents/skills` takes precedence over global user skill folders. Audit
global folders only when the user names them.

Record these facts for each skill:

| Property | Question |
|---|---|
| Trigger | What request or situation activates it? |
| Job | What transformation does it own? |
| Output | What concrete result proves completion? |
| Authority | What may it inspect or change? |
| Stop | When must it return, hand off, or ask? |

Shared terms, tools, repositories, or domains do not prove overlap. The same
job with the same trigger, output, and authority is strong merger evidence.

## Choose a decision

| Decision | Use when | Reject when |
|---|---|---|
| Retain | The skill has a distinct trigger, output, or authority. | The only difference is wording or an example. |
| Merge | Two skills perform the same job for the same user need. | Their output, authority, or stop condition differs. |
| Extend | One skill owns the job and a new case fits its workflow. | The case adds unrelated branches or a new output. |
| Umbrella | Several specialists produce one integrated result. | The parent only lists children. |
| Router | Classification selects exactly one specialist. | Several specialists must contribute to the result. |
| Rename | The job is sound but the name hides the trigger or output. | A name change would hide a real split. |
| Document | A stable navigation group improves discovery. | The group needs routing or an integrated output. |

## Test an umbrella

An umbrella is valid only when all conditions are true:

1. It has a recurring trigger.
2. It owns an integrated output.
3. It defines phase order or routing predicates.
4. It reconciles duplicate or conflicting child results.
5. It preserves the strictest child authority boundary.

Use `ideate-orchestrator-skill` to design a validated umbrella after this audit.

## Test a router

A router is valid when one request classification selects one specialist. Its
output is the selected skill, evidence, and missing input. It stops before the
specialist does work.

Use `ask-matt` as a comparison point for catalog-level flow routing.

## Build a semantic tree

Use a branch only when it has a stable predicate. Put each leaf in one primary
branch. Add cross-references only for related work.

```text
Documentation group: catalog maintenance
  Router: choose a catalog task
    audit-skill-catalog
    skill-intake
  Umbrella: approved catalog release work
    use only when it owns one integrated release result
```

The tree describes discovery and composition. It must not cause nested skill
directories below `skills/`.

## Check compatibility

Before recommending a merge, identify:

- installed names that may disappear;
- changed model-invocation behavior;
- changed authority or external side effects;
- changed primary outputs;
- required updates to routers, documentation, and examples; and
- the validation path for source and installed catalogs.

Prefer a compatibility router when an old name remains a useful request term.
Recommend removal only with an explicit catalog-version decision.
