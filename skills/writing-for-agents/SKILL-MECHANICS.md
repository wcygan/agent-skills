# Skill Mechanics

Use this reference when writing skill descriptions, changing invocation policy, or deciding whether to split a skill.

## Descriptions

State the capability and the task that needs it. Put the distinguishing trigger early so shortened descriptions retain useful selection information.

For example:

> Create and validate Postgres migrations. Use when adding or changing a migration, or reviewing its rollout.

Keep detailed procedures, output schemas, and capability lists in the body or references. Add exclusions only when they prevent likely selection errors.

Compare descriptions with nearby skills. Shared vocabulary does not prove overlap; compare the requested job and result.

## Invocation policy

Keep automatic selection enabled unless the user requests explicit-only invocation. Preserve existing policy during unrelated edits.

Descriptions remain required skill metadata. Invocation controls depend on the client; use its supported configuration rather than assuming a universal frontmatter switch.

For Codex, an explicit-only policy uses `agents/openai.yaml`:

```yaml
policy:
  allow_implicit_invocation: false
```

This controls automatic selection. It does not grant permission for external actions or replace checks at the actual action boundary.

A public catalog can support different installed subsets. Do not assume every consumer needs every skill or uses the same model.

## Splitting and routing

Split when separate jobs need independent selection and distinct outcomes. Each new description adds selection cost, so prefer the smallest useful catalog.

Keep variants together when they share a trigger and result. Route to substantial mode-specific references with clear reading conditions.

A router should explain which workflow fits the request. Reference another skill only when the workflow needs it and the target environment provides it.

Keep a simple skill self-contained. Avoid adding a router, extra files, or a skill dependency solely to shorten the entrypoint.
