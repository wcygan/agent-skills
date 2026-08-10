# DeepEval Adapter

Use this reference only when DeepEval is selected or seriously compared. Keep
the suite's evaluation contract independent from DeepEval classes and storage.

## Verify current capability

DeepEval changes quickly. Before recommending installation or writing code,
inspect current primary sources:

- <https://github.com/confident-ai/deepeval>
- <https://github.com/confident-ai/deepeval/tree/main/typescript>
- <https://deepeval.com/docs/>
- <https://deepeval.com/docs/evaluation-llm-tracing>
- <https://deepeval.com/docs/metrics-tool-correctness>

Verify the package version, supported runtime, local-versus-platform behavior,
test runner, relevant metrics, trace/span integration, TypeScript parity, and
data-upload defaults. Treat repository examples and documentation as current
evidence only for the version being selected.

## Select DeepEval when

- the application or eval adapter is naturally Python-native;
- Pytest-style cases should live beside application tests;
- built-in RAG, conversational, agent, or custom metrics fit the contract;
- Python-level trace and span instrumentation provides required component
  evidence; or
- the repository already uses DeepEval and no material gap requires another
  harness.

A non-Python application can still be evaluated through a Python adapter that
calls its public HTTP, RPC, CLI, or recorded-output boundary. That is a
black-box eval; the Python wrapper does not prove internal Rust, Java, or
TypeScript component behavior by itself.

## Map the contract

Keep one explicit mapping from framework-neutral evidence to DeepEval inputs:

```text
case input -> test-case input
observable answer -> actual output
reference answer -> expected output, when justified
retrieved evidence -> retrieval context
observed tool receipts -> tools called
required tool receipts -> expected tools
component evidence -> selected trace or span
behavior threshold -> metric threshold
candidate identity -> run metadata or retained artifact
```

Use deterministic assertions outside or alongside model metrics for schemas,
tool arguments, identifiers, citations, and durable effects. Do not treat a
referenceless metric as proof of application state.

## Choose evaluation depth

- Use an end-to-end test case for a bounded user-visible behavior.
- Use a trace-level metric when the whole agent outcome and observable path are
  material.
- Use a span-level metric for one retriever, tool, model call, or subagent when
  component localization is required.
- Pair a component case with an end-to-end case when the defect crosses layers.

Instrument only the scopes required by the evaluation contract. Name traces
and spans by domain responsibility, propagate stable operation identity, and
avoid recording secrets or private reasoning.

## Keep execution local by default

Pin DeepEval and its Python dependencies in the repository's existing lock.
Use the repository's supported Python runner and expose one focused command.
Keep optional platform login, uploads, production tracing, and shared reports
disabled until the user authorizes their data, retention, credential, and cost
boundaries.

Inspect environment-loading behavior and prevent fixture credentials or private
data from entering retained results. A successful local metric run does not
prove cloud reporting, production monitoring, or a non-Python internal trace.

## TypeScript selection gate

Inspect the current TypeScript package and documentation before selecting it.
Confirm that the exact required local metrics, test execution, trace support,
and CI behavior exist in the pinned release. When parity is incomplete, prefer
Promptfoo, a native TypeScript harness, or a small Python adapter rather than
promising Python behavior from a TypeScript package.

## Implementation checklist

1. Add one scrubbed representative case and its lowest reliable oracle.
2. Call the real bounded application boundary or a declared recorded fixture.
3. Pin grader, rubric, model, and framework identity.
4. Capture metric score, reason, trace or receipt reference, latency, cost, and
   failure details as applicable.
5. Exercise a controlled failing output to prove the assertion goes red.
6. Run through the repository's normal test command or an explicitly named
   eval command.
7. Add CI only after local behavior, cost, and variance are known.

Completion requires a repeatable focused command, a passing representative
case, a controlled failing case, and no implicit cloud or external-data effect.
