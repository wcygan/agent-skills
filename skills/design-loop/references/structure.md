# Task structure and neutral layouts

Read when planning information hierarchy, navigation, screen boundaries, or reflow.

## Start with the user's job

Write the path as entry → information needed → action → feedback → completion.
Include a return or correction path. Identify what the user must know before
acting and what can appear later. Count meaningful decisions and required steps
in both the current and proposed flow; explain which friction each removal solves.
Fewer clicks is useful only when comprehension, accuracy, and recovery remain sound.

Prefer one obvious primary action per task context. Give secondary actions less
emphasis and place them near their context. Use familiar, consistent labels that
describe the outcome. Distinguish navigation from commands.

## Choose the simplest fitting layout

| Task | Starting structure | Check before choosing |
|---|---|---|
| Find and manage many records | List or table with search, filters, and contextual actions | Which fields support identification and comparison? |
| Read or discuss sequential updates | Feed or list with clear item boundaries | Does ordering help the user's goal? |
| Edit one item | Focused form with grouped fields and nearby save feedback | Can defaults and existing data remove input? |
| Complete a dependent process | Steps only where dependencies or meaningful decisions require them | Could one clear form replace the sequence? |
| Monitor and act | Prioritized summary plus actionable detail | Which information changes the next action? |
| Configure a product | Stable sections with clear labels | Are settings discoverable without deep navigation? |

Use stable navigation for persistent destinations. Use tabs for peer views within
a context. Use a dialog for a bounded interruption with a clear return; choose a
page when the task needs substantial context, deep linking, or sustained work.
Avoid introducing a dashboard, sidebar, wizard, or card grid by habit.

## Group and size by content

Keep related controls together and separate distinct sections with spacing and
headings. Choose content widths for reading, comparison, or editing. Derive
columns from actual content; a twelve-column grid is an option, not an obligation.
Use one spacing scale and consistent alignment. Prefer shared primitives over
per-page exceptions.

Test realistic long labels, large values, sparse data, and dense content. Keep
required content visible or reachable. Make optional details progressively
available when they would otherwise obscure the main task.

## Responsive behavior

Specify the reading and action order before stacking columns. Let content pressure
determine layout changes. Preserve useful record context when adapting tables.
Provide a reachable navigation alternative when a sidebar collapses. Keep controls
usable with touch and keyboard, and account for zoom and on-screen keyboards.

## State and recovery map

For each relevant state, specify what the user sees and can do:

- Empty: explain what belongs here and provide the appropriate next action.
- Loading: preserve context and distinguish waiting from an empty result.
- Error: explain the failed action and offer a valid retry or correction path.
- Success: confirm the outcome without blocking the next task.
- Permission or disabled state: make the reason and available alternative clear.

Preserve user input on recoverable failures. Use undo or explicit review where
consequences warrant it. Include these states in the wireframe when they alter
layout or task flow.
