# Promptfoo Adapter

Use this reference only when Promptfoo is selected or seriously compared. Keep
cases and oracle definitions portable outside Promptfoo YAML or JavaScript.

## Verify current capability

Before recommending installation or writing configuration, inspect current
primary sources:

- <https://github.com/promptfoo/promptfoo>
- <https://www.promptfoo.dev/docs/providers/http/>
- <https://www.promptfoo.dev/docs/providers/custom-api/>
- <https://www.promptfoo.dev/docs/configuration/expected-outputs/>
- <https://www.promptfoo.dev/docs/tracing/>
- <https://www.promptfoo.dev/docs/integrations/ci-cd/>

Verify the package version, Node runtime, provider contract, assertion types,
trace receiver and trajectory support, output formats, caching, sharing
behavior, and CI exit semantics. Pin the package through the repository's
normal dependency or tool-management path; avoid floating `latest` commands in
gates.

## Select Promptfoo when

- a Rust, Java, Go, Python, TypeScript, or other service exposes a bounded HTTP
  or RPC-to-HTTP test boundary;
- evaluations compare providers, models, prompts, or application variants;
- JavaScript or TypeScript assertions naturally express domain checks;
- a custom provider must normalize an application-specific response;
- OpenTelemetry traces must support cross-language trajectory assertions; or
- the repository already uses Promptfoo and no material gap requires another
  harness.

Promptfoo's implementation language does not require the application to use
Node. It does add a Node-based evaluation runtime, so account for that
prerequisite in pure Rust or other non-Node repositories.

## Choose the narrowest provider

1. Use the HTTP provider when request construction and response extraction are
   sufficient.
2. Use a small TypeScript or JavaScript provider when the suite needs typed
   normalization, application-specific metadata, fixture setup, or multiple
   bounded calls.
3. Use a script provider only when no stable service boundary exists and the
   command has explicit inputs, timeout, output schema, side effects, and
   cleanup.

Do not import browser-only frontend modules, CSS, bundler plugins, or ambient UI
state into a Node provider. If the frontend owns agent orchestration, expose a
Node-compatible application seam or exercise a running bounded boundary.

## Return an evaluable response

Normalize only fields supported by the application contract, such as:

```text
answer or structured outcome
citations or retrieved evidence
tool and argument receipts
durable-state or workflow receipts
usage and cost
latency with units
trace identity
candidate metadata
```

Keep the public production API unchanged when an existing trace, event, or test
adapter can expose this evidence. A provider transform is not an authoritative
state owner; assertions should follow receipt references to durable state when
the behavior requires it.

## Layer assertions

Prefer this order:

1. response status, schema, and required fields;
2. deterministic JavaScript, TypeScript, or domain assertions;
3. tool, argument, citation, cost, latency, and trajectory assertions;
4. reference-based semantic assertions; and
5. calibrated model-graded rubrics.

Give named metrics one meaning each. A weighted aggregate may summarize a run,
but prohibited actions and required durable effects remain hard guards.
Preserve component assertion reasons so one low aggregate score does not hide
the responsible property.

## Use OpenTelemetry deliberately

Use Promptfoo's trace receiver only when component behavior is part of the
contract. Configure the application to export run-owned evaluation traces to
the local receiver, propagate the evaluation and operation identities, and use
stable semantic attributes for tools, arguments, attempts, retrieval, errors,
and outcomes.

Bound exporter retries, buffering, shutdown, and cleanup. Missing trace data is
a failed or blocked component assertion, not an automatic pass. Do not export
unrelated application traffic or sensitive payloads merely to populate the
viewer.

## Keep CI reproducible

Expose one pinned, non-interactive command with explicit config and artifact
paths. Disable sharing by default. Record candidate, provider, grader, cache,
and test-set identities with structured output. Use JUnit only for compact test
viewer integration; retain a richer structured artifact when failure diagnosis
needs prompts, outputs, assertion reasons, or provider errors.

Separate application retries from evaluator retries and decide whether cached
responses are valid for the claim. Disable or namespace caches when comparing
candidate behavior that the cache key cannot distinguish.

## Implementation checklist

1. Add one representative case and deterministic assertion.
2. Add the narrowest provider for the real application boundary.
3. Capture the candidate and trace identities.
4. Prove the assertion fails on a controlled counterexample.
5. Add one semantic rubric only when a mechanical oracle is insufficient.
6. Run with bounded concurrency, timeout, retries, and cost.
7. Retain structured failure output without enabling sharing.

Completion requires a pinned command, a passing representative case, a
controlled failing case, useful local artifacts, and an explicit Node runtime
and external-call boundary.
