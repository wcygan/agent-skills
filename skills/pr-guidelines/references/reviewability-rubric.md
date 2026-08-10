# Reviewability and Split Rubric

Judge cohesion before size. A large coherent change can be reviewable; a small change with two unrelated purposes may not be.

## Signals

| Signal | Low concern | Rising concern |
|---|---|---|
| Purpose | One problem and one conceptual solution | Multiple unrelated outcomes |
| Commit clusters | Commits refine one concern | Commits form independently valuable groups |
| Subsystems | One ownership/reviewer boundary | Several boundaries with different reviewers |
| Change type | One behavior or one refactor | Refactor, behavior, migration, and cleanup mixed |
| Verification | One coherent proof boundary | Different layers need materially different tests |
| Revertability | Would be reverted as one unit | Parts should be independently reversible |
| Dependencies | One unavoidable ordered change | Two concerns can land independently |
| Churn | Mostly substantive changes | Noise obscures the semantic diff |

Downweight generated files, lockfiles, snapshots, vendored files, formatted output, and mechanical renames when interpreting additions, deletions, and file count.

## Decision

Use `CONSIDER SPLIT` only when all are true:

1. at least two concerns can be named in plain language;
2. each concern has a coherent boundary;
3. their dependency order is known, or they can be independent;
4. each proposed layer has useful verification evidence;
5. splitting reduces review or rollback risk more than it adds coordination cost.

Otherwise use `CLEAR` or `NEEDS POLISH` and describe the strongest scope signal without prescribing a split.

## Stack proposal format

When a split is warranted, propose bottom to top:

```text
1. foundation/<concern> — shared types or mechanical prerequisite
   Verify: focused unit/static checks
2. behavior/<concern> — user-visible or service behavior
   Verify: behavior and integration tests
3. surface/<concern> — UI, docs, rollout, or cleanup
   Verify: acceptance scenario and repository gate
```

Use repository naming rules when configured. Do not move code or create branches during an assessment.

## Numeric indicators

File count, line count, and commit count are prompts for inspection, not verdicts. If a tool needs deterministic highlighting, it may mark unusually broad changes as `scope signal` but must not emit `CONSIDER SPLIT` until named separable concerns are established.

