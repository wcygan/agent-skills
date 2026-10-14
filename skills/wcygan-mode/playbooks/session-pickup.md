# Session pickup

Resume a particular prior task from its records and artifacts.

1. Read the supplied checkpoint and use [recover-context](../../recover-context/SKILL.md)
   to recover scope, decisions, authorization, artifacts, owners, and incomplete work.
2. Reconcile files, revisions, running operations, and external state against the
   checkpoint. A previous summary is evidence to inspect, not authoritative live state.
3. Stop duplicate writers before resuming their work or isolate a replacement. Keep
   existing valid evidence when it still covers the current artifact and environment.
4. Resume the matching playbook from its first unmet condition.

Complete the resumed task or hand back a verified current-state brief when pickup
alone was requested. Preserve user checkpoints and do not infer missing history.
