# 2D shape vocabulary

The studio renders 38 symbols and explanatory patterns in both themes. Read this when choosing the visual
vocabulary of an infrastructure or control-flow explanation. Use a consistent shape
for a consistent role and a direct label for the actual component. These are local
diagram conventions, not vendor icons or proof of a system guarantee.

| Category | Shape | Use |
| --- | --- | --- |
| Compute | Rounded rectangle | Service or process |
| Compute | Task lane with input/output ports | Worker |
| Compute | Screen frame | Client application |
| Ownership | Named dashed enclosure | Region, owner, or trust boundary |
| Ownership | Ordinary service outside a named boundary | External system |
| Storage | Cylinder | Persistent structured store |
| Storage | Memory bank with slots | Cache |
| Storage | Bucket | Object/blob storage |
| Data | Header and rows | Table or dataset |
| Data | Labeled partitions in a container | Shards, not replicas |
| Movement | Tray with finite slots | Bounded waiting queue |
| Movement | Offset cells | Retained append-only log |
| Movement | Events on a directed path | Stream |
| Execution | Grouped records | Batch |
| Artifact | Folded-corner document | File, payload, or generated artifact |
| Control | Diamond | Condition; label all outgoing branches |
| Control | Capsule | Entry or terminal state |
| Control | Hexagon | Gate or policy check; label its rule |
| Control | Clock | Wait, timeout, or scheduled wake-up |
| Control | Paired bars with directed branches | Fork/join; state all/any/quorum semantics |

Use only the symbols needed by a scene. A shape library is a vocabulary, not a
requirement to fill a diagram with icons. Separate partitions from copies, waiting
from running, and data flow from control flow. Annotate durability, ordering,
acknowledgment, and trust only when the source establishes them.

Center text on both axes within its usable interior. For a subtitle, center the
combined label group. Keep storage labels below the cylinder cap, table labels in
the header, and partition labels above their cells. Fit text by enlarging or wrapping
the node rather than shrinking important text until it is unreadable.

The canonical gallery renderer is `examples/shapes.js`; the studio uses actual SVG
text bounds to center label groups. Retain that behavior when adapting multi-line
labels to a different font or export pipeline, and check the exported result.

## Category color and structure

Use purple for processing, blue for storage/data structures, teal for movement
and streaming, and rose for control. Use the theme's corresponding Fill token
inside the shape and its category token for outlines. Keep labels neutral.
Category is stable across states; orange focus and labeled status annotations
communicate changes. Never rely on hue alone. External systems need no special
icon: place a normal component outside the named ownership boundary.

Arrays use indexed adjacent cells; linked lists use separated nodes and arrows.
Lists are abstract ordered sequences. FIFO queues have distinct insertion and
removal ends; stacks share one end. Hash tables show buckets and an explicit
collision strategy. Trees have parent-child edges without cycles; graphs may
have cycles. Show algorithm steps on these structures, with the current element,
visited elements, and remaining candidates labeled. Binary search requires order.

## Streaming patterns

Draw time ranges and event relationships, not invented guarantee symbols.
Tumbling windows are adjacent; sliding windows overlap when size exceeds slide;
sessions use inactivity gaps. Label time basis, size, slide, and allowed lateness
when relevant. Joins need keys and a window or interval condition. Watermarks
estimate event-time progress; older events may still arrive.

Delivery examples have an explicit sender/receiver scope: at-most-once allows
loss; at-least-once allows duplicates. Exactly-once managed state may involve
repeated execution after recovery. End-to-end effects additionally depend on
replayable input and compatible sink semantics. The gallery shows illustrative
outcomes, not a simulation or a proof of a guarantee.

Sources: [Flink windows](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/),
[Flink joins](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/joining/),
and [Flink fault tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/).
