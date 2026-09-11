---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/implement"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

# Implement the requested work

Use the supplied spec, tickets, and conversation to identify the required behavior and completion evidence. Inspect the affected code and follow its established conventions. Resolve routine implementation choices directly; ask only when a missing decision materially affects the result or scope.

Carry the work through implementation and the checks appropriate to the change. Honor the user's testing constraints and repository requirements. Repeat a check when a new change or failure makes its previous result insufficient; do not prescribe repeated tests or a full suite regardless of scope.

Use `tdd` when the user requests test-first development or it fits an agreed testing seam. Use `code-review` when an independent review would materially improve confidence; neither companion's availability is a prerequisite to implementing the work.

Completion means the requested behavior is implemented, relevant checks are accounted for, and failures caused by the changes are resolved or clearly reported. Report the result, evidence, and remaining limitations. Commit, push, or publish only when included in the user's authorization.
