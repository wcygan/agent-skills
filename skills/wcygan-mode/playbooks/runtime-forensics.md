# Runtime forensics

Diagnose a live runtime symptom.

1. Bound the symptom, environment, and reproduction conditions. Establish which
   process or instance belongs to the task before attaching instrumentation.
2. Capture a baseline, then use available profiling or observation tools to connect
   the symptom to execution, allocation, scheduling, or resource contention.
3. Form competing explanations and run the smallest discriminating observation.
   Account for instrumentation overhead and preserve raw evidence.
4. Use `wcygan-investigate` to map the evidence to source.

Complete with the supported cause, alternatives eliminated, and remaining unknowns.
Continue into a fix only when one was requested, because the user asked for a
diagnosis; otherwise hand off the findings.
