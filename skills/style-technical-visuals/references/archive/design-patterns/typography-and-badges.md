# Typography, Numerics, and Status Badges

Visual conventions for technical type hierarchy, metric readouts, and status badges.

## Font Stacks

All technical visuals prioritize high-legibility monospace stacks for code, labels, metrics, and structural diagram nodes:

```css
:root {
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
}
body {
  font: 13px/1.5 var(--font-mono);
}
```

## Hierarchy and Letter Spacing

| Level | Size | Weight | Letter Spacing | Transform / Case | Purpose |
|---|---|---|---|---|---|
| **Eyebrow / Category** | 11px | Regular | `0.08em` | UPPERCASE | Domain category (`blog/caching`, `sharding`) |
| **Title / H1** | 13px–14px | 700 / Semi | `0.08em` | UPPERCASE | Diagram heading |
| **Subhead** | 12px | Regular | Normal | Sentence case | Technical description, opacity `0.6` |
| **Node Label** | 12px | 700 | Normal | Title case / code | Server/proxy name (`PRIMARY`, `app-0`) |
| **Node Role** | 9px | Regular | `0.06em` | UPPERCASE | Sub-role label (`MYSQL · ACCEPTS WRITES`) |
| **Axis / Footnote** | 10px–11px | Regular | Normal | Sentence case | Dim text (`rgba(250, 250, 250, 0.40)`) |

## Tabular Numbers (`font-variant-numeric: tabular-nums`)

All changing metrics, coordinates, latencies, and clock displays must use tabular numbers to prevent layout jitter:

```css
.metric-value,
.time-readout,
.counter,
.stats span b {
  font-variant-numeric: tabular-nums;
}
```

## Large Metric Readouts

Used in migrations, backfills, and benchmark summaries:
- **Hero number**: `38px–44px`, font-weight `700`, letter-spacing `-0.02em`.
- **Unit suffix**: `20px–24px` tinted with semantic state (e.g. `%` in `--accent` while running, `--good` when done).
- **Label**: `10px`, uppercase, `letter-spacing: 0.08em`, placed directly above the number.

## Badges and Pill Containers

### Queue and Count Badges
```css
.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: var(--text-muted);
}
.badge.hot {
  border-color: rgba(243, 88, 21, 0.5);
  background: rgba(243, 88, 21, 0.15);
  color: var(--accent);
}
```

### SVG Table Badges Sizing Rule
In SVG tables, never compute tight text bounding boxes. Compute container rect widths generously:
`rectWidth = textLength + 16px` padding to prevent clipping compound labels such as `in-tx • lock`.
