# PromptKit Component Matrix

Use this matrix to choose a PromptKit surface. Treat dependency entries as
orientation. Verify the current registry item before giving an install command.

## Surface choice

| User need | Prefer | PromptKit examples |
| --- | --- | --- |
| Prompt entry or actions | Component | `prompt-input`, `prompt-suggestion`, `file-upload` |
| Message rendering | Component | `message`, `markdown`, `code-block`, `image` |
| Conversation behavior | Component | `chat-container`, `scroll-button`, `loader` |
| Progressive response display | Component | `response-stream`, `reasoning` |
| AI process visibility | Component | `tool`, `source`, `steps`, `chain-of-thought` |
| Status or feedback | Component | `system-message`, `text-shimmer`, `thinking-bar`, `feedback-bar` |
| Render streamed JSX | Component | `jsx-preview` |
| Reusable composition | Block | `full-chat-app`, `full-conversation`, conversation blocks |
| Complete chat feature | Primitive | `chatbot`, `tool-calling` |

## Registry families

The following entries reflect current registry metadata observed during skill
design. Recheck each entry for changes before implementation.

| Item | Registry dependencies | Package dependencies or environment |
| --- | --- | --- |
| `prompt-input` | `textarea`, `tooltip` | — |
| `code-block` | — | `shiki` |
| `markdown` | — | `react-markdown`, `remark-gfm`, `remark-breaks`, `shiki`, `marked` |
| `message` | `avatar`, `tooltip` | Markdown and code-block packages |
| `chat-container` | — | `use-stick-to-bottom` |
| `scroll-button` | `button` | `class-variance-authority`, `lucide-react` |
| `loader` | `button` | — |
| `prompt-suggestion` | `button` | `class-variance-authority`, `lucide-react` |
| `response-stream` | — | — |
| `reasoning` | — | `lucide-react`, Markdown and response-stream files |
| `file-upload` | — | — |
| `jsx-preview` | — | `react-jsx-parser` |
| `tool` | `collapsible`, `button` | `lucide-react` |
| `source` | `hover-card` | — |
| `image`, `steps`, `system-message`, `chain-of-thought`, `text-shimmer`, `thinking-bar`, `feedback-bar` | Verify live | Verify live |

## Blocks and primitives

Blocks are complete compositions. Use their page source and current install
surface. Common block slugs include:

- `prompt-input-actions`
- `prompt-input-suggestions`
- `prompt-autocomplete-highlight`
- `full-conversation`
- `conversation-avatars`
- `conversation-actions`
- `conversation-scroll-bottom`
- `conversation-prompt-input`
- `sidebar-chat-history`
- `full-chat-app`

Primitives are feature-level registry items:

- `chatbot` — frontend, API route, AI SDK, and OpenAI provider setup.
- `tool-calling` — chatbot setup plus tool-call rendering and API behavior.

Inspect primitive `files`, `dependencies`, and `envVars`. Treat API routes and
environment variables as part of the requested change.

## Selection checks

- Match the smallest surface to the requested result.
- Check existing local components before adding a duplicate.
- Preserve project aliases and component paths.
- Check client boundaries for hooks, browser APIs, and event handlers.
- Check experimental status before recommending `response-stream` or
  `jsx-preview`.
- Treat JSX input as untrusted until the project confirms an execution policy.
