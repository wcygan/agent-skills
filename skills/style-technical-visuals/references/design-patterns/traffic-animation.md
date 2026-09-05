# Traffic Animation and State Transitions

Mechanics for animated traffic packets, continuous loops, and visual arrival states.

## Native SVG Traffic Orbs (`<circle>` + `<animateMotion>`)

Traffic orbs representing queries, writes, or binlog packets must be rendered as native SVG elements inside the same vector coordinate system as the interconnect paths.

### Why Avoid DOM + CSS `offset-path`
HTML `<div>` elements animated with CSS `offset-path` introduce subpixel rounding and coordinate drift. Native SVG `<circle>` elements with `<animateMotion>` lock exactly to the vector path center line across all display scalings.

### Programmatic Packet Injection
```javascript
function spawnPacket(svgContainer, pathString, durationMs, colorClass, onComplete) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", "5");
  circle.setAttribute("class", "packet " + colorClass);
  
  const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
  anim.setAttribute("path", pathString);
  anim.setAttribute("dur", durationMs + "ms");
  anim.setAttribute("fill", "freeze");
  anim.setAttribute("rotate", "auto");
  
  circle.appendChild(anim);
  svgContainer.appendChild(circle);
  anim.beginElement();
  
  setTimeout(() => {
    circle.remove();
    if (onComplete) onComplete();
  }, durationMs + 40);
}
```

### Packet Styling and Glow
```css
.packet {
  pointer-events: none;
}
.packet.write {
  fill: var(--accent);
  filter: drop-shadow(0 0 5px rgba(243, 88, 21, 0.8));
}
.packet.binlog {
  fill: var(--info);
  filter: drop-shadow(0 0 5px rgba(30, 157, 231, 0.8));
}
.packet.read {
  fill: var(--good);
  filter: drop-shadow(0 0 5px rgba(48, 164, 108, 0.8));
}
```

## Destination Node Pulse on Arrival

When a packet finishes its journey, the destination card pulses its border and shadow to acknowledge receipt:

```css
@keyframes pulseGood {
  0%   { border-color: rgba(48, 164, 108, 0.9); box-shadow: 0 0 8px rgba(48, 164, 108, 0.35); }
  100% { border-color: var(--border-node); box-shadow: none; }
}
@keyframes pulseHot {
  0%   { border-color: rgba(243, 88, 21, 0.95); box-shadow: 0 0 10px rgba(243, 88, 21, 0.45); }
  100% { border-color: var(--accent); box-shadow: none; }
}
.pulse-good { animation: pulseGood 0.28s ease-out; }
.pulse-hot  { animation: pulseHot 0.28s ease-out; }
```

## Speed as Meaning (The Lag Wave Pattern)

In simulations explaining latency or lag (e.g. `replication-lag.html`), vary packet flight duration to represent real system costs:
- 4-second replica: packet duration `800ms`.
- 24-second replica: packet duration `4800ms` (6× slower).
Physical speed on screen communicates bottleneck disparity without requiring the user to interpret numeric labels alone.

## Accessible Reduced Motion State

Always support `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .packet, .pulse-good, .pulse-hot {
    animation: none !important;
    transition: none !important;
  }
}
```
When reduced motion is active, display static interconnect arrows or static status badges instead of continuous orbs.
