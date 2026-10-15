---
name: technical-visuals
description: "Create concise technical diagrams, charts, and animated explanations for teammates, architecture discussions, and PRs. Route through the shared light/dark design system and visual examples; default to 2D, with 3D only when requested."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Technical visuals

Help teammates understand a system or change at a higher level than its implementation.
Show the actors, relationships, and state that explain the idea; leave out detail
that does not help the reader answer their question. Preserve essential topology,
causality, and verified facts. This skill owns explanatory visuals; product UI
redesign belongs to an available UI design skill.

## Visual approach

Use fewer words, generous spacing, familiar shapes, and visible state. Prefer a
plain title and one factual caption to repeated section labels and explanations.
Keep necessary roles, votes, locks, buffers, and intermediate states visible;
simplification must not remove the mechanism being explained.

Use 2D by default. Use 3D, including isometric views, only when requested.
A useful static diagram is a complete result; animate only when motion makes a
sequence or state change easier to understand.

Use the paired light/dark palette rather than inventing colors per figure:
purple processing, blue storage, teal flow, and rose control; orange focus,
green completion, amber waiting, and red failure. Give peer nodes stable identities
and carry their colors into timers, connections, and identifying popups. Keep
labels and symbols so meaning survives without color. In dark mode, colored
interiors are restrained tints above a neutral charcoal stage; reserve stronger
color for identity outlines, payloads, and state. Keep text and boundaries legible.
Exact values live in the tokens, not in this entrypoint.

## Find the right resource

Read the design system, then load only the resources relevant to the task.

| Need | Route |
| --- | --- |
| Color, typography, spacing, density, mobile sizing | [Design system](references/design-system.md); canonical [color tokens](examples/tokens.js) |
| Infrastructure, data structures, decisions, streaming, and component symbols | [Shape vocabulary](references/shapes.md); rendered library in the [studio](examples/index.html#shape-library); reusable [SVG shape source](examples/shapes.js) |
| A small, visual GitHub pull request with reproducible evidence | [Pull request design system](references/pull-requests.md); [PR examples](examples/pull-requests/index.html) |
| Concise visual storytelling and animation precedent | [Blog visual lab](examples/blog/index.html); select a model below and inspect its same-named JavaScript source |
| A supplied diagram, screenshot, dataset, codebase, or post series | [Input contracts](references/inputs.md) |
| 2D architecture, flow, chart, or before/after figure | [2D playbooks](references/2d.md) |
| Explicitly requested spatial explanation | [3D playbooks](references/3d.md) |
| Good/bad comparisons, iteration lessons, and runnable checks | [Examples and review commands](references/examples.md) |
| Theme checks, animation checks, exports, or final handoff | [Delivery and verification](references/delivery.md) |
| Dark palette provenance or color adaptation | [PlanetScale precedent](references/dark-palette.md) |
| Shorter titles, labels, and captions | [Write clearly](../write-clearly/SKILL.md) |

## Turn a code change into a clear pull request

For PR descriptions, use the [pull request design system](references/pull-requests.md)
and [prepare-pull-request](../prepare-pull-request/SKILL.md). Start from the final
diff and actual verification: identify the trigger, old behavior, new behavior,
and the few actors or states that explain the change. Synthesize that into a short
problem/solution paragraph and a high-level overview; do not diagram every function
or narrate files in diff order.

Use `## Problem & Solution Overview` and `## Testing Done` as the two body sections,
unless a required repository template overrides them. Place supporting headings
under these. Keep one compact overview diagram visible; under Testing Done, start
each meaningful scenario with its diagram and collapse commands, responses, and
logs in “Commands and results.” Preserve visible material limits. Omit diagrams
that add no information, and do not force three scenarios onto every change.

Choose a precedent by what the reviewer needs to understand:

| Pattern | Editable PR body | What to borrow |
| --- | --- | --- |
| Service orchestration and terminal outcomes | [Cache lookup](examples/pull-requests/cache.md) | Client/API/cache/store overview; cold, warm, and missing-record paths with responses and cache-fill evidence |
| User-visible state and recovery | [Form retry](examples/pull-requests/retry.md) | Visible draft state; success, retained input after failure, and retry with persisted-result evidence |
| Capacity boundaries and backpressure | [Bounded queue](examples/pull-requests/queue.md) | Occupied slots; acceptance, rejection at capacity, and recovery after draining |

Preview these in the [PR gallery](examples/pull-requests/index.html). Reuse their
structure and visual vocabulary, not their fictional commands or outputs. Use
GitHub-renderable Markdown, static images or Mermaid, and native disclosures;
no custom page runtime in a PR. Prefer shallow horizontal figures with explicit
widths (the examples use 448px), readable phone labels, and consistent component
shapes across overview and scenarios. A diagram explains behavior; only observed
execution supports a testing claim. Replace illustrative transcripts with evidence
from the reviewed revision, or explicitly say what was not run.

## Learn from the blog visuals

The blog demos are the primary precedent for concise, styled, teammate-facing
explanations. Open a relevant page in both themes and inspect its implementation;
the gallery works directly from local files without a running server.
Choose by the relationship being taught, not merely by matching the topic.

| Teaching problem | Start here |
| --- | --- |
| Repeated database round trips versus batching | [N+1 queries](examples/blog/n-plus-one-sql-query.html) |
| Concurrent updates, stale versions, and guarded retries | [Optimistic locking](examples/blog/optimistic-locking.html) |
| Request amplification and redundant downstream work | [Fanout](examples/blog/fanout.html) |
| Ordered history, copying, buffering, lag, and recovery | [Replication](examples/blog/replication.html) |
| Accumulating evidence, phases, local versus global agreement | [Distributed transactions](examples/blog/distributed-transactions.html) |
| Information spreading and recipient state changing on arrival | [Gossip](examples/blog/gossip-protocols.html) |
| Independent timers, heartbeats, and a clearly identified outcome | [Failure detectors](examples/blog/failure-detectors.html) |
| Stable identities, roles, terms, and votes | [Leader election](examples/blog/leader-election.html) |
| Stable record colors, routing, and ordered destination logs | [Kafka partitioning](examples/blog/kafka-partitioning.html) |
| Capacity, free space, memory paths, locality, and measured versus illustrative charts | [The Big Database at Work](examples/blog/the-big-database-at-work.html) |

Copy the useful teaching pattern and minimum source into the requested project;
replace example assumptions with the task's facts. Do not create a runtime
dependency on the skill directory or modify an installed copy. For a requested
post series, inventory all source figures and meaningful states; merge overlapping
lessons without losing their source coverage.

## Build and verify

Establish the reader's question, source facts, delivery width, themes, and output
format. Choose the smallest useful artifact: Mermaid for simple relationships,
SVG for precise figures, HTML/SVG for interaction, a plotting tool for measured
charts, or an actual screenshot for application evidence.

For animation, follow the blog patterns: payloads travel on their actual routes,
recipients change on arrival, and completed progress remains visible. Autoplay
while visible, with pause, step, and replay; respect reduced motion and suspend
hidden work. Preserve state across theme and layout changes.

Apply the delivery checks at the real reading width and on a phone. Inspect the
rendered states and controls in both supported themes, not just the source or a
contrast score. Retain editable source and report what was verified. Use the
linked review commands when adapting a bundled demo; do not load every example
or build an application when a small figure answers the question.
