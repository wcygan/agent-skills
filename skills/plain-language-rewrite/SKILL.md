---
name: plain-language-rewrite
description: Rewrite supplied text or Markdown in plain language while preserving facts, technical artifacts, structure, and the source language. Use when a user asks for a simpler explanation, document, or agent response without a meaning change.
license: MIT
metadata:
  author: William Cygan
  inspiration-url: https://github.com/gvzdv/claudish-to-english
  inspiration-revision: e109e224acbfcc49016f383cc0d178c0b69b4954
---

# Plain-language rewrite

Rewrite prose so a reader can understand it more easily. Preserve meaning and
technical detail.

## Set the output

Use the input language unless the user asks for translation. Use the requested
style. Default to `plain`.

- `plain`: Use common words and short, direct sentences.
- `summary`: Keep the main points and remove nonessential detail.
- `beginner`: Explain necessary terms in simple language. Preserve technical
  details that the reader needs to act.

Ask one question only when the audience or intended meaning is unclear.

## Preserve invariants

Keep these items unchanged unless the user explicitly asks to change them:

- Facts, uncertainty, qualifications, names, dates, numbers, and units.
- Commands, flags, file paths, identifiers, URLs, and code blocks.
- Markdown link targets, table values, headings, and list order.
- YAML frontmatter and other machine-readable blocks.

Use code formatting for inline technical literals. Keep a statement uncertain
when the source is uncertain.

## Rewrite the prose

Use active voice, concrete verbs, and short sentences. Replace unexplained
jargon with common language. Define a necessary technical term once, near its
first use.

Keep the original Markdown structure unless a different structure makes the
request clearer. Do not add facts, advice, or examples that the source does
not support.

## Verify and deliver

Before you return the rewrite, compare its technical literals and factual
claims with the source. Correct a difference or return the original text with
a short explanation when preservation is not possible.

Return only the rewrite unless the user asks for a comparison or explanation.

When the user asks for a file artifact, create a sibling file named
`NAME.plain.md` by default. Overwrite a source file only with direct user
approval. Report the saved path.
