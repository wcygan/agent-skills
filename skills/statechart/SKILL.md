---
name: statechart
description: "Model-check a TLA+ spec with TLC and draw its behavior as a Mermaid statechart. Use for lifecycle invariants, deadlocks, protocol or product flows, and counterexample paths."
license: MIT
compatibility: Requires Node 22.18–22.x or 23.6+, Bun 1.1.5+, or Deno 2+. Uses existing Java and TLC via TLA2TOOLS, or mise to obtain them.
metadata:
  kind: component
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: 0b46ec399d55f2829e88822998f53b84944837d3
  upstream-path: pstack/skills/statechart
  upstream-author: Lauren Tan
  maintenance: local
---

# Statechart

Produce a checked TLA+ model and a Mermaid chart a reader can use to judge the
behavior. Put a new spec, config and output in a scratch directory outside the
project unless the user asks to keep them in the repo.

- Encode the reader's agreed state rules as TLC `INVARIANT`s. Add variables
  needed to express each rule faithfully, even when it fails. Use small
  constants so TLC can finish exploring.
- Write `Next` as a disjunction of named actions so traces identify each step.
  To keep deadlock checking enabled for a model with legitimate terminal states,
  add a terminal-only action that leaves the variables unchanged, for example
  `Done == phase \in {"paid", "failed"} /\ UNCHANGED vars`.
- Use a `--view` module to label states and steps in the reader's terms. See
  [view options and projection rules](references/view.md) for grouping,
  parallel regions and suppressing arrows.

```sh
sh "<skill dir>/scripts/statechart" SPEC.tla [--config FILE] [--view FILE] [--out DIR]
```

The launcher works without an executable bit. On native Windows use
`node --disable-warning=ExperimentalWarning "<skill dir>/scripts/statechart.ts"`.
The config defaults to `SPEC.cfg`. Use a new or empty output directory.
Set `TLA2TOOLS` to an existing jar and optionally `JAVA` to its Java binary
(Java 11+) to bypass mise. If mise must install TLC and Java, get a go-ahead
unless the user explicitly asked for a model check.

## Interpret and deliver

Read `report.md` for the outcome of each rule. TLC can keep exploring beyond a
violation for the chart. When the initial verdict stops at a failure, follow-up
runs check remaining rules, with a 100,000-state cap on bounded reruns. Treat
`Rules not checked` as unresolved. With `CONSTRAINT`, `ACTION_CONSTRAINT`,
`VIEW`, or `SYMMETRY`, read the [TLC reporting notes](references/tlc.md) before
interpreting coverage or diagram edges.

Above 500 states, the chart contains only counterexample paths. If there are
none, the run produces the report without a chart. Include `chart.mmd` as
Mermaid when present. For an image or a chart too large to read as text, use
[Pele](references/render.md) to retain its annotations.

Report which rules hold, break or remain unchecked. For each violation give
the rule in the reader's terms and the report's numbered path. Disclose model
assumptions, omitted chart steps and any relevant bounds, and include a
rerunnable command with a fresh `--out`. When modeling code, replay the paths
against the real implementation and report any mismatch with the model.

Adapted from pstack. [License and attribution](references/LICENSE.txt)
