# Review triage

Use this for findings from people or automated reviewers. Judge the current
artifact and actual contracts, including surrounding code and downstream callers.

- **Fix:** a reachable correctness, security, or maintenance problem has evidence.
  Correct the cause within the authorized scope and verify the result.
- **Dismiss:** current evidence disproves the claim or demonstrates that it is a
  preference without a material cost. Record the concrete reason.
- **Investigate:** the finding lacks enough context or proof. Run the cheapest
  discriminating check before deciding. Ask about unresolved product choices.

A stale finding may already be fixed; check its revision and current behavior.
An intentional visual change still needs accessibility and interaction scrutiny.
An alleged unused API may have external or dependent consumers; inspect them.
A future cleanup promise does not excuse a new regression.

Independent agreement strengthens a signal without proving it. A lone serious
finding still deserves investigation. Historical dismissals are evidence to
check, not a blanket rule for future findings.

Replying to or resolving external review threads follows the user's scope.
A review-only request produces findings rather than edits or posted messages.
