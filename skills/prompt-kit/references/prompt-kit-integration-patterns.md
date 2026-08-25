# PromptKit Integration Patterns

Load this file for implementation or debugging work. Use the current PromptKit
source to confirm names and defaults before copying a pattern.

## Installation

Install a component from its current registry item with the project's package
runner, for example:

```sh
npx shadcn add "https://prompt-kit.com/c/prompt-input.json"
```

Check `components.json`, aliases, and existing shadcn components first. Do not
assume that a block has a `.json` registry item. Inspect its page and source.

## Prompt input

Compose `PromptInput` with `PromptInputTextarea` and optional action groups.
Use controlled `value` and `onValueChange` when the parent owns draft state.
Connect `onSubmit` to the request handler. Keep Enter-to-submit behavior and
Shift+Enter multiline behavior visible in tests.

Check the local `textarea` and `tooltip` components before installation. Keep
the component on the client when it uses state, refs, layout effects, or event
handlers.

## Messages and Markdown

Use `Message` for the row, `MessageAvatar` for identity, `MessageContent` for
content, and `MessageActions` for controls. Use `markdown` content only when
the source is trusted or the renderer has a safe link policy.

Use `Markdown` with a stable message `id` during streaming. Verify the current
registry dependencies for `react-markdown`, `remark-gfm`, `remark-breaks`,
`marked`, and `shiki`. Use `not-prose` for code blocks inside prose layouts.

## Streaming and scrolling

Use `ChatContainer` for conversation scrolling and its scroll anchor for
streaming updates. Use `ScrollButton` when users need a return-to-latest action.
Verify the current `use-stick-to-bottom` integration before changing scroll
logic.

Use `ResponseStream` for controlled progressive text display. Mark it
experimental when the current docs do. Handle completion, reset, pause,
resume, and stream errors in tests.

## Reasoning, tools, and sources

Use `Reasoning` for collapsible reasoning content and connect `isStreaming` to
the actual response state. Use `Tool` with the current AI SDK tool-part shape.
Render `Source` from validated URLs and provide useful titles and descriptions.

When a primitive adds an API route, inspect the route and provider setup. List
every required environment variable and keep secrets outside source files.

## Files and JSX

Use `FileUpload` for drag-and-drop or file selection. Validate file type, size,
and upload handling in the application layer.

Use `JSXPreview` only when the project has an explicit policy for JSX input.
Treat streamed or user-provided JSX as untrusted. Do not claim sandboxing unless
the project proves it.

## Blocks and primitives

Use a block when the user wants a complete composition with local control over
the source. Review its displayed source and imports before adapting it.

Use a primitive when the user wants the full frontend and backend feature.
Review route files, provider configuration, AI SDK version, environment
variables, and generated file paths before installation.

## Validation checklist

- Imports resolve through the project's configured aliases.
- Registry dependencies exist or are explicitly installed.
- Client components include the required client boundary.
- Controlled state has one clear owner.
- Streaming cleanup handles completion, reset, and unmount.
- Markdown and link rendering follow the project's safety policy.
- Tool states cover loading, success, and error paths.
- File handling validates accepted types and sizes.
- Primitive routes and environment variables match the local app.
- Typecheck, lint, tests, or build results are recorded.
