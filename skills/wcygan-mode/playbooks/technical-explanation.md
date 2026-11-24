# Technical explanation

Explain a system, behavior, or change through a concise visual artifact.

1. Identify the reader's question and authoritative facts. Use
   [explain-code](../references/methods/explain-code.md) when behavior is uncertain; leave an unknown
   relationship out of the drawing rather than inventing it, because the reader
   will trust what is drawn.
2. Choose the simplest format that answers the question: Mermaid, SVG, or
   interactive HTML. Default to 2D and use 3D only when explicitly requested.
   For a requested Mermaid diagram, use the quick Mermaid route in
   `visual-explainer` when available. Its HTML route produces an explainer
   page. For an HTML review verdict, use `review-changes`.
3. Verify both meaning and rendered presentation, including controls or export
   when present. Use `write-clearly` for labels
   and the short caption; preserve qualifications and evidence.
4. Deliver the requested artifact. For a PR, incorporate it through
   `prepare-pull-request`.

Complete with the editable artifact, requested preview, source/evidence context,
and any unverified behavior, since a conceptual visual shows intent rather than
execution.
