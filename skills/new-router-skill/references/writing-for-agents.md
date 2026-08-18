# Writing the body for agents

The `writing-for-agents` skill is the authority on this discipline; this file
is the recipe applied when composing a router skill's body.

## The description is a context pointer

The description is always loaded, so it does its triggering work in the fewest
words: front-load the leading word, list the branches that should fire, and
state what the router returns. Cut identity the body already carries. One
trigger per branch — synonyms are one branch written twice.

## Leading words

Reach for compact concepts already in the model's pretraining (`route`, `gate`,
`pointer`, `map`) and repeat them as tokens, never as sentences. A made-up
word pays definition tokens for what a pretrained word gives free.

## Phrase positively

Steer by the target behaviour, not the ban: "state the selected skill and the
evidence" beats "don't forget to say which skill you picked". A prohibition
earns its place only as a hard guardrail, and even then it is paired with the
positive target.

## Completion criteria

Every step ends on a checkable, exhaustive bound. A vague bound invites
premature completion — sharpen the bound first; split the sequence only when
the bound is irreducibly fuzzy and the later steps are pulling attention away
from the one in front.

## Prune

- One meaning in one place: duplication costs maintenance and inflates a
  meaning's prominence past its real rank.
- The environment is a source of truth too — do not restate what the agent can
  look up cheaply (config files, `--help` output).
- Delete any sentence that changes nothing versus the default; the test is
  model-relative and settled by running the document, not by debate.
- Shorter documents stay relevant. Without pruning, layers of sediment bury
  what is still live.

## Progressive disclosure

Inline what every branch needs; push what only some branches reach into
`references/`, one level deep, behind relative paths from `SKILL.md`. The top
of the file stays legible, and attention lands on the live steps.
