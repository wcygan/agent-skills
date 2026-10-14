# Trace forensics

Diagnose a supplied profile, trace, or snapshot.

1. Identify the artifact format, capture environment, time window, and sampling limits.
   Keep the original artifact unchanged.
2. Inspect available symbols and distinguish cumulative from self cost, wall time
   from CPU time, and sampling from exact counts as applicable.
3. Follow the expensive or anomalous paths into source using
   [investigate](../../wcygan-investigate/SKILL.md). Check competing interpretations.
4. State what another capture or live observation would resolve if the artifact
   cannot establish causality.

Complete with evidence pointers into the artifact, a calibrated diagnosis, and the
limits of the capture. A trace interpretation is not a verified fix.
