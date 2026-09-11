---
name: to-spec
description: Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you've already discussed.
license: MIT
metadata:
  maintenance: "local"
  upstream-repository: "https://github.com/mattpocock/skills.git"
  upstream-skill: "skills/engineering/to-spec"
  upstream-revision: "84fdeffd12f2ee307994d1eb6feb48173b6e0502"
  upstream-license: "MIT"
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user — just synthesize what you already know.

Use the supplied or discoverable tracker configuration and label vocabulary. Load `setup-matt-pocock-skills` only when tracker setup is requested or needed for authorized publication. Missing tracker access does not block drafting the spec locally.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Identify where observable behavior can be verified using existing test boundaries where practical. Choose boundaries that expose the relevant failures without coupling tests to internal structure. Use supplied requirements and constraints; state unresolved assumptions rather than adding an interview round.

3. Write the spec using the applicable sections below. Publish when the user requests publication, including an explicit invocation of this publishing workflow; otherwise leave a local draft. Apply the configured `ready-for-agent` label only if the requirements are actionable and no blocking decisions remain. Continue implementation if it was also requested and its prerequisites are settled.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

List the distinct user behaviors needed to define acceptance, without repeating the same requirement. A useful format is:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

Cover material actors, success paths, failure behavior, and boundaries relevant to this feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- Observable behaviors and failure cases the checks must establish
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
