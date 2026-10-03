# Connected deployment workspace brief

User and task: operators work alongside agents to understand and ship software;
reviewers approve an exact staged artifact before production.

Desired outcome: one connected Bun/Start application that uses the established
neutral prototype styling and removes navigation/context switching between demos.

Mode: from scratch application architecture; adapt the already selected visual
language. The original HTML prototypes informed this connected reference; they are not embedded routes.

Scope: overview, roadmap tickets, application deployments, approval requests,
team discussion, preferences, public product page, and contextual read-only agent.
No real CI execution, deployment, OAuth, email delivery, or user authentication.

Business rule: production deployment requires staging readiness and an unused
approval for the same release/artifact, enforced in a server transaction. Reviewer
roles are explicitly simulated. Operators keep an explicit deployment action after
approval. Failed and stale operations preserve input and show recovery.

Structure: goal → ticket → application release → approval → production → team
progress update. One header serves all destinations. Related record links and
agent sources preserve context; forms disclose review only after meaningful input.

Acceptance evidence: strict types/lint; real SQLite service tests for unauthorized
state transition, wrong-artifact approval, stale decision, replay, draft/resubmit,
restart durability and seeding preservation; production browser journeys through
all pages and the full approval workflow; desktop/mobile layout and focus checks.
Live provider quality, real permission enforcement, and native file-content upload
are outside this scaffold. Attachments use names only.

Authorized delivery: runnable local application and preview. No Git commit,
repository publication, or production deployment was requested.
