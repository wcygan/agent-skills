# Tailwind CSS

Read when configuring styling or adding UI foundations.

For a Vite-based Start app, use `tailwindcss` and `@tailwindcss/vite` at compatible
versions. Add the Tailwind plugin to the existing Start Vite configuration and
import `@import "tailwindcss";` from the application stylesheet loaded by the
root route. Preserve the framework's required plugin ordering.

Use utility classes in React. Introduce shared theme tokens when repeated
colors, spacing, or typography need consistency. Keep class alternatives as
complete static strings so discovery can detect them. Do not generate class
names by interpolating arbitrary values; use CSS variables for dynamic values.

Keep the first UI small: semantic controls, visible focus, a readable layout,
and explicit loading/error states. Add component abstractions when reused.
Do not import an unrelated UI kit merely to establish Tailwind.

Verify styles in both development and production and inspect a narrow viewport
and keyboard focus. Older Tailwind setup recipes may use different directives;
follow the installed major version.

Source: [Tailwind Vite installation](https://tailwindcss.com/docs/installation/using-vite).
