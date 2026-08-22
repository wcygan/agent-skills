---
name: eli5
description: Create a beginner-friendly visual explainer with big pictures and few words as one self-contained HTML document. Use for ELI5 explanations of modules, tradeoffs, incidents, and unfamiliar topics.
license: MIT
metadata:
  author: William Cygan
  version: "0.3.0"
  inspiration-url: https://github.com/anthropics/claude-plugins-community/blob/794af9e63d07fad17087dcab61f21f44cb48effd/eli5/skills/eli5/SKILL.md
  inspiration-revision: 794af9e63d07fad17087dcab61f21f44cb48effd
---

# ELI5

Create one picture-first HTML explainer for a reader with no background
knowledge.

## Visual rule

**Big pictures. Few words.**

Make the visual carry the explanation. Give each panel one dominant picture
and no more than one short sentence. Put supporting detail behind disclosures.

## Establish the explanation

Identify the one question that the page must answer. Use the topic and audience
from the request. Ask one question only when either is unclear.

Inspect authoritative evidence before you explain a codebase, tradeoff, or
incident. Separate verified facts from the analogy. State uncertainty when the
evidence does not establish a cause.

## Design the story

- Start with the outcome or main idea.
- Use the fewest panels that preserve the causal story.
- Prefer concrete objects, arrows, timelines, and before-and-after states.
- Add one repeatable interaction when it lets the reader run the mechanism.
- Use one familiar analogy only when its limits remain clear.
- Define each necessary term in plain language.
- End with one short recap and one important limitation.

## Build the document

- Produce one self-contained `.html` document.
- Embed every required style, script, and visual.
- Make the document work without network access.
- Use inline SVG, CSS shapes, and diagrams that carry information.
- Use large type, strong contrast, and a clear reading order.
- Give arrows, labels, and controls dedicated layout space.
- Use semantic HTML, useful labels, and reduced-motion support.
- Make the layout work on narrow and wide screens.
- Add motion only when it clarifies sequence or causality.

Save the document when file access is available. Otherwise, return the complete
HTML document in one code block.

## References

Read [references/style-guide.md](references/style-guide.md) before you create
or restyle an HTML explainer. Apply its layout, color, motion, and viewport
rules.

Read [references/mysql-index-example.html](references/mysql-index-example.html)
when the explainer needs multiple SVG diagrams, sequential interactions, or
responsive controls. Use it as the tested implementation of the style guide.

## Verify and deliver

Preview the page when the environment supports it. Check narrow, medium, and
wide layouts. Fix clipping, overflow, overlap, illegible text, broken controls,
and unclear visual order. Run each interaction through its initial, active,
complete, and repeat states.

Return the document link or path. Add one sentence that tells the user how to
move through the visual story.
