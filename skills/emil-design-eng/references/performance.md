# Animation performance

Read when choosing an implementation under load or investigating dropped frames.

## Performance Rules

### Prefer transform and opacity where they express the effect

Transform and opacity are useful first choices for avoiding repeated layout work. Layout-affecting properties such as `padding`, `margin`, `height`, or `width` need closer performance inspection; sometimes the visual behavior requires them.

### CSS variables are inheritable

Changing a CSS variable on a parent recalculates styles for all children. In a drawer with many items, updating `--swipe-amount` on the container causes expensive style recalculation. Update `transform` directly on the element instead.

```js
// Bad: triggers recalc on all children
element.style.setProperty('--swipe-amount', `${distance}px`);

// Good: only affects this element
element.style.transform = `translateY(${distance}px)`;
```

### Framer Motion hardware acceleration caveat

Animation scheduling and acceleration depend on the installed library version, animated property, and browser. If shorthand transforms or shared layout motion drop frames under load, compare the full transform form or a CSS transition for the same effect, and inspect the result:

```jsx
<motion.div animate={{ x: 100 }} />
<motion.div animate={{ transform: "translateX(100px)" }} />
```

### Choose CSS or JavaScript by the interaction

CSS transitions are a useful default for predetermined state changes; JavaScript or a motion library can own dynamic gestures and coordination. Check the actual animation under representative page load instead of assuming either approach is accelerated.

### Use WAAPI for programmatic CSS animations

The Web Animations API is an option when an animation needs programmatic control without a library. Inspect performance for the actual animated property and browser.

```js
element.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
  duration: 1000,
  fill: 'forwards',
  easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
});
```
