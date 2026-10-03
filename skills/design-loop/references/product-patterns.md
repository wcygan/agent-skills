# Established product patterns

Read when choosing inspiration, establishing a minimal design system, or deciding
an unfamiliar interaction. These products are user-selected reference candidates;
the table is a research starting point, not a verified inventory of current UI or
proof of usability. Inspect current examples before claiming specific behavior.

## Select references by task

| Candidate | Patterns worth investigating |
|---|---|
| LinkedIn | Professional identity, search, profiles, lists, messaging, and contextual actions |
| X | Sequential content, composition, discussion context, and compact item actions |
| Linear | Work-item management, list/detail relationships, filtering, navigation, and keyboard workflows |
| Facebook | Familiar social navigation, groups, feeds, notifications, and content creation |
| Mercury | Financial overview, account detail, transaction exploration, and consequential actions |
| Ramp | Expense submission, approvals, receipt handling, and financial workflow status |
| Figma | Dense workspaces, contextual tools, collaboration, and progressive access to advanced controls |
| Vercel | Project overview, deployment status, activity, configuration, and diagnostic detail |

Choose one primary reference suited to the user's task and at most a few secondary
references for specific unresolved decisions. In improve mode, favor useful project
conventions. In redesign mode, select the best fit from the brief without granting
existing visual or interaction conventions precedence.

## Inspect and record evidence

Use official product documentation, public demos, or accessible product screens.
Use authenticated surfaces only within available authorization. If browsing is
unavailable, use supplied screenshots and documentation; label unverified recollection
as a hypothesis and avoid asserting current product behavior.

For each adopted pattern, record:

```text
Task and structural decision:
Reference product, URL or supplied artifact, and inspection date:
Observed pattern and relevant state:
Why it fits this user's task:
Adaptation to project conventions:
Tradeoff and how it will be checked:
```

Popularity is a discovery signal. Validate fit against the task, content volume,
user familiarity, device, accessibility, and consequences. A pattern suited to
expert desktop users may need visible controls and simpler sequencing elsewhere.

## Adapt the system coherently

Borrow principles such as stable navigation, consistent record presentation,
contextual actions, clear status, and recoverable editing. Build a coherent
interface in the project's vocabulary rather than combining unrelated product
shells. Brand identity, logos, distinctive artwork, and proprietary assets require
their own rights and are unnecessary for structural inspiration.

In improve mode, map selected patterns onto suitable existing components and
tokens. In redesign or from-scratch mode, establish a coherent system around the
chosen direction. Define what this task needs:

- Layout primitives: page container, section, stack, row, and relevant list/detail shell.
- Hierarchy: heading levels, body text, supporting text, and action emphasis.
- Controls: consistent buttons, fields, selection, disclosure, and navigation.
- States: focus, selected, disabled, validation, waiting, and feedback.
- Shared spacing and sizing conventions with responsive behavior.

Keep a single primary visual language. Use restrained neutral defaults until
visual identity is requested or inherited from the project. Document deliberate
departures from existing conventions through the user benefit they create.
