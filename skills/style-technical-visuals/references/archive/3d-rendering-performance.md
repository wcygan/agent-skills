# 3D Rendering Performance and Temporal Postmortem

Read this when building an orbitable SVG demo, changing its rendering loop, or
fixing connector visibility and active-path highlights. Keep visual correctness
and rendering cost in the same acceptance criteria.

## Temporal incident: October 1, 2026

The user reported that the simplified execution scene in
[the Temporal 3D demo](../standalone-3d/temporal-mysql-architecture.html) made their
computer sluggish while the larger sharded scene worked well. The two scenes
shared a page but had different update patterns: the simplified scene autoplayed
and rebuilt its SVG every frame; the sharded scene rendered on interaction.

### Cause and contributing changes

The simplified scene coupled payload movement to full scene construction. Each
animation frame reprojected geometry, sorted faces and connector fragments,
created hundreds of SVG elements, replaced the scene's children, and rewrote
status text. Pointer moves also rebuilt the scene synchronously, adding work
when input events arrived faster than display frames.

An earlier correction for gray strokes painting over the orange highlight
added a shared scene-sized mask to 300 gray connector fragments. That mask
included the moving payload, so it changed on every animation frame. The fix
addressed the visible overlap while increasing the work associated with each
redraw. Actual browser mask rasterization cost was not measured.

The animation callback also rescheduled itself while paused or in a hidden tab.
Paused and hidden playback skipped scene construction but still scheduled
callbacks. Scrolling the simplified scene out of view did not suspend playback.

### Why the checks missed it

The preceding checks concentrated on route alignment, arrowheads, full rotation,
platform layering, and gray/orange separation. They lacked assertions for
retained node identity, per-frame DOM allocations, mask size, input batching,
and idle scheduling. A mathematically correct diagram could therefore pass
those checks while doing excessive work on every frame.

### Measured evidence

A jsdom harness ran the actual inline scripts with a controlled animation
clock: ten warm-up frames, then 120 frames at simulated 60 Hz within the first
execution phase. This was two seconds of simulated playback without orbit or
a phase transition. Counts exclude initial construction and warm-up.

| DOM operation in the sample | Before | After |
| --- | ---: | ---: |
| New SVG elements | 49,680 | 0 |
| Attribute writes | 461,040 | 841 |
| Complete scene replacements | 120 | 0 |

These are observed script/DOM counts, not measurements of browser frame rate,
GPU load, memory use, or power consumption. The user-visible slowdown is
reported evidence; browser paint/compositing cost remains unmeasured.

The historical HTML samples have these SHA-256 identifiers:

- Before: `fb62b23f970928291e3355e333f1d0154a3d6913010ae74a702457f394dec9dc`
- After: `890762ec0c10cb6a0db693d82f02cb1a6d97efe9a65acda7cae0e7b536fe8d57`

### Repair and verification

The repaired renderer separates scene construction from payload updates:

- Route lengths and shared baseline spans are computed once. Camera projection,
  static stroke clipping, face ordering, and labels rebuild on a phase or orbit
  change. Ordinary playback retains those SVG elements.
- Gray strokes are clipped out of the active route during scene construction.
  The moving payload uses one retained depth mask bounded to 18 × 18 SVG units;
  baseline connector fragments have no masks. Packet visibility is calculated
  against projected node surfaces so the payload can pass behind objects.
- Within a phase at a fixed camera angle, each animation frame changes only
  payload position and its small depth mask.
  Unchanged attributes and control text are left intact.
- Pointer events accumulate camera changes and request one render per display
  frame. Playback stops scheduling frames when paused, offscreen, or hidden;
  resuming resets the clock without catching up background time.

The regression check covers retained node identity, bounded attribute updates,
input batching, idle scheduling, visibility resume, and reduced-motion startup.
It checks all twelve phases across 384 phase/progress/view combinations and a
complete autoplay cycle with twelve scene rebuilds at phase boundaries. Its
independent ray/solid check tests payload-center visibility away from geometric
boundaries; boundary antialiasing still requires a browser inspection.

The sharded renderer and shared zoom controller were unchanged by the
performance repair. This incident does not establish the performance of every
other 3D example in the catalog.

## Prevention: design around what changes

For a static topology with a moving packet, keep construction and animation
as separate operations. Store the world-space route once; use it for wire,
arrowhead, and packet coordinates. Cache route lengths and view-dependent
geometry at their actual change boundaries.

