# Interactive Controls and Simulation State

Patterns for slider-driven curves, predicate selectors, and live mathematical state.

## Direct Manipulation vs. Distant Controls

Interactive controls must sit immediately adjacent to the visualization surface they affect. Never force the user to scroll or search elsewhere on the page to view the outcome of a toggle or slider.

## Button and Chip Toggles

For discrete scenario switching (e.g. comparing queries or presets):

```css
.chip-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.chip {
  font: 12px ui-monospace, Menlo, monospace;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.chip:hover {
  border-color: rgba(255, 255, 255, 0.5);
}
.chip.active {
  border-color: var(--accent);
  color: var(--accent);
}
```

## Continuous Parameter Sliders (e.g. USL Curves)

When modeling mathematical equations (such as Dr. Neil Gunther's Universal Scalability Law):
- Place range sliders directly below or to the side of the Cartesian coordinate chart.
- Show live numeric readouts next to slider labels using tabular numbers.
- Recalculate and redraw SVG path strings on input:
  ```javascript
  slider.addEventListener("input", (e) => {
    alpha = parseFloat(e.target.value);
    label.textContent = alpha.toFixed(3);
    redrawCurve(alpha, beta);
  });
  ```
- **Peak Point Indicator**: Compute mathematical maxima ($N^* = \sqrt{\frac{1 - \alpha}{\beta}}$) dynamically and draw a persistent accent circle with a floating vertical drop line to the x-axis.

## Verdict and Summary Readouts

Beneath the interactive controls, provide an editorial verdict element that translates visual state into an explicit engineering takeaway:
```html
<p class="verdict">
  Throughput peaks at <b>48 concurrent connections</b>. Beyond this point, 
  contention collapses performance.
</p>
```
Highlight key metrics in bold accent color (`<b style="color: var(--accent)">...</b>`) with `tabular-nums`.
