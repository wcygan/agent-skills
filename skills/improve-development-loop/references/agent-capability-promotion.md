# Promote an agent-operable capability

Read this reference after a tooling improvement has a proven command contract.
Use it to decide whether the workflow needs a project-specific agent skill.

## Separate the layers

Use this ownership model:

```text
project-specific skill -> stable project command -> tested script -> application tools
```

Not every workflow needs every layer.

- The project-specific skill owns judgment, authority, evidence, and recovery.
- The project command owns a stable and discoverable entry point.
- The script owns substantial mechanics and error handling.
- The application tools own the underlying behavior.

A `justfile` is a good project command surface when the project uses `just`.
Use a uv-managed script when Python fits the repository and needs dependencies.
Use an existing native script when it already owns the behavior.

Do not move application logic into recipes. Do not copy recipe or script logic
into the project skill.

## Apply the promotion gate

Promote the capability only when all required conditions pass:

| Condition | Required evidence |
|---|---|
| Recurring scenario | The workflow supports a repeated project operation. |
| Stable entry point | One documented command starts the bounded operation. |
| Agent judgment | The agent must select, sequence, interpret, or recover. |
| Bounded authority | Inputs, side effects, approvals, and stop conditions are explicit. |
| Checkable result | Success, failure, artifacts, and retry results are observable. |
| Durable contract | The operating guidance survives internal implementation changes. |

Record one of these decisions:

- **Promote:** All conditions pass. Create or extend a project skill.
- **Defer:** The scenario is useful, but its command or evidence is unstable.
- **Do not promote:** The operation is one-off or fully mechanical.

Keep a fully mechanical operation in the task runner or script. Do not create a
skill that only restates one command.

## Select companion skills

Use companion skills only when their surface applies:

- Use `just` to design or change a `justfile` command contract.
- Use `uv-python` to design or change a uv-managed Python script.
- Use `writing-for-agents` to create or change the project-specific skill.

Do not require `just` or uv when the project has an adequate command surface.
Do not install a missing tool without user authority.

If a required companion skill is unavailable, keep the validated tooling
improvement. Report that project-skill promotion remains incomplete.

## Define the project skill contract

The project skill must define:

1. The project scenarios that activate the skill.
2. The evidence used to select one scenario.
3. The required repository and runtime prerequisites.
4. The safe project commands for each scenario.
5. The inputs, scope, side effects, and approval gates.
6. The success and failure evidence.
7. The artifact and log locations.
8. The cleanup, retry, and stop conditions.
9. The actions that remain outside the skill's authority.

Use the repository's established skill location and naming rules. Keep the main
skill concise. Put detailed project guidance behind precise reference pointers.

Treat current project files and command help as the exact source of syntax.
Name stable public commands when useful. Do not duplicate recipe bodies, uv
flags, script internals, generated help, or broad tool documentation.

Prefer one project skill for one coherent operating responsibility. Do not
create one skill for each recipe.

## Build from the lowest stable layer

Use this sequence:

1. Reproduce the representative development scenario.
2. Define the bounded command contract.
3. Implement and test substantial mechanics in the project script layer.
4. Expose the operation through the established project command surface.
5. Verify success, one relevant failure, cleanup, and retry.
6. Apply the promotion gate to the proven operation.
7. Use `writing-for-agents` to create or extend the project skill.
8. Validate skill structure and exercise its operating instructions.

Skip an unnecessary layer. Preserve the same authority and evidence contract
when a script or application command is the direct entry point.

## Verify the promoted capability

Test the project skill from a representative starting state. Confirm that an
agent can:

- identify the correct scenario;
- discover the current project command;
- check prerequisites before execution;
- stay within the declared authority boundary;
- distinguish success from partial or failed results;
- find the relevant logs or artifacts; and
- complete a safe cleanup and retry.

Validate the skill with the repository's standard skill validator. Run the
project command checks required by its changed layers.

Promotion is complete only when the tooling path and the project skill pass
their checks. A validated skill file does not prove the application workflow.

## Reject weak promotions

Do not promote these patterns:

- a skill that copies `just --list` output;
- a skill that teaches general `just` or uv usage;
- a wrapper skill for one self-explanatory command;
- an unbounded production or external-state operation;
- a workflow without reliable success or failure evidence;
- a workflow that depends on hidden shell state or personal paths; or
- a project skill that replaces missing tests or error handling.

Report a deferred or rejected promotion as a decision. Do not claim that the
project is agent-operable when the promotion gate or runtime checks fail.
