# Create or replace the visual system

Read for from-scratch websites and apps, styling, restyling, or comprehensive redesign.

## Choose a direction from the brief

Derive the visual language from the audience, task, content density, context, and
explicit brand requirements. Choose typography, palette, hierarchy, and surfaces
as one coherent direction. Established product references provide examples to
inspect, not a default aesthetic for every product.

In redesign mode, assess the current design without assuming preservation matters.
Replace awkward navigation, arbitrary spacing, inconsistent controls, weak hierarchy,
and unsuitable styling wherever the requested scope allows. Retain an element when
it supports the new direction or an explicit constraint, not because it already exists.
Keep required capabilities intact even when their placement or interaction changes.

When multiple visual directions are plausible, compare a small number using the
same representative content. Recommend one based on readability, task fit,
coherence, accessibility, and implementation cost. A visual comparison can use
the same structure; structural alternatives are evaluated separately.

## Establish semantic tokens

Use the project's token mechanism where suitable; otherwise introduce a small
shared foundation such as CSS custom properties. Define roles instead of scattering
literal values across screens:

- Color: canvas, surface, text, muted text, border, primary action, focus, and
  success/warning/error states. Color supplements text or icons for meaning.
- Typography: font families, heading/body/label roles, sizes, weights, and line heights.
- Spacing and layout: scale, content widths, gutters, density, and responsive rules.
- Shape and depth: consistent radii, borders, and elevation where hierarchy needs it.
- Motion: purposeful feedback and transition defaults with reduced-motion behavior.

Implement only the themes and variants required by the brief. Choose readable
fonts and available assets; verify loading behavior and fallbacks. Keep token
definitions authoritative and put component-specific exceptions near their owners.

## Prove the direction in a representative slice

Style a real screen or section containing the hardest relevant content, common
controls, and important states. Include desktop and mobile presentation. Validate
it before spreading the system so weak choices do not become pervasive.

Define reusable components with consistent appearance and behavior: navigation,
buttons, fields, selection, lists/tables, feedback, and dialogs as needed. Cover
default, hover, focus, selected, disabled, invalid, and pending states where relevant.
Match visual emphasis to task priority; decorative styling must support the content.

## Apply and retire the old system

Map every in-scope screen and state to the shared tokens and components. Replace
superseded rules and variants once their consumers have migrated. Inspect actual
consumers before deleting shared styles; preserve out-of-scope surfaces and unrelated
work. For partial redesigns, define a clear boundary so new global rules do not
accidentally restyle untouched pages.

Validate visual coherence across representative screens, realistic content, and
viewport sizes. Check contrast, focus visibility, readable line lengths, wrapping,
touch targets, and interaction feedback alongside functional checks. A styling
request is complete when the selected system is implemented consistently, not
when only a wireframe or palette has been produced.

Document the reusable roles and component usage in the project's existing style
documentation when useful. Create a component showcase only when its maintenance
value warrants it; a new framework or dedicated documentation app is optional.
