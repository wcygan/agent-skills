# Tables, Matrices, and Relational Layouts

Visual patterns for database schemas, table row locks, and high-density node grids.

## Relational Database Table Sampler

Relational tables in editorial explainers use SVG or precise CSS grids with explicit 1px rules:

```html
<div class="table-wrap">
  <svg class="table-svg" viewBox="0 0 820 286" xmlns="http://www.w3.org/2000/svg">
    <!-- Header background band -->
    <rect x="0" y="0" width="820" height="46" fill="#181818" />
    
    <!-- Primary Key Highlight: Primary key header text uses accent blue -->
    <text x="16" y="24" class="th-name th-pk">id</text>
    <text x="16" y="38" class="th-type">BIGINT PK</text>
    
    <!-- Standard Column Headers -->
    <text x="100" y="24" class="th-name">email</text>
    <text x="100" y="38" class="th-type">VARCHAR(255)</text>
    
    <!-- Interior Gridlines -->
    <line x1="0" y1="46" x2="820" y2="46" class="grid-header-line" />
    <line x1="0" y1="94" x2="820" y2="94" class="grid-line" />
    <line x1="100" y1="0" x2="100" y2="286" class="grid-line" />
  </svg>
</div>
```

### Table Border and Grid Rules
- **Container border**: `2px solid var(--border)` with `border-radius: 4px`.
- **Header separator**: `stroke: rgba(255, 255, 255, 0.22); stroke-width: 1.5px;`
- **Interior cell gridlines**: `stroke: rgba(255, 255, 255, 0.10); stroke-width: 1px;`
- **Row heights**: `48px` per table row allows comfortable multi-line type annotations.

### Locked or Active Row Emphasis
To depict transactional locks, slow queries, or active cursor positions:
- Render a tint rectangle over the row: `fill: rgba(243, 88, 21, 0.08)`.
- Draw an accent border around the row: `stroke: #f35815; stroke-width: 1.5px;`.
- Render a lock badge: `fill: #f35815; text: "in-tx • lock"` inside a dedicated status cell.

## Multi-Column Index Comparison Board

When teaching index efficiency (e.g. leftmost prefix), display dual boards side-by-side:
- **Left Panel**: Optimal index ordering (`(user_id, created_at, region)`).
- **Right Panel**: Sub-optimal index ordering (`(region, created_at, user_id)`).
- **Dense row cells**: `34px × 22px` rounded pills representing sorted index tuples.
- **Three-state coloring**:
  - Dim default: `rgba(255, 255, 255, 0.10)` (untouched rows).
  - Yellow scan: `#d19f03` (wasted scan rows).
  - Orange hit: `#f35815` (matched rows returned).
- **Live efficiency counter**:
  `scanned 12/96 · returned 4 · efficiency 33%` vs `full index scan (96/96)`.

## Massive Node Matrices (e.g. 768 Servers)

When communicating physical scale:
- Use an HTML `<canvas>` element for thousands of nodes rather than separate DOM elements.
- Render each server node as a tiny 2px–4px square with 1px gutter spacing.
- Animate node activity via canvas pixel buffer updates, flickering nodes between idle dark gray (`#2b2b2b`) and active orange/green bursts.
