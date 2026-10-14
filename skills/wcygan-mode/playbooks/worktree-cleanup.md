# Worktree cleanup

Assess repository workspaces for safe reclamation.

1. Inventory workspaces and determine their owners, local changes, remote state,
   and active operations. Use the observational Python audit in
   [tools](../references/tools.md) where applicable.
2. Treat unknown ownership, untracked files, and unavailable remote evidence as
   unresolved. Age or a closed proposal alone does not establish disposability.
3. Present the evidence for each candidate. Recheck live state immediately before
   any separately authorized cleanup and prefer recoverable archival when available.
4. Use the environment's supported lifecycle for managed workspaces. Simulator or
   other non-repository cleanup requires separately available, scoped tooling.

Complete with an audit for assessment requests, or confirmed reclamation and preserved
work for cleanup requests. The bundled audit script never deletes resources.
