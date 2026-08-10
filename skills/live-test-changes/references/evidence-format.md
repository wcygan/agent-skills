# Live-Test Evidence Format

Use this reference after execution. Build the report from observed evidence.
Keep commands reproducible and keep claims within their proof boundaries.

## Evidence quality

Label evidence by source:

- **Observed:** This run produced the result against the bound candidate.
- **Repository-derived:** Executable repository content defines the expected path.
- **User-reported:** The user supplied the result without current observation.
- **Unverified:** The required observation was unavailable.

Use observed evidence for the live-test verdict. Supporting evidence cannot
replace a missing runtime observation.

Bind each result to:

- the candidate revision and dirty-state identity;
- the built artifact or image identity;
- non-secret configuration and feature-flag state;
- local service, port, fixture, and dependency identity; and
- the exact case input and authoritative observation.

## Reproducible Bash

Write Bash blocks that a teammate can copy in order. State the repository
location and prerequisites before the first block.

Apply these rules:

- Use repository-native commands.
- Prefer non-interactive commands.
- Start bounded sequences with `set -euo pipefail` when compatible.
- Quote shell variables.
- Use task-specific variable names.
- Avoid machine-specific absolute paths.
- Use unique temporary directories and resource names.
- Show readiness checks and their bounds.
- Make expected status checks executable.
- Preserve nonzero exit status when it is the observation.
- Place commands and observed output in separate fences.
- Replace secret values with named environment variables.
- Remove credentials, tokens, cookies, and personal data.
- Keep stable identifiers in variables across commands.
- Show cleanup commands after the exercise commands.
- Never invent a command, response, or result.

Use a clear shell preamble when it fits the repository:

```bash
set -euo pipefail

live_test_run_dir="$(mktemp -d /tmp/live-test.XXXXXX)"
readonly live_test_run_dir
```

Do not use the preamble when the repository needs a different shell or owns a
safer run-directory command.

## Response capture

Show the full request command. Show the decisive response fields and status.
Label any omitted response content.

For large artifacts, record:

- the producing command;
- the artifact path relative to the repository or run directory;
- file size and digest when material;
- the decisive excerpt or structured query; and
- the retention or cleanup decision.

Preserve raw response content when normalization could hide the behavior.
Otherwise, replace volatile values with shell variables and explain the
normalization.

## Report structure

Return these sections:

```text
## Live test result
Status:
Claim:
Candidate:
Local environment:
What the evidence proves:
What remains unproved:

## Test plan
case | path | input | expected result | authoritative observation

## Deployment evidence
Prerequisites:
Commands:
Observed readiness:
Runtime identity:

## Execution evidence
One subsection for each case.

## Feature flag comparison
state | active-state evidence | request or action | observed behavior | result

## Testing Done
Paste-ready pull request text.

## Cleanup and retry
Commands:
Observed cleanup:
Remaining local state:

## Gaps
Unavailable proof:
Environment substitutions:
Residual risks:
```

State `Feature flags: not applicable` instead of creating an empty comparison
table.

## Live-test status

Select status from the required evidence:

| Status | Required meaning |
|---|---|
| `PASS` | Every required case matches its authoritative expected result. |
| `FAIL` | One observed required case contradicts the claim. |
| `PARTIAL` | Useful cases ran, but required proof, cleanup, or retry-state confirmation remains incomplete. |
| `BLOCKED` | Safe deployment or execution could not start or continue. |

Do not turn an unavailable case into a pass. A cleanup failure remains visible
even when the behavior cases pass.

## Testing Done section

Make this section useful without the earlier report. Include:

- candidate context;
- prerequisites;
- local deployment and readiness commands;
- exact requests or actions;
- observed outcomes and exit status;
- feature-flag comparison when applicable;
- cleanup commands; and
- proof limits.

Use this shape:

```text
## Testing Done

Candidate and environment:

Prerequisites:

Deployment and readiness:

Reproduction commands and observed results:

Feature flags:

Cleanup:

Limits:
```

Keep the section concise enough for review. Include decisive output directly.
Link retained artifacts only when the destination is durable and authorized.

## Final review

Before reporting, confirm:

- another teammate can run the commands in order;
- prerequisites and working directory are explicit;
- every result has an observed response or state;
- each flag state has active-state proof;
- dynamic values remain traceable;
- secrets and personal data are absent;
- cleanup targets only run-owned state; and
- proof limits are explicit.
