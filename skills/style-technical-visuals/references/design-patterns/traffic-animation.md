# Native SVG Tracers and Playback

Use this procedure when traffic explains a request, write, delivery, or state transition.
For node shapes, exact ports, and arrowheads, read [topology-diagrams.md](topology-diagrams.md).

## Bind motion to a route

Create the wire and packet inside the same scene SVG. Use a native `<circle>` with `<animateMotion>`.
Use the wire's exact path string for motion, ordered from source to destination. Keep the circle centered at its local origin.

Copy `connect`, `line`, and `animate` from `../gallery/demos/outbox.html` for a working implementation.
The packet layer sits above nodes. The wire layer sits below nodes and above container backgrounds.

Create packets only for events that occur in the current transition. A static ownership edge does not imply continuous traffic.
Use the route's semantic color for its packet. Use a dashed route and a waiting label for blocked work.

## Start inserted animations explicitly

Set `begin="indefinite"` before attaching an animation. Attach it to the live SVG, then call `beginElement()`.
Without an explicit start, a late insertion can use document time zero and appear finished immediately.

```javascript
const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
motion.setAttribute("path", wire.getAttribute("d"));
motion.setAttribute("begin", "indefinite");
motion.setAttribute("dur", "1.1s");
motion.setAttribute("fill", "freeze");
packet.append(motion);
packetLayer.append(packet);
motion.beginElement();
```

Fade or remove packets after arrival. Base destination effects on arrival when the effect teaches timing.
For discrete schedules, state clearly that each step shows the event's resulting state.

## Preserve playback intent

Start standalone demos automatically. Start embedded demos when their frames become visible.
Loop after a short final-state pause. Keep Play, Pause, Step, and Reset available.

Store user playback intent separately from frame visibility and document visibility.
Scrolling or switching tabs suspends execution; returning restores the prior intent.
Manual Step pauses automatic advancement. Reset and mode changes preserve the user's playback choice.

For embedded demos, use a ready handshake and frame visibility messages from the gallery.
Match incoming messages to the expected parent or child window. This also supports local `file://` pages.
The main gallery's `data-stepped` frames show the complete protocol and automatic height reporting.

## Support reduced motion

Check `matchMedia("(prefers-reduced-motion: reduce)")` before creating SVG animations.
CSS animation rules alone do not disable SVG `<animateMotion>` or `<animateTransform>`.
Keep static arrows, labels, counters, and discrete steps available. Respond when the preference changes.

## Verify actual movement

Load the page without clicking Play. Confirm automatic advancement and a complete loop.
Insert a packet after the SVG document is older than its animation duration.
Sample the packet's `getCTM()` at two times; its position must change along the declared route.

Test pause, manual steps, reset, mode changes, frame visibility, and reduced motion.
Open standalone files and the gallery offline. Confirm that playback needs no external asset requests.

Completion: every demo moves real packets, respects playback intent, and preserves its explanation with reduced motion.
