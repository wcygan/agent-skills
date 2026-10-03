# Forma design system

The interface helps operators and reviewers trace work from a team goal to an
approved production artifact. Shared header navigation stays stable across every
page; settings has local section navigation inside that shared shell.

The neutral styling adapts the design-loop prototypes: canvas `#fafafa`, surfaces
`#fff`, text `#202126`, secondary text `#64666f`, borders `#e6e7eb`, and interactive
accent `#5755ce`. Complete steps use pale green, waiting pale yellow, failed pale
red; each has a text label and status dot so color is not the only cue.

Use system fonts, 14px body text, 26px desktop headings, and 6px control/surface
radii. Most content is flat, separated by hairline borders. Forms and bounded
content panels use a single white surface. Avoid unrelated recommendation columns,
fabricated metrics, or decorative gradients.

Header and content gutters use 32–40px desktop; mobile uses a 16px header
gutter and 20px content gutter. Forms and feed
content cap at 720px; comparable deployment pipelines can fill the workspace.
Desktop pipeline steps read horizontally; narrow layouts use two columns in
reading order. Below 760px, a compact header opens a modal drawer from the left. Navigation
rows have 48px touch targets, an active-page highlight, and Settings at the
bottom. The drawer locks background scrolling, contains keyboard focus, and
closes on a destination, backdrop tap, close button, or Escape; dismissal restores
focus to the menu button. Desktop keeps Settings at the right of the header. Header destinations read
Overview, Agent, Tickets, Deployments, Approvals, Team feed, then Settings. Each
link combines a text label and a decorative SVG icon using the current text color.
Tables scroll inside their own container without widening the page.
Agent is a dedicated navigation destination with a viewport-sized conversation
surface. Its compact header holds record navigation and a labeled new-chat button;
messages scroll independently above a composer that grows for multiline drafts.
Small prompt suggestions appear only in the empty state. The page omits repeated
context copy and a visible input label while retaining an accessible field name.
Record discussion links preserve context and offer a path back to the record.

`PageHeading` composes title, description, and actions. Shared `Button`, `Status`,
and feedback keep interaction states consistent. Approval detail composes reviewer
controls as children, separating record presentation from decision state. A
workspace provider owns authoritative snapshots and mutation feedback; local
feature components own drafts, selection, and disclosure state. Status colors
come from a centralized semantic lookup. PromptKit messages, safe Markdown,
suggestions, and scroll containers compose the agent page.

Preserve native labels, focus outlines, keyboard activation, reduced-motion
behavior, disabled reasons, draft recovery, and the server-side production gate.
Settings toggles respond only to the actual control, not the explanatory text.
