# Just manual index

Use installed command help as the source for available flags. Use the project
files as the source for repository intent.

The online manual describes the latest release. Run `just --version` before
using syntax with a version annotation.

## Orientation

- [Programmer's Manual](https://just.systems/man/en/) — Start with the official release documentation.
- [GitHub repository](https://github.com/casey/just) — Check source, releases, issues, examples, and upstream changes.
- [Quick Start](https://just.systems/man/en/quick-start.html) — Review file discovery, recipes, command output, failures, and basic dependencies.
- [The Default Recipe](https://just.systems/man/en/the-default-recipe.html) — Choose behavior for `just` without a recipe name.

## Recipe interfaces

- [Recipe Parameters](https://just.systems/man/en/recipe-parameters.html) — Define required, default, variadic, constrained, option, and flag inputs.
- [Avoiding Argument Splitting](https://just.systems/man/en/avoiding-argument-splitting.html) — Preserve user values through substitution and shell parsing.
- [Positional Arguments](https://just.systems/man/en/positional-arguments.html) — Pass recipe inputs through shell positional arguments.
- [Documentation Comments](https://just.systems/man/en/documentation-comments.html) — Show recipe help in `just --list`.
- [Aliases](https://just.systems/man/en/aliases.html) — Provide alternative names for recipes or modules.

## Recipe composition

- [Dependencies](https://just.systems/man/en/dependencies.html) — Order prior and subsequent work and pass dependency arguments.
- [Parallelism](https://just.systems/man/en/parallelism.html) — Run independent dependencies concurrently and limit job counts.
- [Imports](https://just.systems/man/en/imports.html) — Combine multiple files into one namespace.
- [Modules](https://just.systems/man/en/modules.html) — Create separate command namespaces with separate settings.
- [Invoking justfiles in Other Directories](https://just.systems/man/en/invoking-justfiles-in-other-directories.html) — Run an independent command surface in another directory.

## Values and expressions

- [Variables and Assignments](https://just.systems/man/en/variables-and-assignments.html) — Define and inspect module-level values.
- [Lazy Evaluation](https://just.systems/man/en/lazy.html) — Skip unused expensive assignments.
- [Expressions and Substitutions](https://just.systems/man/en/expressions-and-substitutions.html) — Build values and insert them into recipe commands.
- [Strings](https://just.systems/man/en/strings.html) — Choose quoting, escaping, shell expansion, and format strings.
- [Lists](https://just.systems/man/en/lists.html) — Review unstable list values and related behavior changes.
- [Conditional Expressions](https://just.systems/man/en/conditional-expressions.html) — Select values with equality, regular expressions, and short-circuit branches.
- [Built-in Functions](https://just.systems/man/en/built-in-functions.html) — Find supported helpers for paths, environments, platforms, and values.

## Runtime behavior

- [Shell](https://just.systems/man/en/shell.html) — Select the shell for recipe lines and backticks.
- [Getting and Setting Environment Variables](https://just.systems/man/en/getting-and-setting-environment-variables.html) — Pass configuration between `just`, recipes, and child processes.
- [Dotenv Settings](https://just.systems/man/en/dotenv-settings.html) — Load optional, required, named, or command-generated environment files.
- [Changing the Working Directory](https://just.systems/man/en/changing-the-working-directory-in-a-recipe.html) — Preserve directory state with one-line commands or shebang recipes.
