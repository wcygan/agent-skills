# Oxlint

Read when creating or changing lint configuration and scripts.

Install Oxlint as a pinned development dependency. Use `oxlint.config.ts` when
supported by that version, especially for a local JavaScript plugin. Configure
TypeScript/React rules appropriate to the source and a `lint` script that checks
the application. Exclude generated route trees, build artifacts, and vendored
plugin source explicitly, without hiding application files.

Keep lint and `tsc --noEmit` separate: lint success is not typecheck evidence.
Use the installed version's documented options if type-aware linting is needed.
Do not add a second linter unless a required rule is unavailable.

For anti-slop adoption, load the separate anti-slop reference from the skill's
routing table. Preserve existing rules while merging plugin configuration.

Run lint over the actual scaffold. When adding custom rules, verify that an
intentional violation is reported and a corrected fixture passes; remove
throwaway fixtures afterward.

Source: [Oxlint guide](https://oxc.rs/docs/guide/usage/linter).
