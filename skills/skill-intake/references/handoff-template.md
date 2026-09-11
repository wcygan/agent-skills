# Implementation handoff

Use this when the result must travel to another session or maintainer. A same-session implementation can consume the intake brief directly.

Include the following, with concrete names and paths and no unused placeholders:

- **Decision and motivation:** create, extend, split, script, document, one-off, or defer; source examples and why the nearest alternative was rejected.
- **Target and ownership:** repository, skill name and path, overlap already inspected, and local or upstream maintenance ownership.
- **Capability and selection:** proposed description, distinguishing trigger, nearby non-triggers, and representative requests.
- **Essential guidance:** domain knowledge, constraints, decisions, inputs, and outputs. Specify sequence only where correctness or dependencies require it.
- **Completion and authority:** result and evidence, already-authorized actions, missing decisions or permissions, and behavior when evidence or companions are unavailable.
- **Resources:** only justified scripts, assets, or references, with a reading condition for each reference.
- **Checks:** applicable repository requirements and checks appropriate to any scripts or fragile operations; preserve the user's explicit constraints.

For a new catalog skill, use `new-plugin` conventions and create `skills/<name>/SKILL.md` with a matching name and supported Agent Skills frontmatter. For an extension, identify the existing owner and sections that change; avoid creating an overlapping sibling. Use `writing-for-agents` when available, keeping independently installed skills self-contained.

Follow the target repository's maintenance rules. In this repository, validate each changed skill with:

```sh
uv tool run --from skills-ref agentskills validate ./skills/<name>
```

Run `just check-full` for the shared repository and publication gate when required and permitted. Avoid prescribing duplicate distribution checks already covered by that gate. Report checks skipped under explicit user constraints. Preserve source attribution and use the repository's ownership process for vendored changes.

For non-skill decisions, specify the actual deliverable and evidence rather than routing through a skill generator. For `defer`, state the exact decision or evidence blocking implementation and any independent work that can proceed.

The handoff must be understandable without the original chat and preserve the user's authority. Commits, installation, pushes, and publication are included only when requested. Report the completed work, evidence, and residual gaps.
