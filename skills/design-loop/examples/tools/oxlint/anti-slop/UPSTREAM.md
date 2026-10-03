# Anti-slop provenance

- Author: Dillon Mulroy
- Repository: https://github.com/dmmulroy/anti-slop
- Revision: c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b
- Source: `src/`, excluding upstream `*.test.ts` files (as in upstream skill assets)
- License: MIT; see `LICENSE` and the preserved licenses under `vendor/`.
- Local modifications: none.

Both exported plugins and all 23 rules are enabled in `oxlint.config.ts`.
Keep `oxlint` and `@oxlint/plugins` pinned to the same exact version.
When updating, review source changes against this revision and preserve local
configuration. This copy is maintained with the example, not auto-synchronized.
