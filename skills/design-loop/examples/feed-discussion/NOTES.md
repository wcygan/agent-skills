# Feed and discussion

A standalone Forma team feed: read updates, compose a post, reply inline, save an
update, and return to a conversation from a notification. Open `index.html` directly
or serve this directory with Python's HTTP server. No build or external assets.

## Inspected inspiration (2026-10-03)

- [X timeline](https://help.x.com/en/using-x/x-timeline): a feed with conversation
  entry points and saved posts.
- [X bookmarks](https://help.x.com/en/using-x/bookmarks): a separate place to revisit
  saved updates.
- [LinkedIn notifications](https://www.linkedin.com/help/linkedin/answer/a1341821):
  a dedicated view for activity around conversations.
- [LinkedIn notification updates](https://www.linkedin.com/help/linkedin/answer/a597801/manage-your-linkedin-notification-updates?lang=en):
  distinguish activity in the product from external notification delivery.

These official help pages informed interaction patterns, not a pixel-level visual
replica. Facebook remains a reference candidate; its UI was not inspected for this
example. Sample people and activity are fictional. No vendor assets are used.

## Structure and behavior

- The header, sidebar origin, navigation rows, neutral tokens, and responsive
  breakpoint match the other app examples. One readable main column avoids a
  secondary stream of recommendations or engagement distractions.
- Each update groups author, context, timestamp, body, and actions. Replies are
  disclosed inline, indented beneath their parent. Counts represent actual sample
  data; Like is a reversible toggle rather than a text-row click target.
- The composer has an explicit team audience, 1,200-character limit, and a disabled
  submit action until meaningful text is entered. Replies allow 600 characters.
  Text is rendered with `textContent`; line breaks and long content wrap safely.
- Contextual actions use native keyboard-accessible details disclosures with
  ordinary buttons. Save is reversible; Hide has an explicit Undo action. Escape
  closes a menu and returns focus. Outside clicks dismiss menus.
- Notifications expose unread state, a count, Mark all as read, and a path directly
  to the corresponding expanded conversation. Opening a notification marks it read
  and restores its post if hidden. No OS permission or external messages are used.
- Post drafts and per-conversation reply drafts survive navigation and rerenders
  during the session. Successful submission clears only the submitted draft.
- Published sample content, saved/hidden/liked state, and notification read state
  persist independently under `design-loop:feed-discussion:v1`. Storage failures
  preserve session state and offer Retry saving. Unsaved drafts do not survive reload.

## Review modes and limits

- `?view=wireframe` shows the same structure in grayscale.
- `?state=error` fails the first post or reply submission before adding content.
  The draft remains intact; the same submit button retries successfully.
- Mobile moves navigation above the feed and keeps composition, replies, menus,
  and notifications reachable. This is a finite chronological sample, not an
  infinite-scroll feed or a ranking experiment.

Posting and notifications are local simulations. No real publishing, authentication,
moderation, attachments, messaging, notification delivery, or concurrent editing is
implemented. Agent browser checks establish prototype behavior, not user research
or social engagement outcomes.
