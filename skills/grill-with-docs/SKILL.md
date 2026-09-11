---
name: grill-with-docs
description: "Interview the user to sharpen a plan or design while recording its terminology and decisions. Use when the user wants a design interview with durable project notes."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/grill-with-docs"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

Interview the user about the unresolved decisions in their plan or design, using `grilling` and `domain-modeling` when available. Look up discoverable facts yourself; ask dependent questions only after their prerequisites are settled.

Record agreed terminology in the project's glossary and durable architectural tradeoffs in its decision records, creating files only when there is useful content. Keep a review-only request read-only; this skill's default interview-with-documents workflow includes the requested notes.

If companions are unavailable, conduct the interview and maintain the notes directly. The phase is complete when the required decisions and their rationale are recorded. Continue implementation when also requested and no consequential decision remains open.
