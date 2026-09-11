# Phase and context boundaries

A phase ends when its result and evidence are available: a design decision, implementation, or review. That does not end the user's task when further work is already requested.

Choose a context strategy according to what the next work needs and what the client supports:

| Choice | Useful when | Information to preserve |
| --- | --- | --- |
| Continue | Current decisions and evidence remain relevant. | The current conversation and artifacts. |
| Compact | Context pressure obscures the active work. | Objective, decisions, constraints, authority, completed evidence, and remaining work. |
| Handoff | Work must move to another agent, repository, or environment. | A portable account of the same facts plus artifact locations. |
| Delegate | An independent, bounded subtask benefits from a separate worker and delegation is permitted. | Its exact responsibility, inputs, authority, and expected result. |
| Clear | The next task is unrelated and the user wants fresh context. | Save anything still needed before discarding context. |

Use the environment's actual capabilities and context limits; no fixed token threshold applies across models. Do not require a new session between routine phases, assume slash commands exist, or clear context automatically. If compaction occurs during a phase, resume from preserved progress instead of restarting.

Summaries lose detail. Retain links to primary artifacts and the reasoning behind consequential decisions so the next phase can resolve uncertainty without reconstructing the whole conversation.
