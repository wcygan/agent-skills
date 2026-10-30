# Writing repeated items

Use for collections readers scan or compare: feeds, cards, table summaries,
notifications, and session lists. These rules supplement ordinary prose editing;
they do not impose a sentence template on articles, stories, or descriptive headings.

## Choose a structure for the reader's task

1. Identify what readers need to distinguish: topic, action, status, severity, or
   outcome. Put that information early; remove shared openings such as “This issue
   reports that.” If every item starts with the same verb, check whether the topic
   or object would be a more useful starting point.
2. Prefer direct actor–action–object sentences when describing events. Omit a shared
   actor when context makes it clear. Use commands for actions, ongoing forms for
   observed ongoing work, and completed forms for verified outcomes. A mixed-state
   session list must not imply that every session is active or complete. Topic
   titles such as “Cache eviction” remain useful for retrieval and reference.
3. Use a common structure, information order, vocabulary, and level of detail within
   each comparable group. Choose useful fields before generating the batch; a shared
   component or template can keep that contract stable. Distinct item types may
   need different structures. Show meaningful missing values as unknown or unavailable
   rather than inventing data or silently implying equality.
4. Make differences in wording, emphasis, detail, and length reflect differences
   that matter. Keep qualifications even when they make an item longer. If only one
   item names a version, language, or metric, establish its relevance or place it in
   comparable metadata. Don't imply the other items lack it. Show reliable counts
   in a consistent field or chart with the same unit, denominator, and time window;
   otherwise state that they are unavailable. Keep evidence accessible in detail views.
5. Express status or sentiment plainly when it serves the task and the evidence
   supports it. “Users report crashes” is more accurate than “Users hate the app”
   when reviews only describe failures. Preserve mixed feedback and uncertainty;
   the purpose of a complaints dashboard does not make every observation negative.

When front-loading and grammatical uniformity conflict, prioritize accurate meaning
and the reader's distinguishing cue. A separate status field often lets the title
lead with its topic. Never imply success, severity, frequency, or causality just to
make items read alike. Follow the audience's language and established UI conventions.

## Examples and review

| Context | Weak collection | Better collection | Decision |
| --- | --- | --- | --- |
| Issue summaries | “The issue reports a login crash”; “The page describes a stalled upload” | “Login crashes after token expiry”; “Upload stalls after connection loss” | Put the failing operation first; keep parallel structure |
| Active tasks with visible status | “Working on login”; “Working on uploads” | “Fixing login crashes”; “Resuming interrupted uploads” | Drop shared filler and name the distinct operation |
| Mixed session states | “Fixing login”; “Fixing upload” when only the first is active | “Login crashes — In progress”; “Upload retries — Complete” | Use topic plus verified status; don't infer state from a title |
| Explanatory sections | “Follow the tree”; “Keep going” | “Index traversal”; “Leaf lookup” | Preserve descriptive headings rather than forcing verbs |
| Feedback themes | “Users love chess” when comments include praise and crashes | “Users praise chess lessons but report crashes” | Preserve mixed evidence |

Examples are illustrative; their causes and statuses are not established facts.

Review a representative batch, including a long item, mixed or unknown status,
missing metadata, and an exception. Read only the beginnings: can readers distinguish
the items? Then read each full item: does the same kind of information occupy the
same place, and does each variation have a reason? For UI work, inspect the actual
narrow layout, wrapping, truncation, and accessible names. Keep identifying words
visible and provide access to essential detail. This review is a heuristic, not a
measured improvement in human reading speed.

## Research and limits

- Nielsen's [link-scanning study](https://www.nngroup.com/articles/first-2-words-a-signal-for-scanning/)
  supports distinctive, informative beginnings. Its truncated-link test does not
  establish a universal two-word limit. The [F-pattern research](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/)
  describes a common scanning pattern with variation across tasks and layouts.
- Frazier et al.'s [parallel-structure study](https://link.springer.com/article/10.3758/BF03198303)
  found faster reading of structurally similar second clauses in conjoined sentences.
  Applying this to separate UI items is a design inference, not a directly tested
  dashboard result. Direct sentence structure is a useful default, not a ban on
  passive voice or a claim that every English reader parses every sentence alike.
- Mackinlay's [graphical-presentation paper](https://courses.ischool.berkeley.edu/i247/f05/readings/Mackinlay_APT_TOG86.pdf)
  develops expressiveness criteria for graphics. Using meaningful variation in text
  is an analogy; it does not prove that every difference in sentence length misleads.
- Kousta et al.'s [emotion-word study](https://pubmed.ncbi.nlm.nih.gov/19591976/)
  concerns processing verbal stimuli. It does not establish that emotionally stronger
  dashboard wording improves decisions. Let evidence determine sentiment and intensity.
