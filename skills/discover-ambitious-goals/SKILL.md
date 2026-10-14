---
name: discover-ambitious-goals
description: "Find valuable project outcomes and stretch goals from product and engineering evidence. Use when choosing what to improve, challenging a backlog, or exploring what a project could achieve."
license: MIT
metadata:
  author: William Cygan
  kind: component
  maintenance: local
---

# Discover ambitious goals

Find improvements worth pursuing beyond the current task list. Ground ambition
in user value and evidence; preserve the user's priorities and constraints.

1. Establish the product's purpose, users, important journeys, and current goals.
   Inspect available source, operational signals, support history, measurements,
   and repeated manual work. Record evidence dates, versions, and coverage gaps.
   Source code alone cannot establish customer demand or production reliability.
2. Reframe tasks as outcomes. Ask what becomes better for the user if the task
   succeeds, and whether removing the underlying cause would be more valuable.
   Examine repeated failures, waiting, setup effort, resource use, and operator toil.
3. Propose roughly three to five opportunities when evidence supports them. For
   each, name the beneficiary, baseline, desired outcome, required target, and an
   ambitious exploration target. Use a falsifiable qualitative criterion when a
   numeric metric would distort the goal. Label unsupported baselines as unknown
   and agent-generated targets as proposals until selected by the user or under
   delegated goal-setting authority.
4. Challenge the limiting assumption behind each opportunity. Identify raw evidence
   and a concrete method from a relevant discipline that could change the answer:
   profiling, queueing analysis, fault injection, usability observation, or another
   appropriate technique. Specify the instrument and expected evidence, not a role
   to impersonate. Treat presumed impossibility as a hypothesis to investigate.
5. Rank opportunities by expected user benefit, evidence strength, cost to learn,
   feasibility of measurement, and reversibility. Separate grounded opportunities
   from speculative bets. Name tradeoffs and disqualifying outcomes alongside gains.
6. For the leading opportunities, propose the smallest discriminating experiment,
   an external check of success, needed access, and a bounded budget. Recommend
   one next move and explain why. Use an available prepare-agent-objective skill
   when the user selects an outcome or already authorized its pursuit.

Return a short ranked opportunity table with evidence, targets, assumptions,
first experiments, and capability gaps. Discovery alone ends with recommendations;
continue already-authorized work without treating reframing as permission to expand
product scope. A larger change must earn its cost through a better outcome.
