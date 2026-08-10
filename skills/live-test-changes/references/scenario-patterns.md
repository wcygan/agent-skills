# Live-Test Scenario Patterns

Read only the sections that match the selected public path. These patterns
refine evidence capture. Repository commands and contracts remain authoritative.

## HTTP or RPC boundary

Capture the exact method, URL, headers that affect behavior, request body,
response status, and decisive response fields.

Write credentials as environment-variable references. Remove cookies, tokens,
session identifiers, and personal data from the report.

Prefer status capture that supports an explicit assertion:

```bash
response_file="$live_test_run_dir/response.json"
response_status="$(
  curl --silent --show-error \
    --output "$response_file" \
    --write-out '%{http_code}' \
    "$live_test_url"
)"
test "$response_status" = "$expected_status"
```

Use repository-required headers and request data in the actual command. Record
the response body after the assertion.

For an expected rejection, assert its expected error status. Do not use a
success-only helper that hides the response body.

## Command-line boundary

Record the executable identity, arguments, working directory, relevant
environment, standard output, standard error, and exit status.

When failure is expected, capture the status without ending the evidence
script before the assertion:

```bash
set +e
command_output="$(repository_command 2>&1)"
command_status="$?"
set -e

test "$command_status" -eq "$expected_status"
printf '%s\n' "$command_output"
```

Replace `repository_command` and the expected status with observed,
repository-specific values in the final report.

## Browser or desktop boundary

Record the startup command, URL or application identity, viewport or platform,
fixture, user actions, visible result, and supporting durable state.

Use browser automation when the repository already provides it. Otherwise,
record numbered manual actions with exact labels and inputs.

A screenshot proves visible state at one moment. Pair it with the backing API,
database, event, or reopened application when the claim includes persistence.

Record the screenshot or recording path, candidate identity, and capture time.
Keep media only at a durable, authorized location.

## Background job or queue boundary

Submit work through the public entry point. Capture its correlation identifier
and initial accepted state.

Use a bounded poll against the authoritative job or workflow state. Record
meaningful transitions and the terminal state. Preserve the earliest failure
when the job does not complete.

Do not treat enqueue success as proof of downstream completion. Check the
durable effect owned by the final consumer.

## Database or durable-state boundary

Use a run-owned record identifier. Capture the public action that should change
state, then query the authoritative local store through a safe read path.

Select only fields that prove the claim. Record transaction or workflow state
when intermediate state matters.

Clean only records created by the run. Preserve them when cleanup would remove
failure evidence, and report the retained identity.

## Feature flags

First classify the flag:

| Flag type | Required isolation |
|---|---|
| Build-time | Separate builds with distinct artifact identities. |
| Startup | Separate starts with explicit configuration evidence. |
| Runtime | Isolated toggle state with a confirmed active value. |

Record the default, source, evaluation subject, and active-state observation.
Use the same meaningful input for both behavioral cases.

Test in this order unless repository behavior requires another order:

1. Establish the disabled state.
2. Prove the disabled state is active.
3. Run and record the disabled behavior.
4. Reset mutable scenario state.
5. Establish the enabled state.
6. Prove the enabled state is active.
7. Run and record the enabled behavior.
8. Restore the original run-owned state.

Do not infer active state from the requested configuration alone. Use startup
output, a configuration endpoint, evaluation trace, or distinct artifact
identity when available.

Record the comparison:

```text
state | configuration command | active-state evidence | input | observed result
```

## Multiple local services

Start only services required by the selected path. Record each service version,
port, readiness signal, and local dependency.

Use one run-owned namespace when the tooling supports it. Keep startup and
cleanup order explicit. A healthy entry service does not prove that downstream
services are ready.

## External dependencies

Prefer a repository-configured local emulator, fake, or sandbox. State the
substitution and the behavior it cannot prove.

Stop before a paid call, shared-system write, or unauthorized network request.
Do not call a local deployment live proof of an external provider when the
provider was substituted.
