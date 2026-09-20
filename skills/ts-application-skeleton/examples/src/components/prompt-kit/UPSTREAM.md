# PromptKit source attribution

Locally maintained adaptations retrieved 2026-09-20. MIT license is in LICENSE.

Composition baseline: https://www.prompt-kit.com/c/full-chat-app
Source: https://github.com/ibelick/prompt-kit/blob/main/components/blocks/full-chat-app.tsx

Registry source SHA-256 values:

- https://www.prompt-kit.com/c/message.json — `111e71efec5b5856307e37758ecf5d1a39afbf68ed29f045cc71198475fb169d`
- https://www.prompt-kit.com/c/markdown.json — `2e446e8a2116453b4e42067edba0b1f256fbea36ef7326ac9b8ba40a437d81f3`
- https://www.prompt-kit.com/c/prompt-suggestion.json — `6139f14059586bcf4580a8a0ce510d9455b3045f6faa73893a59c46d51b2743c`
- https://www.prompt-kit.com/c/chat-container.json — `5faa15a9b896fa34ef10d31e26c1de21185ab22a136eb601a8b298e152736c2a`

Local changes: relative imports; existing app styling; only used message and
suggestion exports retained; native buttons instead of unused shadcn variants.
Markdown renders one complete document for reference links, with memoization,
GFM and line breaks. Code blocks render escaped text without Shiki or HTML
injection. Raw HTML is skipped, safe default URL transforms remain enabled,
and remote Markdown images render as descriptions. No AI SDK route, sidebar
history, attachments, fake streaming, or new provider credentials are installed.
