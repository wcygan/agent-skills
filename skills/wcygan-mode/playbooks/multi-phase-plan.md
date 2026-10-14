# Multi phase plan

Produce an executable plan for several dependent units.

1. Establish scope, completion criteria, uncertainties, and requested delivery stages.
   Resolve observable uncertainties with focused investigation or prototypes.
2. Use [coordinate](../../wcygan-coordinate/SKILL.md) to identify units, dependencies,
   write boundaries, and acceptance criteria. Keep the plan proportionate to the work.
3. Write the Markdown contract in [plan format](../references/plan-format.md),
   selecting meaningful verification for each unit and explicit performance checks
   only when performance is part of its acceptance criteria.
4. Run the Python plan checker from [tools](../references/tools.md). Review the
   plan semantically too: structurally valid fields do not prove a viable approach.

Complete with a checked plan and open decisions. Planning-only work ends here;
continue execution when it is already requested and no explicit checkpoint intervenes.