| Event | Work to perform |
| --- | --- |
| Initial load or topology change | Create/update nodes, routes, ports, and labels |
| Phase or selection change | Update the affected state and active route |
| Camera orbit | Reproject geometry and recompute depth visibility once per frame |
| Packet movement | Update retained payload geometry and bounded visibility data |
| Zoom | Change the SVG camera/viewBox when the projection permits it |
| Paused, offscreen, or hidden | Suspend automatic animation scheduling |

New records or jobs may allocate elements when those events occur. The invariant
is that moving an existing packet does not recreate an unchanged topology.
Choose a different update budget explicitly when the explanation animates
the topology itself.

### Keep visibility work local

Average face depth is a drawing-order approximation. A long connector can be
in front of one surface and behind another, so one whole-object sort key can
hide a camera-facing stem or expose a rear connection. Use surface-aware
clipping where depth order varies along a line.

For overlapping active and baseline routes, calculate static cutouts when the
route or camera changes. Keep packet occlusion separate from baseline ink.
Bound a moving mask to the glyph plus stroke/antialias padding, and reject
unrelated surfaces by their projected bounds before clipping them. Measure a
visibility fix again when it adds masks, fragments, or moving clipping paths.

### Schedule only useful frames

Track playback intent separately from scene/document visibility. Schedule a
frame when animation is active or explicit input has made the view dirty.
Coalesce pointer events into the latest camera state. Cancel automatic callbacks
when playback cannot advance, and reset elapsed-time tracking on resume.

A paused user may still drag, zoom, or step; those inputs should request bounded
updates without restarting automatic playback. Preserve full orbit and pointer
capture while changing the scheduling mechanism.

## Acceptance checks

For this topology-and-payload pattern, establish these checks before declaring
a renderer or visibility repair complete:

1. **Retained playback:** sample multiple frames within one phase. Existing scene
   and packet nodes retain identity; moving the packet creates zero SVG elements
   and replaces no complete scene. Set a bounded attribute budget per glyph.
   The Temporal check permits at most eight writes per frame.
2. **Discrete changes:** run a complete loop and every control state. Geometry
   rebuilds correspond to phase/topology/view changes rather than packet ticks.
3. **Input batching:** dispatch a burst of pointer moves before one frame. The
   scene rebuilds at most once using the final angle; clockwise and
   counterclockwise orbit, capture loss, keyboard access, and zoom still work.
4. **Idle behavior:** after pending input is settled, pause, hide the document,
   and scroll the scene offscreen. Automatic callbacks and DOM writes stop.
   Returning preserves playback intent without a time jump.
5. **Visibility correctness:** inspect all phases, shared/reversed routes,
   arrowhead arrivals, front/rear ports, and payloads passing behind nodes at
   several angles and zoom levels. Use an independent geometric oracle where
   possible, then inspect actual browser pixels and antialias boundaries.
6. **Equivalent measurements:** compare the same scene, phase, camera, playback
   duration, warm-up, and runtime before and after. Separate steady playback
   from phase transitions and orbit; report script/DOM counts separately from
   browser frame, paint, and GPU measurements.

If browser rendering is unavailable, run the permitted source/DOM checks and
record the missing visual and GPU evidence explicitly. A screenshot cannot
prove idle scheduling, and a DOM benchmark cannot prove smooth browser frames.

## Repository regression check

For a checkout of this repository, the optional check is
`tests/dom/temporal-rendering.cjs`. It requires Node.js and an already available
`jsdom` dependency; its header describes separate dependency setup. The check
is repository tooling and is not bundled with an installed copy of this skill.

From the repository root, substitute the directory containing `jsdom`:

```sh
NODE_PATH=/path/to/node_modules node tests/dom/temporal-rendering.cjs
NODE_PATH=/path/to/node_modules node tests/dom/temporal-rendering.cjs --benchmark
```

To measure a saved pre-change HTML sample under equivalent conditions:

```sh
NODE_PATH=/path/to/node_modules node tests/dom/temporal-rendering.cjs --benchmark /path/to/before.html
```

Benchmark mode prints counts and average script time for the fixed 120-frame
sample; it does not run the regression assertions. The normal check exercises
the actual HTML scripts and scheduling behavior but has no browser layout,
rasterization, or GPU. It must be run separately from `just check-full`, whose
current test gate runs the Python maintenance suite and catalog checks.
