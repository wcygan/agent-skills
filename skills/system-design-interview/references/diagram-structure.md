# Structure system design diagrams

Read this before creating or revising diagrams in the visual library, including
templates, applied lessons, toolbox cards, and production case studies. Use aligned components, clear boundaries, and separate communication lanes
to make architecture maps easy to follow.

## Start with the teaching purpose

Choose one question for each figure: what exists, where it lives, or how one
request travels. Start a case study with a topology overview, then give joining,
sending, receiving, and recovery their own focused figures when relevant.

Show the documented infrastructure and label illustrative deployment choices.
Separate the product's required stores from optional application databases,
caches, and recording storage. Name what each store owns. Explain replication,
message delivery, and consistency separately; one does not establish the others.

Completion: the figure has a clear purpose, and every component and guarantee is
supported or explicitly identified as an assumption.

## Assign shapes and boundaries

| Meaning | Shape and label |
| --- | --- |
| User or participant | Circle with a short name inside |
| Application server, gateway, or load balancer | Rectangle with component name and a short role |
| Database or shared store | Cylinder with technology name and the data it owns |
| Queue or log | Buffer slots or ordered records, with direction or offsets |
| Region, cluster, or worker | Quiet background container with a corner heading |

Use containment for deployment relationships: a pod belongs inside a worker;
an application belongs inside its region. Use arrows for communication and data
movement. When repeating regions, align corresponding components and preserve
their order. Distinguish shards, replicas, and independent deployments by name.

## Plan lanes before drawing connectors

1. Place nodes on a small set of aligned rows and columns. Reserve corridors
   for connectors and separate space for headings and edge labels.
2. Separate signaling or coordination from media or bulk transfer when combining
   them would produce long perimeter routes or crowded crossings. A second
   panel can repeat the relevant users and server; identify it as another view
   of the same components, not additional infrastructure.
3. Put replication between stores, with a direct label such as “async
   replication.” Show its direction and identify optional standby placement.
4. Label DNS arrows as lookup or selection. Show the client's application
   connection separately so DNS is not depicted as carrying application traffic.

Completion: a reader can trace each communication type without following wires
through unrelated nodes, labels, or region headings.

## Keep geometry exact

- Define node bounds once; derive connector ports from them. For a rectangle
  `(x, y, w, h)`, face centers are `(x, y+h/2)`, `(x+w, y+h/2)`,
  `(x+w/2, y)`, and `(x+w/2, y+h)`. Use circle outline points and cylinder
  outline extrema for their ports.
- Leave and enter perpendicular to the destination face. Prefer straight lines
  or short orthogonal paths, with enough clearance for arrowheads.
- Merge connections into one trunk before a shared destination; place one
  arrowhead on its incoming segment. Give each fanout destination its own head.
  Use two heads only when bidirectional traffic is the teaching point.
- Keep nodes, paths, markers, and labels in one SVG coordinate system. Use
  unique marker IDs and marker tips that land exactly at the destination port.
- Draw container backgrounds first, then wires, then node surfaces and labels.
  Routing must clear node interiors even when the node fill hides a wire.
- Recalculate all geometry when moving a node: cylinder body, both faces,
  labels, and connector endpoints move together. Update the whole component
  rather than editing isolated coordinate strings.

## Use consistent spacing and type

Reuse [the shared stylesheet](../assets/styles.css) and its semantic colors.
Use one title/subtitle baseline pattern for each node type, with comfortable
interior padding. Titles carry the component name; subtitles carry one short
role. Keep longer explanations in the caption or a native disclosure.

For architecture maps, use readable component labels and smaller monospace
role labels. Keep region headings quiet and away from connection ports. Labels
belong beside a wire with clearance, rather than centered across its stroke.
Give colors one meaning and reinforce it with direct labels or line styles.
Use restrained strokes and surfaces; alignment should provide the hierarchy.

At compact widths, stack independent panels when possible. If a topology must
stay wide, keep labels readable in a contained horizontal scroller with keyboard
focus and an exploration hint. The page itself must fit the viewport.

## Verify the rendered result

Inspect screenshots of each changed figure at a desktop width and a compact
phone width. Check the actual rendered labels, not only source coordinates:

- Every label fits its node and clears wires, arrowheads, and nearby headings.
- Ports and arrowheads align; every marker reference resolves.
- Shared paths merge cleanly, and separate paths have visible clearance.
- Repeated nodes use consistent sizes, baselines, padding, and stroke weights.
- Shapes and captions explain the diagram without depending on color alone.
- Mobile pages fit; any diagram scroller works with touch and keyboard.
- Figures and native disclosures remain useful offline and without JavaScript.

Repair visible collisions before delivery. Report only checks actually run;
layout verification does not establish the behavior of the depicted system.
