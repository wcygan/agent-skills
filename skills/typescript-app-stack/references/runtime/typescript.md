# TypeScript

Adds static types to JavaScript. Its compiler checks types; types are erased before execution.

Cold typecheck time is a common CI bottleneck. Benchmark alternatives on the
project's own source before switching: the native TypeScript 7 compiler and
Bun's `bun check` are materially faster than the JavaScript `tsc` on many
codebases, but they may not support every compiler option or type-aware lint
rule. Keep the typechecker version pinned and verify parity on the existing
type errors, not just on a successful exit code.

## Documentation

- [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Compiler configuration](https://www.typescriptlang.org/tsconfig/)
- [TypeScript 7 native compiler](https://github.com/microsoft/typescript-go)
- [Bun typechecking](https://bun.sh/docs/cli/check)
