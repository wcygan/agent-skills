# Refactoring

Change structure while preserving behavior.

1. Pin current behavior with a characterization or equivalence check before moving code.
   Compilation and formatting alone make no behavior baseline, because they pass
   on behavior changes too.
2. Name the simpler target structure. Use `wcygan-design`
   for consequential ownership or interface changes.
3. Follow `wcygan-implement` in behavior-preserving units.
   Migrate necessary callers and remove obsolete internal paths when complete.
4. Rerun the baseline against the integrated result and inspect overlooked consumers,
   serialized names, configuration, and documentation references.

Complete with equivalence evidence and the reduction in complexity or reader effort.
New behavior or discovered defects remain separate, explicitly scoped work.
