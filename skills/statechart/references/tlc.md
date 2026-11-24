# TLC reporting notes

- Deadlock normally appears as `NoDeadlock`. If an invariant or property
  already uses that name, the deadlock check is labeled `CHECK_DEADLOCK`.
- `VIEW` and `SYMMETRY` collapse states TLC treats as equivalent. An arrow
  may point at a representative instead of the exact successor. The report
  records this.
- TLC can detect violations at a `CONSTRAINT` or `ACTION_CONSTRAINT` boundary.
  Exploration and deadlock checks cover the included states. An edge excluded
  by `ACTION_CONSTRAINT` can still violate a rule even if its successor is
  also reachable by an included edge. If the shortest returned counterexample
  ends with an excluded state or edge, the chart includes it.
- The initial verdict uses one worker and the config as written. If bounded
  reruns leave rules unchecked, shrink the model or check the remaining rules
  after removing the known failing rules. The cap can change variable order,
  which can change a temporal property's returned counterexample.
- A `breaks` mark means all model states behind a label violate a rule.
  `mayBreak` means only some do. In parallel regions a mark can depend on a
  combination of states. Use the report paths and legend to identify the
  combinations and rules.
- `tlc.out` records the initial run. Look for `tlc-RULE.out` when a failing
  rule has no path in the chart or is a temporal property.
