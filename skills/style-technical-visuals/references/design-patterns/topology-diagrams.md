# Topology Diagrams and Flow Mechanics

Patterns for drawing distributed systems, database topologies, proxies, tiers, and interconnects.

## Tiered Multi-Column Architecture

Topologies arrange nodes into strict left-to-right or top-to-bottom pipeline tiers:

1. **Left / Top**: Clients, application servers, requesters (`.app-node`).
2. **Center**: Intermediaries (proxies, load balancers, PgBouncer, connection poolers, routers).
3. **Right / Bottom**: Data plane (primary database, replicas, partitioned shards).

### Node Dimensions and Fixed Coordinates
Never use fluid flex wrapping for nodes connected by SVG wires. Fix node positions so coordinates remain absolute:
```css
.node {
  position: absolute;
  border: 1px solid var(--border-node);
  border-radius: 4px;
  background: var(--panel);
  text-align: center;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.app-node    { top: 24px; width: 120px; height: 52px; }
.proxy-node  { top: 154px; left: 360px; width: 140px; height: 56px; }
.shard-node  { top: 280px; width: 110px; height: 60px; }
```

## Rectilinear and Direct Vector Interconnects

Wires between tiers must connect card faces at exact center lines:
- **Horizontal run**: `y = top + height / 2`
- **Vertical run**: `x = left + width / 2`

```javascript
// Example: calculate 90-degree dogleg path from proxy bottom center to shard top center
const proxyBottomX = proxy.left + proxy.width / 2;
const proxyBottomY = proxy.top + proxy.height;
const shardTopX = shard.left + shard.width / 2;
const shardTopY = shard.top;
const midY = (proxyBottomY + shardTopY) / 2;

const pathData = `M ${proxyBottomX} ${proxyBottomY} V ${midY} H ${shardTopX} V ${shardTopY}`;
```

### Interconnect Styling
- Inactive line: `stroke: #454545; stroke-width: 1.5px; fill: none;`
- Active / Queued line: `stroke: rgba(243, 88, 21, 0.4); stroke-dasharray: 4 4;`
- Trunk + Rail pattern: When fanout originates from one primary, draw a single horizontal trunk to a vertical rail, then branch to replicas.

## Direct Wire Labels

Place floating labels directly on or adjacent to wires rather than relying on detached legends:
```css
.wire-label {
  position: absolute;
  font-size: 9px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text-dim);
  background: var(--panel);
  padding: 1px 5px;
  z-index: 2;
}
```

## Secondary Legend Block
When multiple traffic types share the canvas, provide a bottom legend with circular dot indicators:
```html
<div class="legend">
  <span><i style="background: var(--accent)"></i>write → primary</span>
  <span><i style="background: var(--info)"></i>binlog → replicas</span>
  <span><i style="background: var(--good)"></i>read ← replica</span>
</div>
```
