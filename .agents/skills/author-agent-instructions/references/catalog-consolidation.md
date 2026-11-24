# Consolidating the skill catalog

The [November 2026 consolidation](https://github.com/wcygan/agent-skills/commit/ea1a59652b482118db175d866d5ff45bfe00f8e3)
reduced 76 public entrypoints to 15. An [earlier reset](../../../../archive/2026-10-14/README.md)
archived a 116-skill catalog and retained three before the catalog grew again.
Use the requests people need to make to decide how many entrypoints to keep.

| When reviewing a skill | What we did |
| --- | --- |
| People ask for a distinct result and can use it on its own | Kept `verify-behavior` for one-off checks and combined creation and repair of reusable project checks in `verification-skill`. They produce different deliverables. |
| Several skills describe phases of the same job | Kept `wcygan-mode` as the engineering entrypoint. Its playbooks select methods such as bug reproduction and delivery. Its index keeps all 24 principles available by name. |
| Two skills share the work and differ in format or depth | Moved the HTML renderer under `review-changes`. A normal review ends in the reply, and a request for an HTML report loads the renderer. Both use the same findings. |
| A related request needs its own stopping point | Folded performance measurement into `wcygan-experiment`. A baseline request ends with measurements and a rerun command. Optimization continues only when requested. |
| The capability is deliberately being dropped | Retired `agent-desktop` and `lean-verify` outright and recorded where to find their historical source. |

Migrate one family at a time. We started with delivery and checked that drafting
PR copy stayed local and opening a PR still required authorization. For each
move, update in-repo callers and the [replacement table](../../../../README.md#replacements-for-retired-skill-names),
carry the needed scripts, references, and licenses into the owning skill, and
remove the old entrypoint. Try representative requests through the new route.
Check the resulting artifact and stopping point, then verify discovery and
links in the installed package.
