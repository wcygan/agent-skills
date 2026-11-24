# Assess impact

1. Read the change and identify the one or two assumptions its safety depends on.
2. Trace affected callers and less visible contracts: serialized data, stored state,
   external consumers, execution order, configuration, and pinned dependency behavior.
3. For each plausible failure, show a reachable path and its consequence. Separate
   demonstrated risks, cleared risks, and hypotheses still needing evidence.
4. Prove the crucial safety assumption with the smallest meaningful check against
   actual code or behavior. Inspect dependency implementations when their semantics
   determine the answer, because a function name or a search hit shows that a
   symbol exists, not what it does.
5. Take each safety assumption as far down this list as is cheap, and report
   the level where it stopped:
   1. Source evidence: a `file:line`, or the dependency's own source.
   2. Traced impossibility: the failure walked step by step and shown not to reach.
   3. Executable proof: a script or test that runs the actual code and fails
      when the assumption is wrong.
   4. Observation in the running system.

   An assumption that reached none of these is unproven; mark it as such.

Done when consequential risks have evidence and a disposition, and the safety
claim is proven to the stated level or remains explicitly unresolved.

Adapted from Lauren Tan’s Pstack. [blast-radius](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/blast-radius). [MIT license](../LICENSE.txt).
