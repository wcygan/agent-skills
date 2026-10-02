# Progress, Queues, and Resource Depletion

Patterns for multi-stage migrations, sliding clip-path reveal animations, and capacity exhaustion.

## Sliding SVG Clip-Path Progress Bar

Instead of redrawing complex vector hatching paths on every animation frame, use a static SVG diagonal hatch pattern covered by an animated horizontal `<clipPath>`.

### The Static Hatch + Reveal Pattern
```html
<svg viewBox="0 0 600 24">
  <defs>
    <!-- 45-degree diagonal striped hatch pattern -->
    <pattern id="diagHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
    </pattern>
    
    <!-- Clip rect whose width matches current percentage -->
    <clipPath id="progressClip">
      <rect id="clipRect" x="0" y="0" width="45%" height="24" rx="2" />
    </clipPath>
  </defs>

  <!-- Empty background well -->
  <rect width="100%" height="24" fill="rgba(255,255,255,0.08)" rx="2" />

  <!-- Active filled bar with clip path applied -->
  <g clip-path="url(#progressClip)">
    <rect width="100%" height="24" fill="var(--accent)" />
    <rect width="100%" height="24" fill="url(#diagHatch)" />
  </g>
</svg>
```

### Stage Transitions
1. **Pending Stage**: Dim outline box, dashed or low-opacity border, muted label.
2. **Active Stage**: Highlighted border, active orange fill with animated diagonal shimmer, live percentage readout.
3. **Completed Stage**: Solid green fill (`#30a46c`), checkmark icon (`✓`), status text `DONE`.

## Slot Containers and Pool Exhaustion

When illustrating connection pools, thread workers, or memory caches:

1. **Top Status Bar**: Live counters in a dedicated bar:
   `in use: 5  idle: 2  stuck: 1`
2. **Pool Container**: A defined bounding box representing pool limit (e.g. 8 discrete slots `c0` through `c7`).
3. **Discrete Slots**: Individual connection cards inside the pool:
   - Green / Active: In-flight query running.
   - Dim Gray: Idle connection awaiting query.
   - Orange / Bad: Leaked or stuck transaction holding an open lock.
4. **Upstream Request Backlog**:
   When available slots hit zero, upstream client request cards transition from normal status to warning orange with dotted connector lines, visually demonstrating queuing and head-of-line blocking.
