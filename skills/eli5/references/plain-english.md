# Plain English for ELI5 Pages

Use this guide when you write or revise words that a human will read.

Write for a reader who knows nothing about the topic. Preserve every fact and
technical detail that the explanation needs.

## Lock the meaning

List the meaning that must stay unchanged before you rewrite anything.

Preserve these items:

- Facts, uncertainty, limits, names, dates, numbers, and units.
- Commands, code, queries, file paths, identifiers, and URLs.
- The order of events and the cause of each result.
- Technical terms that accuracy requires.
- Machine-readable values and accessible relationships.

Change only the prose unless the user asks for a meaning change.

## Write for one reading

- Put the actor before the action.
- Use concrete verbs.
- Give each sentence one idea.
- Prefer common words when they keep the exact meaning.
- Use the same word for the same thing.
- Name the object when a pronoun could be unclear.
- Use present tense to explain how a system works.
- Put the result before supporting detail.
- Remove introductions that delay the main idea.
- Keep each panel to one short sentence.

Use short sentences. Split a sentence when it contains two separate actions.

## Keep necessary terms

Keep a technical term when a common word would change the meaning.

Define that term once, near its first use. Use common words in the definition.

Use the technical term consistently after the definition.

Examples:

- “A queue is a line of work waiting to run.”
- “A cache keeps a nearby copy for faster access.”
- “A primary key identifies one row.”
- “A range scan reads an ordered group of values.”

Replace formal phrases with direct phrases when the meaning stays exact:

| Formal phrase | Direct phrase |
| --- | --- |
| `perform a lookup` | `search` |
| `terminate the scan` | `stop the scan` |
| `subsequent page` | `next page` |
| `prior to` | `before` |
| `in order to` | `to` |
| `is able to` | `can` |
| `utilize` | `use` |

## Write every text layer

Reader-facing text can live outside the visible HTML body.

Review every one of these locations:

- The document title, main title, headings, and short introductions.
- Diagram labels, legends, callouts, and disclosures.
- Button labels and control instructions.
- Initial, active, complete, error, and repeat messages.
- JavaScript strings, `textContent` assignments, and string maps.
- CSS-generated text in `content` properties.
- `aria-label`, `aria-valuetext`, live regions, and help text.
- SVG `title` and `desc` elements.
- Source names and limitation notes.

Use the same terms in visible text and accessible text.

## Match the words to the visual

- Make a button name the action it starts.
- Make a status message name the current action or result.
- Use one verb for each state across the page.
- Label checks, rejected paths, chosen paths, and final results directly.
- Let the picture explain position, shape, and movement.
- Use prose to explain meaning, cause, and limits.
- Put optional detail inside a disclosure.
- Shorten text before you reduce its readable size.

## Rewrite the page

1. Inventory every reader-facing string.
2. Record the facts and technical literals that must stay unchanged.
3. Rewrite static text in page order.
4. Rewrite dynamic and accessible text with the same terms.
5. Read the complete story from start to finish.
6. Run every interaction through all states.
7. Compare the final literals and claims with the source.

The inventory is complete when every visible, dynamic, and accessible string is
accounted for.

The rewrite is complete when every claim matches the source and every panel is
clear on one reading.

## Final check

- Each panel has one main idea.
- Each necessary term has one plain definition.
- Each sentence names a clear actor and action.
- Facts and uncertainty match the source.
- Numbers, units, code, queries, identifiers, and URLs remain exact.
- Dynamic messages use the same terms as static text.
- Accessible text describes the same action as visible text.
- Text fits inside labels, controls, cards, and one target viewport.
- The rewrite adds no unsupported facts, advice, or examples.
