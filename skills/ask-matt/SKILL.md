---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/ask-matt"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

# Choose a skill for the current need

Select the smallest workflow that advances the user's request. Use the available skill catalog to confirm names and capabilities; this map covers common engineering routes, not a required idea-to-shipping sequence.

| Current need | Useful owner | Distinguishing condition |
| --- | --- | --- |
| Clarify a plan or decision | `grilling` | The user wants an interview or unresolved choices need their judgment. |
| Clarify a design and retain project decisions | `grill-with-docs` | The request includes durable terminology and design notes. |
| Answer a design question by running something | `prototype` | Conversation or source inspection cannot establish the answer. |
| Produce a spec or implementation tickets | `to-spec`, then `to-tickets` if needed | The user requested those artifacts; a clear local change need not create tickets. |
| Implement known work | `implement` | Requirements are sufficiently clear to build and check. |
| Work test-first | `tdd` | Test-first development is requested. |
| Review changes | `code-review` | Standards and requested behavior need independent assessment. |
| Diagnose a failure with a feedback loop | `diagnosing-bugs` | A reproducible failure or regression needs investigation or repair. |
| Diagnose a difficult stateful or distributed bug | `diagnose-difficult-bug` | Reproduction, failure propagation, and causal confidence need a combined account. |
| Process incoming issues | `triage` | Raw reports need classification or clarification; generated implementation tickets usually do not. |
| Map a large, uncertain effort | `wayfinder` | Unresolved decisions span more than one session. |
| Assess architecture | `improve-codebase-architecture` | The target module boundary is not yet chosen. |
| Design a selected module | `codebase-design` | Interface depth, ownership, and seams are the question. |
| Clarify domain terms | `domain-modeling` | A concept or shared word is ambiguous. |
| Resolve a merge or rebase | `resolving-merge-conflicts` | A Git operation is already conflicted. |
| Investigate external evidence | `research` | Primary sources are needed for a specific question. |
| Prepare a human-only procedure | `wizard` | Essential actions require human access or judgment. |
| Improve an unclear response | `wait-what` | The last explanation did not land. |
| Write agent instructions | `writing-for-agents` | Skills, repository instructions, or supporting documents need authoring. |

Explain the selected route and the evidence for it briefly. If asked only which skill fits, the recommendation completes the request. If the user also requested the work, continue through the selected workflow within existing authority. Missing companions do not prevent direct work when sufficient knowledge and tools are available; identify any essential gap.

Use `setup-matt-pocock-skills` only when a requested workflow actually needs missing tracker, label, or document conventions. Local review and implementation do not require tracker setup.

Read [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md) when deciding whether context should be carried into a different session or delegated task. Keep related work in the current session when it remains useful; avoid mandatory clearing, compaction, or handoffs.
