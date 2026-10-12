# Provider Authentication

Use this for OpenAI sign-in, OpenRouter authorization, provider credentials,
OAuth attempts, token refresh or account selection in an embedded Bun app.
Apply the native SDK/client/plugin `/effect` entrypoints. Configuration isolation
and database lifetime are covered in `configuration.md`.

## Sources And Capability Selection

Read the [Effect integration API](https://opencode.ai/v2/docs/build/plugins/effect/),
[provider-account guide](https://opencode.ai/v2/docs/cli/providers), and the
integration/credential sections of the [API reference](https://opencode.ai/v2/docs/api/).
Inspect the application's resolved provider plugin and methods before choosing an
ID. Project plugins can add methods; a provider's name is not evidence that OAuth
is available in that release.

The following was checked in published
[OpenCode core 2.0.27](https://registry.npmjs.org/@opencode%2Fcore/2.0.27) source:

| Provider | Built-in path in this release |
| --- | --- |
| OpenAI | openai integration with chatgpt-browser and chatgpt-headless OAuth methods; both labelled legacy Codex |
| OpenRouter | API-key connection; no built-in OpenRouter OAuth method found |

The checked methods are provider authentication, separate from OpenCode server
pairing/authentication and application-user login. Your app must retain its own
user identity and authority when selecting an account or acting through tools.

## Driving Native OAuth Attempts

Expose sign-in operations through an application service; keep host objects,
credential values and attempt state in its adapter. Discover available methods
through integration.list/get for the intended location. Native inputs use branded
Integration.ID, MethodID and AttemptID values; the plugin/effect exports provide
the schema constructors. Retrieve matching declarations before constructing them.

1. Start with integration.oauth.connect using integrationID, methodID and an
   explicit location when needed. Inspect any method form and supply its answer.
2. Retain the returned attempt identity and authorization instructions. Display
   the URL/device code to the user through an appropriate UI; do not report login
   success merely because an authorization URL was obtained.
3. Observe integration.oauth.status until authentication succeeds or fails. Use a
   bounded Schedule and app cancellation rather than an unbounded sleep loop.
   Keep the same location and IDs throughout the attempt.
4. For code-based methods, pass the user's returned code to oauth.complete.
   Auto/browser/device callbacks can finish without that manual operation;
   inspect the method's mode before choosing a completion path.
5. On user cancellation or acquisition failure, cancel an outstanding attempt via
   oauth.cancel and close its owner scope. Keep callback listeners/pollers alive
   only for the attempt lifetime.
6. Verify the active connection and requested model before starting a session.
   Credential availability, model availability and endpoint connectivity are
   separate checks; preserve the user's requested provider.

The plugin context exposes integration.connection.active/resolve for provider
wiring. These plugin-only helpers are not evidence of identically named public
host methods. Public integration/credential APIs manage account state; inspect
the relevant interface rather than borrowing a plugin callback's methods.

OpenCode stores saved credentials in its SQLite database and supports refresh
callbacks for registered OAuth methods. Choose database scope deliberately so a
short-lived demo database does not become the app's long-term account store.
Inspect account metadata/types without printing access/refresh tokens. Keep live
credentials out of example code, snapshots, test fixtures and normal logs.

## OpenAI: Legacy Codex OAuth

The built-in openai methods in 2.0.27 are chatgpt-browser (browser callback) and
chatgpt-headless (device-code polling). They use auth.openai.com for authorization,
store access/refresh credentials, and support refresh through the provider plugin.
The browser flow binds a scoped loopback listener; account for callback reachability
when running Bun on a remote machine or container. Device login is the alternate
method when a browser callback cannot reach that host.

A successful login switches the OpenAI provider to the ChatGPT Codex backend at
chatgpt.com/backend-api/codex. This differs from the newer Pi direct OpenAI API
OAuth flow described in that skill. Do not infer arbitrary API/model access or
subscription entitlements from successful login or a catalog entry. Check the
plugin's model filters, actual account and requested route independently.

Use the built-in flow through the SDK rather than copying its client ID, token
exchange or refresh implementation into an app. Recheck these legacy method IDs
and endpoint behavior when upgrading; current docs may describe another generation.

## OpenRouter: PKCE Produces An API Key

Read [OpenRouter's official OAuth guide](https://openrouter.ai/docs/guides/overview/auth/oauth).
OpenRouter supports browser authorization with PKCE, but its code exchange returns
a user-controlled API key. This is not an access/refresh-token credential pair.
The pinned OpenCode provider plugin does not supply that authorization flow.

For an app-owned Effect adapter:

1. Generate a fresh verifier and S256 challenge; keep the verifier in the owning
   attempt state. Use a fresh state parameter for callback correlation.
2. Send the user to OpenRouter's auth URL with callback_url, challenge and challenge
   method. Localhost callbacks are supported; the host must be reachable by the
   authorizing browser. A headless flow omits the callback and requires PKCE;
   the user pastes the displayed single-use code instead.
3. Validate the callback's state/attempt and exchange the code with the auth/keys
   endpoint using Effect HttpClient and schema decoding. Headless handling must
   correlate the pasted code with its retained verifier/attempt instead of relying
   on a returned state parameter.
4. Treat the returned key as secret material and call OpenCode's native
   integration.connect.key for openrouter and the same intended location/account
   scope. Confirm connection/model readiness before dispatching work.
5. Finalize callback listeners and attempt state on success, rejection, timeout or
   interruption. Surface exchange/connection failures; do not retry admission or
   credential creation blindly after an ambiguous outcome.

Implement this with Config/redacted secrets, Context.Service, named Effect.fn
methods, scoped acquisition and Effect HTTP adapters in the Bun host. An OAuth
label in the UX does not change the returned credential kind. Do not force the
issued API key into Credential.OAuth with fake expiry or refresh values: OpenCode's
custom OAuth registration contract expects OAuth credentials, while key connection
correctly represents OpenRouter's output.

## Verification Boundaries

This reference is source/documentation-checked. The fixture uses a synthetic model
and does not sign into OpenAI or OpenRouter. Documentation requests do not authorize
starting OAuth attempts, opening login flows or changing saved accounts.

For an implemented adapter, test callback correlation, expiry, rejection, cancellation,
scope cleanup, typed exchange failures and credential-kind handling with fake
transports/credential stores. A separately authorized live smoke check establishes
real account access, refresh and provider routing; packaging validation cannot.
