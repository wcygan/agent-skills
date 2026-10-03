# PromptKit Integration Result

## Request

Implementation: simplify the dedicated contextual agent page in a Bun/TanStack
Start workspace around chat. Remove the context banner, record subtitle, and
visible composer label; keep the composer reachable at desktop and mobile sizes.
Preserve record context, suggestions, keyboard submission, cancellation, sources,
and draft recovery without granting the model write actions.

## Selected surface

Adapt the canonical Full Chat App composition using the smallest retained
Message/MessageContent, Markdown, PromptSuggestion, and ChatContainer components.
A native controlled form owns submission and Enter/Shift+Enter. No full chatbot
primitive or separate API server was installed.

## Evidence

Retrieved 2026-10-03 through direct HTTPS; web-reader access to PromptKit failed,
so the canonical HTML and registry JSON were fetched directly:

- https://www.prompt-kit.com/c/full-chat-app
- https://github.com/ibelick/prompt-kit/blob/main/components/blocks/full-chat-app.tsx
- https://prompt-kit.com/c/message.json
- https://prompt-kit.com/c/markdown.json
- https://prompt-kit.com/c/prompt-suggestion.json
- https://prompt-kit.com/c/chat-container.json

The simplification rechecked canonical chat HTML and source, plus ChatContainer
and PromptSuggestion registry metadata on 2026-10-03. The canonical composition
separates the conversation scroll region from its bottom composer; Forma retains
that pattern with native controlled input and existing shared shell navigation.

All four previously recorded registry hashes match the inherited adaptation provenance in
`src/components/prompt-kit/UPSTREAM.md`. Current metadata lists avatar/tooltip for
Message, button for PromptSuggestion, and use-stick-to-bottom for ChatContainer.
The selected adaptations retain native controls and their own style tokens,
without introducing unused upstream avatar, tooltip, Shiki, or JSX components.

## Integration

The ts-application-skeleton generator originally installed the pinned dependencies;
the bundled copy uses
`bun install --frozen-lockfile`. No additional registry CLI install
was needed. Imports are direct from `src/components/prompt-kit/`. Existing pinned
react-markdown, remark-gfm, remark-breaks, use-stick-to-bottom, clsx, and
tailwind-merge satisfy the retained source. No new component environment variables.

Server chat uses the existing Pi adapter. Mock analysis needs no credential.
Live mode reads private server-only AI_MODE, OPENROUTER_API_KEY, OPENROUTER_MODEL.

## Code or changes

`src/features/agent/page.tsx` composes the chat on `/agent` with a compact header,
centered empty state, short suggestion buttons, and a growing textarea with inline
send/stop controls. The input retains its accessible name and receives focus after
responses and failures. New chat clears conversation, draft, error, and mode.
`src/app/app-shell.tsx` selects a viewport layout for this route; scoped rules in
`src/styles/app.css` reserve space for the composer and allow messages to scroll.
The normal shell and footer remain on other pages. No dependencies were added.

Record discussion links
pass their source route to scope analysis and provide a return link. Server-side analysis
reads a fresh authoritative snapshot, identifies related tickets and approvals,
and returns internal source links. Explicit controls handle cancel, reset,
and draft restoration. The agent has no approval or deployment tools.

## Compatibility

Bun 1.4.0, React 19.3.0, Start 1.168.56, Router 1.170.38, Vite 8.3.0,
Tailwind 4.3.3, Effect 4.0.0-rc.116. This is Start SSR, not a Next.js/RSC app.
Markdown skips raw HTML, uses safe URL handling, and renders remote images as
text descriptions. No untrusted JSX execution or experimental ResponseStream.
Upstream Nitro/Router directive warnings appear during a successful build.

## Validation

`just check` passes: lint, TypeScript, 19 unit tests, and production build.
`just test-browser` passes all 4 browser tests, including the full workspace and
dedicated chat regression.
The chat check covers 1280×800, 783×726, 390×844, and 320×568; removed sections,
no document overflow, fully visible send controls, Enter/Shift+Enter, reset,
source-context replies, suggestion submission, restored draft on network failure,
and keyboard focus. Browser tests use disposable SQLite data and mock analysis.

Manual browser inspection verified the empty state and a long response at mobile
size, with conversation scrolling above the visible composer. The desktop result
is saved in `screenshots/agent-desktop.jpg`. Real-user comprehension and physical
mobile keyboard behavior have not been measured.

## Unknowns

Live provider availability, answer quality, and real hosting disconnect propagation
remain unverified. No authentication or production deployment adapter is wired.
Settings OAuth is simulated and its preferences do not change server credentials.
