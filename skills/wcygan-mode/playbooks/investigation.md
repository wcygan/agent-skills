# Investigation

Explain or diagnose from code, history, or runtime evidence.

1. Bound the question and scope. Use [clarify-task](../references/methods/clarify-task.md) for ambiguity and
   [recover-context](../references/methods/recover-context.md) for resumed work.
2. Use [explain-code](../references/methods/explain-code.md) for behavior and ownership, [explain-history](../references/methods/explain-history.md) for rationale
   or regressions, and [assess-impact](../references/methods/assess-impact.md) for a proposed change's downstream effects.
3. Choose runtime evidence when source alone cannot answer the question:
   - For a live symptom, identify the owned process and reproduction conditions,
     capture a baseline, and run the smallest observation that separates plausible
     causes. Account for instrumentation overhead and preserve the capture.
   - For a supplied trace, profile, or snapshot, establish format, environment,
     time window, and sampling limits. Preserve the original. Distinguish self
     from cumulative cost, CPU from wall time, and sampling from exact counts.
   Map observations back to source and say what another capture would resolve.
4. Report confirmed findings, plausible explanations, and evidence gaps. Continue
   into a fix when requested. An explanation-only request ends with the answer.

Complete with evidence for the conclusion and any limits on it.
