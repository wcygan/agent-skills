# Runtime forensics

Diagnose a live runtime symptom.

1. Bound the symptom, environment, and reproduction conditions. Establish which
   process or instance belongs to the task before attaching instrumentation.
2. Capture a baseline, then use available profiling or observation tools to connect
   the symptom to execution, allocation, scheduling, or resource contention.
3. Form competing explanations and run the smallest discriminating observation.
   Account for instrumentation overhead and preserve raw evidence.
4. Use [investigate](../../wcygan-investigate/SKILL.md) to map the evidence to source.

Complete with the supported cause, alternatives eliminated, and remaining unknowns.
Diagnosis does not authorize a product edit; preserve a handoff for an already-requested fix.
