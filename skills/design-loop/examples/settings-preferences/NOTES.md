# Settings and preferences

## Task and scope

Choose which work updates to receive and how frequently to receive email. A focused notification screen and a separate AI Provider screen; no unrelated
account-management shell. Switch text is descriptive, and only the switch itself
changes its value.
Open `index.html` directly; no server, dependency, external font, or network is needed.
Preferences persist in localStorage under a namespaced key. This is a local
simulation; it does not change an account or deliver notifications.

## Inspiration and adaptation

Inspected 2026-10-03:

- [Linear notifications](https://linear.app/docs/notifications): configurable
  notification categories and channels, with digest or immediate email delivery.
- [Linear preferences](https://linear.app/docs/account-preferences): dedicated
  account preferences and configurable interface behavior.

The sparse row layout, light neutral surfaces, small accent, and autosave behavior
are design choices for this prototype, not claims of exact current Linear styling
or saving behavior. Forma is a fictional product; no Linear assets are copied. The AI extension includes the provider wordmarks
already used in the user's browser-navigation project.
Unlike Linear's full channel model, this bounded example covers only email delivery
and three representative categories.

## Decisions worth reusing

- Use plain rows instead of nesting each preference inside a card.
- Label each control with its outcome and a short supporting explanation.
- Keep notification selection separate from delivery timing.
- Save reversible preferences immediately; show pending, success, and recoverable
  failure inline. Keep selections intact if saving fails.
- Disable frequency when email is off while retaining the user's chosen value.
- Use two settings destinations: AI Provider first and Notifications second.
  Email delivery stays within Notifications. On narrow screens, place the same
  navigation above the content with no hidden drawer.
- Use semantic color, spacing, and control conventions across the whole screen.

## Inspection modes

- `index.html?view=wireframe`: same task and interactions in grayscale with square edges.
- `index.html?state=error`: fail the first save, preserve selections, and expose Retry.
  Retry succeeds unless browser storage itself is unavailable.
- Saving is delayed briefly so pending feedback is observable; this simulates latency.

Use these URL modes for review; they are intentionally outside the product UI.
There is no empty-data screen because these preferences always have defaults.

## Fit and limits

Fits a small set of personal, reversible preferences. A large settings product
may need searchable navigation. Consequential changes may need explicit review.
Real account persistence requires a backend, concurrency handling, and server error
responses. Browser walkthroughs establish prototype behavior, not user-study results.

## AI Provider extension

Inspected 2026-10-03:

- https://job-scanner-v1.localhost/settings: independent OpenAI and OpenRouter
  connections, sign-in/disconnect controls, and distinction between app connection
  removal and provider access revocation.
- https://browser-navigation.localhost/settings: provider-grouped model picker,
  thinking effort, and fast mode. The sample model labels reflect the inspected
  page; they do not guarantee current provider availability.

Open `index.html` (AI Provider is the default), or `index.html#ai-provider`.
Open `index.html#notifications` for notification and email delivery preferences. Connect either or both providers through a clearly
labeled simulated OAuth dialog. Cancel or Escape leaves connection state unchanged.
Select a model from connected providers, set effort, and toggle Fast mode. All
preferences persist locally; disconnecting the selected provider chooses an
available model from the remaining provider or disables the controls when none remain.
Disconnecting one provider leaves the other connected. Effort and Fast mode are
illustrative preferences with no inference requests or capability guarantees.

The AI state uses `design-loop:settings-ai:v1`. No credentials, tokens, authorization
codes, or real account identifiers are collected or stored. Production OAuth needs
provider-supported authentication, backend credential handling, callback/error
processing, and model capability discovery. App disconnection and provider-side
revocation must be distinguished in a live integration.

## Provider identity and picker

Provider wordmarks are embedded PNG data URLs copied from
`browser-navigation/public/providers/openai.png` and `openrouter.png`, as requested.
They retain the original branding; provider names remain readable beside them.
These third-party marks identify providers and are not covered by a claim of
ownership under this skill's MIT license. The prototype makes no network requests
for its images, and menu options reuse the same embedded image sources.

The model picker opens a local listbox. Each option displays provider image,
provider name, and then model name; the selected trigger follows the same order.
Arrow keys, Home/End, Enter/Space, Escape, Tab dismissal, and outside clicks are
supported. Only models belonging to connected providers appear.

## Shared shell geometry

Both demos use a 1280px maximum shell, 32px desktop inset, 180px sidebar,
64px column gap, and 64px top offset. Settings constrains its content to 640px
inside that shell; records uses the remaining width. At 760px and below, both
use a 20px inset, 28px top offset, and navigation above the content. Keep these
values and navigation row metrics aligned when adapting the examples.
