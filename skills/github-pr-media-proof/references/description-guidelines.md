# PR description guidelines

## Reviewer checklist

- The problem and solution overview states the problem, solution, and important boundary.
- The overview tells the reviewer what a linked video demonstrates.
- The before/after table uses observable behavior, not implementation jargon.
- The explanation identifies the cause and the owner of the fix.
- The impact section names affected users and unchanged behavior.
- Evidence links each claim to a test, screenshot, recording, or log.
- Testing Done lists exact commands and outcomes.
- Media URLs use the repository's attachment CDN.
- Image links have useful alt text.
- Video URLs appear on separate lines.
- The body does not contain duplicate or stale proof sections.

## Generic template

```md
## Problem & Solution Overview

This change keeps the reader's position stable while the panel width changes.
Watch the short recording below: the same message remains visible through the resize sequence.

https://github.com/user-attachments/assets/<overview-video-id>

## Before / After

| Scenario | Before | After |
| --- | --- | --- |
| Resize during a long session | The visible message changes | The anchor remains stable |

## Why This Change Was Made

The width-change path discarded cached row measurements without compensating the scroll position.
The fix preserves estimates and remeasures connected rows.

## User Impact

Readers keep their place during pane and window resizes. End-pinned sessions remain pinned.

## Evidence

![Before](https://github.com/user-attachments/assets/<before-image-id>)

![After](https://github.com/user-attachments/assets/<after-image-id>)

https://github.com/user-attachments/assets/<detailed-video-id>

## Testing Done

- `npm test -- transcript` — passed
- `npm run e2e -- chat-resize` — passed
```

Use the shortest recording that proves the behavior. Keep a longer recording in `Evidence` only when it adds diagnostic value.
