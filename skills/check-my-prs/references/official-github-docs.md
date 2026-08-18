# Official GitHub Documentation Index

Last verified: 2026-08-09

GitHub's stacked pull request feature is in public preview. Re-check preview-sensitive behavior before making operational claims or proposing mutations.

## Precedence

When sources disagree, use this order:

1. live installed `gh stack <command> --help` for available CLI flags and side effects;
2. GitHub reference and API documentation for platform semantics;
3. GitHub how-to documentation for workflows and recovery;
4. GitHub tutorials for recommendations and examples;
5. repository and user conventions for presentation;
6. the strictest applicable safety rule.

## Index

| Document | Authority | Load when | Preview-sensitive facts | Known conflicts | Verified |
|---|---|---|---|---|---|
| [Stacked pull requests how-tos](https://docs.github.com/en/pull-requests/how-tos/stacked-pull-requests) | How-to hub | Orienting to official workflows | Available workflow set | None recorded | 2026-08-09 |
| [Stacked pull requests reference](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests) | Reference | Defining stack concepts and limits | Feature status and platform behavior | None recorded | 2026-08-09 |
| [Stacked PRs CLI commands](https://docs.github.com/en/pull-requests/reference/stacked-prs-cli-commands) | CLI reference | Checking command families and merge behavior | Flags and grouped operations | Installed help currently defines direct grouped merge as all-or-nothing. Merge queues can land members separately. | 2026-08-09 |
| [GraphQL pulls reference](https://docs.github.com/en/graphql/reference/pulls) | API reference | Detecting membership and positions | `PullRequest.stack`, `stackEntry`, and stack entry fields | None recorded | 2026-08-09 |
| [REST pulls API 2026-03-10](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10) | API reference | Checking PR and stacked merge endpoints | Versioned request and asynchronous stack merge behavior | Never invoke a merge endpoint during a read-only check | 2026-08-09 |
| [Managing stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/managing-stacked-pull-requests) | How-to | Creating, editing, syncing, or rebasing | Current CLI workflow and recovery path | Installed help wins on flags | 2026-08-09 |
| [Reviewing stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-stacked-pull-requests) | How-to | Interpreting review order and dependencies | Review UI and dependency behavior | None recorded | 2026-08-09 |
| [Merging stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-stacked-pull-requests) | How-to | Computing merge order or proposing merge operations | Merge limitations; auto-merge support | Conflicts with AI tutorial's auto-merge recommendation; prefer this merge how-to | 2026-08-09 |
| [Optimizing CI for stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests) | How-to | Explaining repeated CI or workflow optimization | Stack metadata exposed to Actions | Repository policy still determines required checks | 2026-08-09 |
| [Troubleshooting stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-stacked-pull-requests) | How-to | Recovering conflicts, divergence, or partial merge | Recovery commands and failure states | Warns partial merge progress may occur despite CLI reference wording | 2026-08-09 |
| [Stack code changes in pull requests](https://docs.github.com/en/pull-requests/tutorials/stack-code-changes-in-pull-requests) | Tutorial | Teaching layer design and workflow | Recommended stack construction | Examples are not normative command contracts | 2026-08-09 |
| [Stack AI-generated code in pull requests](https://docs.github.com/en/copilot/tutorials/stack-ai-generated-code-in-pull-requests) | Tutorial | AI-generated work is explicit | Bottom-up generation, coherent layers, self-review | Recommends auto-merge or queue; merge how-to currently says auto-merge is unsupported for stacks | 2026-08-09 |
| [Review AI-generated code](https://docs.github.com/en/copilot/tutorials/review-ai-generated-code) | Tutorial | Applying the explicit AI review path | Human review and AI-specific risks | Repository policy remains authoritative | 2026-08-09 |

## Stable interpretation rules

- Detect official stack membership through GraphQL, not branch-name heuristics.
- GitHub Actions may run per PR even though a stack is reviewed and merged as an ordered unit.
- Use stack position, size, base reference, and base SHA event metadata only when the workflow event exposes them; otherwise report unavailable evidence.
- Fix a problem in the layer that owns it, then propagate that correction upstack.
- Review and merge from the bottom upward.
- Claim direct grouped merge atomicity only when installed help confirms it and no merge queue owns completion.
- Treat atomicity as an all-or-nothing PR set guarantee, not a single-commit guarantee or validation result.
