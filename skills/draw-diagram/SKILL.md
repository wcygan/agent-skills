---
name: draw-diagram
description: "Draw a quick diagram that answers one question about a system, flow, state machine, sequence, or change, as Mermaid in the reply or a file. Use for 'draw this', 'diagram this', 'show me how X flows', a quick visual, or when three or more parts are easier to see than to read. For a full HTML page, slides, or video, use visual-explainer."
license: MIT
metadata:
  kind: component
  maintenance: local
---

# Draw diagram

**Draw the smallest picture that answers the reader's question, and check that
it renders before you show it.**

1. Name the one question the picture answers. If prose answers it in two
   sentences, write the sentences and stop.
2. Draw only what you have read in the code, the config, or the data. Leave an
   unknown relationship out and say it is unknown; a reader trusts every line.
3. Pick the form from the question:

   | Question | Mermaid form |
   | --- | --- |
   | What talks to what, or where does data go? | `flowchart LR` |
   | In what order do the parts act? | `sequenceDiagram` |
   | What states can it be in, and what moves it? | `stateDiagram-v2` |
   | What is stored, and how is it related? | `erDiagram` |

4. Draw the mechanism, not the names. Every arrow carries a verb and, where it
   matters, a condition or a number: `miss: reads`, `polls every 30s`. Label
   parts in the reader's words, not in identifiers.
5. Keep one diagram to about seven parts. For more, or to teach how the parts
   fit, draw a short series: each diagram repeats the last and adds one part or
   one edge. Put one sentence under each that states what it shows.
6. To show a change, draw before and after with the same layout, and mark only
   what was added or removed.
7. In a flowchart, give every part a shape and a color that say what kind of
   thing it is. Use the same kind for the same thing across a series.

   | Kind of part | Shape | Class |
   | --- | --- | --- |
   | Reads or checks, changes nothing | `id[...]` | `inspect` |
   | A decision, worded as a question | `id{...?}` | `inspect` |
   | Changes state | `id[...]` | `change` |
   | A durable record: commit, file, row | `id[...]`, or `id[(...)]` for a store | `record` |
   | Something outside this system | `id([...])`, or `id[(...)]` for a store | `outside` |
   | A failure or a stop | `id[...]` | `stop` |

   ```
   classDef inspect fill:#c3e0ff,stroke:#1680f3,color:#1c1c1c
   classDef change fill:#bfe3df,stroke:#1a8a7d,color:#1c1c1c
   classDef record fill:#e3d5ff,stroke:#9b35d6,color:#1c1c1c
   classDef outside fill:#f0d3bf,stroke:#e8730c,color:#1c1c1c
   classDef stop fill:#ffecee,stroke:#e72e3b,stroke-width:2.5px,color:#cd2834
   ```

   Copy only the classes the diagram uses, and add `class a,b inspect` lines.
   The shape and the label must carry the meaning without the color. Then run
   `python3 -B <skill dir>/scripts/check_style.py FILE.mmd` and fix each line
   it prints. Under the diagram, say what each color means.
8. Render it with a Mermaid renderer the environment has, and look at the
   result: no syntax error, no clipped or overlapping label, arrows pointing
   the way the code runs. Fix the source and render again. If nothing here can
   render Mermaid, say the diagram is unrendered.

For a state machine that must be checked against rules, use `statechart`. For
labels and captions, use `write-clearly`.

**Reply:** the diagram, one sentence that states what it shows, and anything
you left out because you could not confirm it. No account of how you made it.
