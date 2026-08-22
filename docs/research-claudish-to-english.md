# Claudish-to-English portability review

Research date: 2026-08-22.

## Decision

Yes. Recreate the core as a repository-owned, agent-neutral skill. Do not
vendor the plugin.

The reusable part is a plain-language rewrite contract. The Claude Code hooks,
slash command, streamed-message buffer, provider code, and persistent flag
files are client integration code. They cannot run from a generic Agent Skills
skill without a host adapter.

Use the name `plain-language-rewrite`. Use it when a user asks to simplify an
agent response or a supplied document while facts and technical artifacts must
remain unchanged.

## Upstream behavior

- The project is an MIT-licensed Claude Code plugin.
- It presents a plain-language rewrite of assistant messages. The saved
  transcript keeps the original message.
- Its `MessageDisplay` hook buffers streamed chunks. It calls its rewrite model
  only after the final chunk.
- The default display mode appends the rewrite. Replace mode hides streamed
  content, then restores the original if rewriting fails.
- It supports local Ollama, Codex CLI, Anthropic, and OpenAI-compatible
  providers.
- An optional `PostToolUse` hook rewrites Markdown files. It scopes changes to
  an opt-in directory and writes a sibling file by default.
- All hooks fail open. A provider failure leaves the original message or file
  unchanged.

## Generic-skill contract

The skill should do these actions:

1. Keep every verified fact, number, name, date, link, file path, command,
   identifier, and code block.
2. Use short sentences and common words.
3. Preserve the requested language unless the user asks for translation.
4. Preserve Markdown structure when rewriting Markdown.
5. Return the rewrite only, unless a comparison helps the user.
6. State uncertainty instead of making a complex claim sound certain.
7. For a file rewrite, create a sibling output by default. Overwrite only with
   direct user approval.
8. If preservation is uncertain, return the original and explain the limit.

This contract works with any agent. It needs no model provider, shell command,
environment variable, or client event.

## Required changes from upstream

| Upstream feature | Generic skill treatment |
| --- | --- |
| Claude Code `MessageDisplay` hook | Remove. A generic skill runs only when invoked. |
| Stream chunk buffer | Remove. The host owns message streaming. |
| `/claudish` command and flag files | Remove. The user invokes the skill or states output preferences. |
| Ollama, Codex, Anthropic, and OpenAI clients | Remove. The host model performs the rewrite. |
| Display-only append/replace modes | Offer original plus rewrite only on request. |
| Markdown hook | Keep as an explicit file operation. Default to a sibling file. |
| Fail-open behavior | Keep as preservation-first behavior. Do not overwrite or invent content. |

## Scope and risk

Do not promise semantic equivalence from a weaker rewrite model. The skill can
reduce this risk with an invariant checklist, but it cannot prove every
rewrite is equivalent. Keep code blocks, commands, identifiers, numeric values,
and links byte-for-byte where possible.

The upstream's display behavior has a host-level safety property: a failed hook
shows the original response. A skill cannot intercept another client message.
It can only avoid producing a replacement when preservation fails.

The upstream optional file hook can overwrite documents. A generic catalog
skill should not make this automatic. A sibling file gives a review point and
fits the catalog's approval boundary.

## Recommended implementation

Create one small `skills/plain-language-rewrite/SKILL.md`. Keep the first
version prompt-only. Do not add scripts or provider configuration.

Suggested frontmatter description:

```yaml
description: Rewrite supplied text or Markdown in plain language while preserving facts, technical artifacts, structure, and the source language. Use when a user asks for a simpler explanation, document, or agent response without changing its meaning.
```

Add a compact verification step: compare technical literals before returning
the rewrite. For Markdown files, write `NAME.plain.md` only when the user asks
for a file artifact.

## Sources

- [Upstream repository](https://github.com/gvzdv/claudish-to-english)
- [Upstream plugin manifest](https://github.com/gvzdv/claudish-to-english/blob/e109e224acbfcc49016f383cc0d178c0b69b4954/.claude-plugin/plugin.json)
- [Upstream hook registration](https://github.com/gvzdv/claudish-to-english/blob/e109e224acbfcc49016f383cc0d178c0b69b4954/hooks/hooks.json)
- [Upstream display rewrite hook](https://github.com/gvzdv/claudish-to-english/blob/e109e224acbfcc49016f383cc0d178c0b69b4954/rewrite.sh)
- [Upstream Markdown rewrite hook](https://github.com/gvzdv/claudish-to-english/blob/e109e224acbfcc49016f383cc0d178c0b69b4954/rewrite-md.sh)
- [Upstream MIT license](https://github.com/gvzdv/claudish-to-english/blob/e109e224acbfcc49016f383cc0d178c0b69b4954/LICENSE)
