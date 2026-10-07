# Example page structure

For diagram creation or revision, read [diagram-structure.md](diagram-structure.md) before drawing; it owns layout, typography, connectors, and visual checks.

When adding an example, use the existing page shell and shared sidebar. The example content consists of its title and one question prompt. Copy the `question-prompt` section from an existing example and replace only the statement.

The shared component uses semantic HTML and the styles in `assets/styles.css`:

- `section.question-prompt` is labeled by `question-prompt-title`.
- `h2.question-prompt__heading` contains the decorative SVG question icon and a `strong` label, “Question prompt”.
- `p.question-prompt__text` contains the statement inside `em` for italic emphasis.

Keep one prompt per example page so the heading ID is unique. Keep the icon hidden from assistive technology; the visible heading supplies its meaning. Maintain the shared classes rather than adding per-example styles. The prompt is readable with JavaScript disabled.

## Worked framework template

The Template page is a worked URL-shortener design following all five interview phases. It is an explicit exception to prompt-only example pages. Keep practice assumptions labeled, connect estimates to decisions, and include request responses and failure recovery. Example pages continue to contain no solution guidance.

When adding a toolbox concept, use a visual-first card with a purpose, tradeoff, and `.concept-details` body. The shared dialog script copies its SVG into the popup. Give each concept a unique ID for related-concept links and keep source citations inside its details.

## Mandatory toolbox priority

Every toolbox concept, including standalone recovery concepts, must display an accessible three-star interview study rating: 3 = core knowledge, 2 = common follow-ups, 1 = specialized or nice to know. Set `data-priority` on each article and show filled/empty stars in `.concept-priority` with an accessible numeric label. Rate general interview study value rather than production importance; retain the page legend explaining that question and role can change priorities. Sort cards within every topic group by descending rating, preserving their relative order for ties. Keep the rating in the details popup as well. Completion: every concept has a rating, every group is sorted, and both card and popup expose the same priority.

## Applied toolbox pages

The Applied toolbox sidebar group contains worked lessons, distinct from prompt-only interview examples. Each lesson connects a concrete read and write workload to its chosen keys, shows a good use and a specific bad use, includes a concise diagram, and explains costs and verification. The combinations lesson traces routing, partition selection, and local index lookup together. Update the shared sidebar on every HTML page when adding a lesson.

The Sharding, Partitioning, and Indexing lessons each contain at least five distinct workloads. Every workload needs a short premise, paired good/poor-fit diagrams, a visible outcome, and one write-cost or tradeoff caption. Keep poor-fit judgments tied to that workload, and provide section anchors for navigation.

API-to-database traces use one path/query/body parameter per line and offline SQL syntax highlighting. Format SQL clauses and multi-column definitions across lines. Use MySQL 8.4/InnoDB for index and partition examples; identify the index type, show its DDL, and label schema excerpts as illustrative. Sharding uses Vitess VTGate and a primary vindex in VSchema; show the routing column and vindex type, distinct from a local MySQL index. Pruning claims are expected behavior to verify with EXPLAIN, not measured plans.

Applied workloads lead with a product mockup and a short user scenario. Keep each case’s API, SQL, configurations, good/poor-fit diagrams, and tradeoffs inside a closed native `details.case-implementation` disclosure labeled “How it works.” Product previews use illustrative records, are noninteractive, and remain readable offline without JavaScript.

## Production case studies

Place Case studies immediately below Examples in every shared sidebar. Case studies explain a documented existing architecture rather than ask a design question. Use visual request paths, concise tradeoffs, and links to current primary sources beside the claims they support. Label illustrative rooms and diagrams; distinguish the documented product from a tested deployment. Keep deeper configuration and operational questions in native disclosures.
