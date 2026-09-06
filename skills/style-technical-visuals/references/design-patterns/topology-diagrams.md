# Diagram Structure and Exact Ports

Use this procedure for diagrams with connected nodes. The working examples live in `../gallery/demos/`.

## 1. Assign shapes and roles

Choose shapes from the meaning of each node before placing nodes.

| Shape | Meaning | Example |
| --- | --- | --- |
| Cylinder | Database or durable sink | `outbox.html`, `consumer-replay.html` |
| Server panel with indicator strip | Service, transaction, consumer, or Raft node | `deadlock.html`, `raft.html` |
| Folded document | Record, row version, statement, or partition | `mvcc.html`, `consumer-groups.html` |
| Divided table row | Stored row or index key | `deadlock.html`, `gap-locks.html` |
| Queue with visible slots | Stream or bounded buffer | `outbox.html`, `backpressure.html` |
| Hexagon | Transform or window operator | `backpressure.html`, `watermarks.html` |

Use a short shape key when one shape has a diagram-specific meaning. Keep the same meaning throughout that diagram.

Use MySQL, Kafka, and Flink SVG marks when they identify the actual technology. Keep generic systems generic.
The examples contain inline Simple Icons paths with source and license comments. Reuse these assets with their provenance.

Render decorative marks with `aria-hidden="true"` beside visible technology names. Use `currentColor` and a consistent 20–24 pixel size.
Select the scene by its unique ID or accessible label; a page can contain several logo SVGs.

Completion: every shape and logo has an explicit role in the explanation.

## 2. Place nodes and labels

Use one fixed SVG `viewBox` for nodes, wires, arrowheads, and packets. Scale the whole scene to the available width.
Store each node's `id`, `kind`, `x`, `y`, `width`, and `height` once. Derive drawing geometry and connection ports from these bounds.

Arrange a pipeline in reading order. Put each buffer between the stages that write and read it.
Group partitions by owner when this removes unrelated wire crossings. Show the grouping rule in a label.
Use direct leader-to-follower connections for Raft messages.

Size nodes for the longest label across every mode and step. Keep text clear of cylinder caps, folded corners, and connection ports.
Use a database container around records that share a transaction. Mark containers separately from ordinary nodes for collision checks.

Paint layers in this order:

1. Container backgrounds and boundaries.
2. Connection wires and arrowheads.
3. Node surfaces and labels.
4. Moving packets.

Internal database wires must remain visible between the container boundary and its records. See `outbox.html` for this layer order.

Completion: every state fits inside the stage, with separate labels and clear space for connections.

## 3. Derive ports and routes

For bounds `(x, y, w, h)`, derive these face centers:

| Face | Port |
| --- | --- |
| Left | `(x, y + h / 2)` |
| Right | `(x + w, y + h / 2)` |
| Top | `(x + w / 2, y)` |
| Bottom | `(x + w / 2, y + h)` |

For cylinders and hexagons, these bounds must describe the actual outline extrema. Keep port calculations independent of label positions.

Choose facing ports first. Use a straight segment when the centers align.
Otherwise, use the fewest orthogonal bends that clear unrelated nodes and labels.
The first and last segments must leave and enter perpendicular to their node faces.

Use a shared trunk for fanout. Use an explicit corridor for a return path or an intervening obstacle.
Check the corridor against every state. Record why a route needs a detour.

Generate one ordered point list from source to destination. Derive the SVG path and verification metadata from that list.
Preserve exact coordinates, including half-pixels; rounding each endpoint independently causes drift.

Completion: every route starts and ends on its declared ports, with no unrelated node or label crossings.

## 4. Center directional arrowheads

Attach a marker to the path's destination. Match its color to the wire's semantic token.
Use `fill="none"` and a 1.5-unit stroke for the wire.

```html
<marker id="arrow-info" viewBox="0 -4 8 8"
        refX="8" refY="0" markerWidth="8" markerHeight="8"
        markerUnits="userSpaceOnUse" orient="auto">
  <path d="M 0 -3 L 8 0 L 0 3" fill="none"
        stroke="var(--info)" stroke-width="1.3" />
</marker>
<path d="M 220 105 H 600" fill="none" stroke="var(--info)"
      stroke-width="1.5" marker-end="url(#arrow-info)" />
```

The marker tip is `(8, 0)`. Matching `refX` and `refY` places that tip exactly on the path endpoint.
The symmetric wings center the arrowhead on the incoming wire. `orient="auto"` points it along the final segment.

Center the tip on the destination face, pointing toward the node center. Keep the arrowhead outside the node's label area.
Use the face boundary as the endpoint, rather than extending the wire to the node's interior center.

Use unique marker IDs within each SVG. Keep marker dimensions stable when wire thickness changes.

Completion: left, right, top, and bottom arrivals have centered tips, correct direction, and no visible gap or overshoot.

## 5. Animate and verify

Read [traffic-animation.md](traffic-animation.md) before adding packet motion or automatic playback.
Reuse the route path verbatim for each native SVG packet.

Check every mode and step at desktop and compact widths. Verify:

- Node labels fit their bounds.
- Nodes, labels, and wires avoid unintended intersections.
- Every path endpoint equals its declared port.
- Every segment is orthogonal and every arrow points toward its destination.
- Moving packets stay centered on their wire, including bends and arrival.
- Container backgrounds leave internal routes visible.

The repository checks in `tests/browser/gallery_geometry.js` and `tests/browser/gallery_playback.js` demonstrate these assertions.
Inspect browser screenshots as well; metadata checks cannot detect every painting or stacking error.
