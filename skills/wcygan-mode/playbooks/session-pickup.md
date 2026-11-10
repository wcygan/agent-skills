# Session pickup

Resume a particular prior task from its records and artifacts.

1. Read the supplied checkpoint and use `recover-context`
   to recover scope, decisions, go-aheads already given, artifacts, owners, and
   incomplete work.
2. Reconcile files, revisions, running operations, and external state against the
   checkpoint. A previous summary is evidence to inspect, not authoritative live state.
3. Stop duplicate writers before resuming their work or isolate a replacement. Keep
   existing valid evidence when it still covers the current artifact and environment.
4. Resume the matching playbook from its first unmet condition.

Complete the resumed task or hand back a verified current-state brief when pickup
alone was requested. Honor the user's checkpoints. Where history is missing, say
so rather than guessing, because a guessed state can repeat or undo finished work.
