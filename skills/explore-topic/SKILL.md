---
name: explore-topic
description: Explore a broad topic and produce a landscape map of core ideas, vocabulary, viewpoints, open questions, and representative resources. Use for broad orientation, learning paths, or discovery before a bounded research question exists.
license: MIT
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Explore a Topic

Turn broad curiosity into a navigable topic landscape. Favor representative
breadth before deep investigation.

Produce the result in the conversation. Write a file only when the user asks
for one.

## Route nearby work

Use this skill when the user needs orientation across related ideas and
resources.

Route these nearby jobs to their owning skill:

- Use `research` for a bounded question, primary-source findings, and a
  repository Markdown report.
- Use `find-skills` to find an installable agent capability.
- Use `prototype` to build a temporary artifact that answers a design question.
- Use the relevant implementation skill after the user selects an approach.

Continue when exploration itself is the requested result.

## 1. Frame the exploration

Restate the topic, purpose, known context, and useful constraints. Label every
assumption that the user did not state.

Ask a question only when a wrong interpretation would change the domain,
safety boundary, or output. Otherwise, make a narrow assumption and continue.

When the user gives no bounds, use these first-pass limits:

- four to seven landscape dimensions;
- six to twelve representative resources; and
- two to four learning trails.

The frame is complete when the topic, purpose, scope, depth, and freshness
needs are explicit.

## 2. Build the landscape

Choose dimensions that expose meaningful structure. Consider these lenses only
when they fit the topic:

- foundations and history;
- core concepts and vocabulary;
- schools, perspectives, or competing models;
- important people, organizations, or communities;
- current practice, tools, and examples;
- debates, tradeoffs, and unresolved questions;
- adjacent fields and useful connections; and
- recent changes or active frontiers.

For each selected dimension, identify its central idea, representative
evidence, confidence, and unanswered questions.

Follow promising connections across dimensions. Add a new dimension only when
it changes how the user can navigate the topic.

The landscape is complete when each selected dimension contains a distinct
idea and a supported reason for inclusion.

## 3. Gather a source mix

Use live search when sources, links, or topic details can change. Use supplied
or local sources first when the user provides a corpus.

Select sources by their role:

- **Primary:** original work, official documentation, specifications, data, or
  direct statements.
- **Secondary:** strong surveys, books, courses, histories, or explainers that
  connect primary material.
- **Practical:** tutorials, tools, projects, exercises, or datasets that support
  active learning.
- **Community:** forums, talks, essays, or discussions that expose experience
  and emerging debate.

Use primary sources for canonical definitions and factual claims. Use secondary
sources for context and accessible explanations.

Treat community sources as labeled perspective or discovery evidence. Their
popularity does not establish factual authority.

Open each candidate resource before recommending it. Confirm its subject,
creator, availability, and relevant date when tools permit.

Annotate each recommended resource with:

- its title, creator, and link or location;
- its source type;
- why it is useful;
- its expected knowledge level;
- its freshness when time matters; and
- any cost, paywall, language, or access constraint.

Prefer a small annotated collection over a long unranked list.

## 4. Compare the ideas

Group related ideas and show how they connect. Distinguish these evidence
states:

- broad agreement;
- active disagreement;
- different terms for similar ideas;
- similar terms for different ideas;
- historical change; and
- speculation or incomplete evidence.

Represent important disagreements in their strongest supported form. Match
attention to evidence strength and practical importance.

Separate sourced facts, source interpretations, and your synthesis. State
uncertainty where the sources do not support a firm conclusion.

## 5. Create learning trails

Turn the landscape into ordered routes. Adapt each route to a real user goal,
such as:

- quick orientation;
- conceptual depth;
- practical application; or
- alternative perspectives.

Each trail must state its goal, ordered resources, expected result, and likely
next branch.

The trails are complete when the user can choose a direction without another
broad search.

## 6. Produce the Topic Exploration Map

Use this structure:

```markdown
# Topic Exploration Map: [Topic]

## Exploration frame
## Landscape map
## Core vocabulary
## Perspectives and tensions
## Representative examples
## Resource trails
## Open questions
## Suggested next branches
## Sources and limitations
```

Link sources near the claims they support. Keep resource annotations beside
their recommendations.

Use a table or diagram only when it makes relationships easier to understand.

## Stop deliberately

Stop the first pass when all these conditions hold:

- the frame defines the exploration boundary;
- each selected dimension has representative evidence;
- each recommended resource has a useful annotation;
- major tensions and uncertainty are visible;
- at least two next branches are actionable; and
- known coverage gaps are explicit.

Also stop when the user budget ends, access fails, or reliable evidence is
unavailable. Report the limiting condition and the best next action.

## Handle important variants

- For a very broad topic, produce a first-pass map and let the user select a
  branch.
- For a disputed topic, describe evidence strength and avoid unsupported
  balance.
- For a fast-changing topic, verify current sources and state the search date.
- For a supplied corpus, distinguish corpus coverage from added sources.
- For an inaccessible resource, label the constraint and suggest an accessible
  alternative when possible.
- Without live search, state that current links and resource status remain
  unverified.
- For high-stakes topics, use authoritative sources and keep the result
  educational rather than prescriptive.

## Activation examples

Use this skill for requests such as:

- “Help me explore the ideas around local-first software.”
- “I want to understand the agent evaluation landscape.”
- “Show me different perspectives and resources about urban planning.”
- “Map this topic before I choose what to study.”

Route requests such as:

- “Verify whether this API supports streaming.”
- “Implement one of these approaches.”
- “Find an installable React testing skill.”
