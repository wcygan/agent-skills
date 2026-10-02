# Layout, Framing, and Resilient Embedding

How technical visuals frame their canvas, embed safely inside parent documents or iframes, and prevent scrollbars and clipping.

## The Zero-Scroll Rule

Visual diagrams and interactive explainers must never show internal scrollbars or clipped contents.

1. **Clip body overflow**: Set `body { margin: 0; overflow: hidden; }` in iframe targets.
2. **Natural height sizing**: Structure demo contents around a natural vertical flow or fixed coordinate viewBox rather than relying on viewport-relative percentages (`100vh`).
3. **Auto-fit reporting**: When embedded across origins or nested iframes, dispatch height messages to the parent frame:
   ```javascript
   let lastH = 0;
   const postH = () => {
     try {
       const mainEl = document.querySelector("main");
       const height = mainEl ? Math.ceil(mainEl.getBoundingClientRect().height + 52) : Math.ceil(document.body.scrollHeight);
       if (Math.abs(height - lastH) > 2) {
         lastH = height;
         parent.postMessage({ demoHeight: height }, "*");
       }
     } catch (e) {}
   };
   window.addEventListener("load", postH);
   window.addEventListener("resize", postH);
   postH();

## Canvas Box and Stage Framing

Technical visuals employ a double-container strategy to separate page context from vector simulation space:

```html
<main>
  <h1>DIAGRAM TITLE</h1>
  <p class="sub">Editorial subtitle explaining the concrete technical principle.</p>
  
  <div class="canvas-box">
    <!-- SVG overlay for paths, wires, and traffic orbs -->
    <svg class="wires" viewBox="0 0 860 380" preserveAspectRatio="none">...</svg>
    
    <!-- HTML DOM elements for interactive nodes and cards -->
    <div class="node app-node">...</div>
  </div>
  
  <!-- Direct-manipulation controls placed immediately beneath stage -->
  <div class="controls">...</div>
  <p class="note"><b>Primary takeaway</b> in bold accent contrast.</p>
</main>
```

### Frame Dimensions and Padding Standards
- **Outer page padding**: `padding: 24px 20px 28px;`
- **Max reading width**: `max-width: 860px; margin: 0 auto;` (or `720px` for dense ladders/curves).
- **Stage container**:
  ```css
  .canvas-box {
    position: relative;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--panel);
    overflow: hidden;
  }
  ```
- **1px borders everywhere**: Containers use `border: 1px solid rgba(255, 255, 255, 0.14)`. Secondary inner separators use `rgba(255, 255, 255, 0.10)`.

## Dual-Layer Alignment (DOM + SVG)

Complex architectural visuals frequently overlay a vector SVG plane directly on top of structured DOM nodes:
- Set SVG to `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3;`.
- Set HTML nodes to `position: absolute; z-index: 2;`.
- Compute wire start/end points explicitly from node bounding geometries (`left + width / 2`, `top + height / 2`).
