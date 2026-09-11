---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/productivity/grilling"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask a manageable set of independent frontier questions in each round, with a recommendation where evidence supports one. Then wait for the user's answers before the next round.

Use a concise question format that makes the decision and recommendation easy to compare. For example:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree — settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Look up discoverable facts yourself, or delegate a bounded investigation when useful and permitted. Continue independent questions while that evidence is gathered. Ask the user for consequential preferences or decisions the available context does not settle; preserve answers already supplied.

The interview phase is complete when decisions needed for the requested outcome are settled and remaining assumptions are explicit. Do not invent answers to unresolved user decisions. If implementation was also requested, continue once its prerequisites are settled; no additional confirmation ceremony is needed.
