# Anti-slop rules reference

Read when choosing stricter lint policy or adopting the upstream local plugin.
For this skeleton, enable both upstream plugins and every exported rule at
error severity. The bundled example includes 18 generic and 5 Effect rules.

Upstream distributes source for vendoring and has no official npm package.
If adopting it, inspect a selected revision, copy its plugin source into
`tools/oxlint/anti-slop/`, and preserve its license, attribution, and revision.
Keep local modifications documented for later updates.

Match `oxlint` and `@oxlint/plugins` at the exact same resolved version.
Register the generic entrypoint through `jsPlugins`; register the separate
Effect entrypoint when adopting Effect-specific rules. Check rule names and
entrypoints against that revision rather than assuming a published preset.

Keep application code and tests compliant with the full ruleset. Use schema
parsing at untrusted boundaries, typed tagged constructors, and Effect matching
instead of type escapes or hand-written tag checks. Fix violations rather than
disabling rules. Exclude only generated code, tooling assets, and the vendored
plugin's own source from app linting.

The bundled example pins upstream revision
`c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`, retains its MIT license and nested
attributions, and pins both Oxlint packages to `1.83.0`. Its lint-policy tests
check that every exported rule is enabled and that both plugins execute.

Verify plugin loading and representative violations, then lint the app. Lint
rules assist review; their local syntax analysis cannot prove the layer graph.

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop).
