# Eval

Compare workflow or instruction changes before promoting them.

1. Define representative tasks, the baseline, candidate, observable scoring criteria,
   trial budget, and selection rule before running the comparison.
2. Keep inputs and permitted resources comparable. Separate candidate workspaces
   and withhold preferred answers and grading conclusions from candidates.
3. Use fresh independent execution where available. If trials share history or
   cannot be independent, record that confound explicitly.
4. Inspect actual outputs and execution evidence. Repeat enough trials to expose
   variability; evaluate correctness and task completion alongside cost.
5. Use `wcygan-experiment` to judge the comparison.

Complete with methods, outcomes, failure examples, uncertainty, and a promotion
recommendation. Promote only on inspected outputs across trials, because a
self-report or one convenient example can pass while the candidate fails
representative tasks.
