---
name: prompt-kit
description: Use PromptKit’s official docs, machine-readable indexes, registry items, blocks, primitives, and source code to answer, debug, or implement React AI UI requests involving prompt-kit or prompt-kit.com. Trigger when a request names PromptKit, a PromptKit component, block, primitive, or registry URL. Verify current APIs, dependencies, shadcn setup, React/Next.js/Tailwind compatibility, and AI SDK assumptions. Change project files only when implementation is explicitly requested.
license: MIT
---

# prompt-kit

Turn a PromptKit request into a current, evidence-backed integration result.

## Use this skill when

- The request names PromptKit, `prompt-kit.com`, or a PromptKit registry URL.
- The request asks about PromptKit components such as `PromptInput`, `Message`,
  `Markdown`, `ChatContainer`, `ResponseStream`, `Reasoning`, `Tool`, `Source`,
  `FileUpload`, or `JSXPreview`.
- The request asks for a PromptKit block, primitive, installation, integration,
  debugging result, or API explanation.

Route nearby work to its owner:

- Use `shadcn` for generic shadcn/ui setup or component management.
- Use `research` for a standalone source report saved in the repository.
- Use `reconcile-documentation` for an audit of project-owned documentation.
- Use `web-design-guidelines` for a general UI review without PromptKit.

## Authority

Read documentation and inspect local project files by default. Make project
changes only when the user explicitly requests implementation. Do not install
packages, commit, push, deploy, publish, or expose secrets without explicit
authorization.

## Workflow

### 1. Frame the request

Classify the request as documentation, surface selection, installation,
debugging, or implementation. Record the requested result and the project
stack. This step is complete when the request type and success condition are
clear.

### 2. Inspect the project

Read the package manifest, package-manager metadata, framework files,
`components.json`, import aliases, and existing PromptKit or shadcn components.
Record React, Next.js, Tailwind, and AI SDK versions when present. This step is
complete when local compatibility constraints are known.

### 3. Resolve PromptKit evidence

Read [`prompt-kit-source-map.md`](references/prompt-kit-source-map.md) before
selecting a source. Use the current PromptKit page or registry item for exact
API, files, dependencies, and environment variables. Use `llms.txt` as an
index, `llms-full.txt` for bulk orientation, and the sitemap only for
discovery. Use PromptKit source code when the page and registry data differ.
This step is complete when every material claim has a canonical source.

### 4. Select the smallest surface

Read [`prompt-kit-component-matrix.md`](references/prompt-kit-component-matrix.md)
when choosing a component, block, or primitive.

- Choose a component for one focused UI responsibility.
- Choose a block for a complete composition that the user can adapt.
- Choose a primitive when the request includes a complete feature and backend
  route.

Inspect a block page before constructing a registry URL. Block pages can expose
HTML previews and source without a `.json` registry item. This step is complete
when the selected surface matches the requested scope.

## Canonical chat example

Use [Full Chat App](https://www.prompt-kit.com/c/full-chat-app) as the
canonical PromptKit composition for a complete chat interface. Treat its
current preview and source as the baseline, then use these component docs to
explain or extend the composition:

- [Tool](https://www.prompt-kit.com/docs/tool) for tool-call status and results.
- [Source](https://www.prompt-kit.com/docs/source) for citations and source links.
- [Prompt Suggestion](https://www.prompt-kit.com/docs/prompt-suggestion) for
  suggested prompts and quick actions.
- [Message](https://www.prompt-kit.com/docs/message) for user and assistant
  message rows, content, and actions.
- [Code Block](https://www.prompt-kit.com/docs/code-block) for code content
  inside messages.

When a request targets a full chat UI, inspect the canonical block first, then
verify each companion component's current API, registry metadata, and local
dependencies before adapting it.

### 5. Verify integration details

Confirm the exact install command, registry dependencies, package dependencies,
import paths, client boundary, aliases, and environment variables. Check the
project's existing components before adding duplicates. Use the `shadcn` skill
for generic CLI behavior, but keep PromptKit source selection here. This step
is complete when the integration has no guessed setup details.

### 6. Answer or implement

For a read-only request, provide the smallest useful code and explain the
source-backed choices. For an explicit implementation request, change only
in-scope project files and preserve local conventions. Read
[`prompt-kit-integration-patterns.md`](references/prompt-kit-integration-patterns.md)
for streaming, Markdown, scrolling, tool, source, file, JSX, block, or
primitive work. This step is complete when the requested answer or change is
present.

### 7. Validate the result

Run the project's relevant typecheck, lint, test, or build commands. Verify
imports, registry dependencies, controlled state, streaming cleanup, and
client/server boundaries. For documentation-only work, verify every link and
record the source freshness. This step is complete when validation evidence is
recorded.

## Output contract

Return a `PromptKit Integration Result` with these headings:

1. **Request** — classification and success condition.
2. **Selected surface** — component, block, or primitive and the reason.
3. **Evidence** — canonical PromptKit links and freshness notes.
4. **Integration** — install command, imports, dependencies, and environment.
5. **Code or changes** — answer code or changed-file summary.
6. **Compatibility** — framework, version, experimental, and security notes.
7. **Validation** — commands and results.
8. **Unknowns** — unresolved evidence or the next required input.

Keep documentation-only work read-only. Stop after the result is complete, or
ask one focused question when a missing choice changes the selected surface,
authority, or validation.

## Source guardrails

- Prefer current PromptKit pages, registry JSON, and repository source.
- Treat `llms.txt` as an index and `llms-full.txt` as a partial bulk reference.
- Treat robots and sitemap files as discovery evidence, not API authority.
- Report conflicts instead of merging incompatible API claims.
- Flag experimental components, primitive routes, environment variables, and
  untrusted JSX input before implementation.

## Representative requests

- “Install PromptKit's PromptInput and wire Enter-to-submit.”
- “Render streamed Markdown with PromptKit and keep the chat pinned to bottom.”
- “Add the PromptKit chatbot primitive and show every required dependency.”

Do not use this skill for a generic shadcn Dialog, a general AI SDK question,
or a broad research report without a PromptKit integration target.
