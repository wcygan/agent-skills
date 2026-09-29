# Pi SDK with Sign in with ChatGPT

Use this reference when a Pi SDK application should use ChatGPT subscription
access and credits through OAuth rather than an OpenAI API key.

## Choose the flow supported by the installed Pi version

Source baseline checked on September 29, 2026:

- [02eed88: OpenAI ChatGPT sign-in](https://github.com/earendil-works/pi/commit/02eed88fd8912e54a804ddebd409e2e4c08ac5ef)
  adds OAuth to `openai` and marks `openai-codex` legacy.
- [72abf01: bundled login fix](https://github.com/earendil-works/pi/commit/72abf01ba9e23a99a983cbed7008f6bc020e9597)
  includes the new OAuth module in bundled builds.
- [4df1574: shared callback infrastructure](https://github.com/earendil-works/pi/commit/4df1574339bfbd1a9750ff485bb618da397ba135)
  shares the callback server and browser success/error pages.

The package at the bundled-fix commit declares `0.99.0`; this is a source
baseline, not proof that every build with that version contains the fix.
Check the installed package's provider definitions and login declarations
before using the examples below. New integrations should use `openai` OAuth
when those changes are present.

Older installations may still require `openai-codex` OAuth. The previous
observed application baseline used Pi `0.82.1`, Effect `4.0.0-beta.102`, Bun
`1.3.13`, and `openai-codex` / `gpt-5.6-luna` with low thinking effort. Keep that
pair only when it resolves in the installed catalog. Switching to `openai`
requires a new login for that provider and a model from its catalog; do not
reuse legacy tokens or assume the same model ID is available. Older Pi versions
can offer browser/device-code login for the legacy provider. The new ChatGPT
flow described here uses browser login with a manual callback URL fallback.

## Subscription versus API-key authentication

The adapter should use Pi's public in-process login seam:

1. Create one `ModelRuntime` for the application layer.
2. Call `ModelRuntime.login("openai", "oauth", interaction, loginOptions)`
   when the required OAuth credential is missing. Supply a stable installation
   UUID through `loginOptions.getDeviceId`.
3. Let the application-owned interaction render Pi's prompts and notifications.
4. Let `ModelRuntime.create()` and Pi's credential store handle later reuse and
   refresh.

Pi stores and refreshes this credential in its own machine-local
`~/.pi/agent/auth.json`. The application must not read, print, copy, commit, or
link that file.

This is distinct from the Codex CLI login surface. OpenAI's Codex documentation
describes `codex login` and the CLI's `~/.codex/auth.json`; that is not the
credential store consumed by Pi's `ModelRuntime`. Pi's `/login` flow remains a
compatible manual setup path, but a Pi SDK application can use the direct
`ModelRuntime.login` flow documented below instead.

The [OpenAI provider](https://github.com/earendil-works/pi/blob/02eed88fd8912e54a804ddebd409e2e4c08ac5ef/packages/ai/src/providers/openai.ts)
offers both API-key auth and Sign in with ChatGPT. Its OAuth token is sent
directly to `https://api.openai.com/v1`; OpenAI controls the available
subscription access and credits. Do not infer plan entitlements from a model's
presence in Pi's catalog.

Do not add an `OPENAI_API_KEY` fallback when the application is intended to
consume subscription access. API-key authentication is a different billing and
entitlement path. The reference implementation explicitly checks that the
selected provider is configured and using OAuth before creating a session.

### Raw SDK login

`ModelRuntime.login` is the supported direct path. It invokes Pi's built-in
browser PKCE flow, persists the resulting credential through Pi's
credential store, and does not require a `pi` CLI subprocess.

```ts
import {
  createAgentSession,
  ModelRuntime,
  SessionManager,
} from "@earendil-works/pi-coding-agent";
import type {
  AuthEvent,
  AuthInteraction,
  AuthPrompt,
} from "@earendil-works/pi-ai";

const runtime = await ModelRuntime.create();

// Application-owned configuration and persistent installation identity.
const modelId = configuredModelId;
const loginOptions = { getDeviceId: () => getOrCreateInstallationUuid() };

const interaction: AuthInteraction = {
  prompt: async (request: AuthPrompt) => {
    if (request.type === "select") {
      // Render request.options and return the selected option value.
      return selectOptionInYourUi(request.options);
    }

    // Render text, secret, or manual_code input in application-owned UI.
    return readValueFromYourUi(request);
  },
  notify: (event: AuthEvent) => {
    // Show auth_url, info, and progress in application-owned UI.
    showInYourUi(event);
  },
};

if (!runtime.hasConfiguredAuth("openai") ||
    !runtime.isUsingOAuth("openai")) {
  await runtime.login("openai", "oauth", interaction, loginOptions);
}

const model = runtime.getModel("openai", modelId);
if (model === undefined) throw new Error("OpenAI model is unavailable");

const { session } = await createAgentSession({
  model,
  modelRuntime: runtime,
  noTools: "all",
  sessionManager: SessionManager.inMemory(),
  thinkingLevel: "low",
});
```

`configuredModelId` and the UI functions are application placeholders.
`getOrCreateInstallationUuid()` must persist one UUID per application
installation and return it on subsequent logins. Generate it on first use, not
on every call, and keep it out of shared project configuration. Pi's CLI supplies
this through `SettingsManager.getOrCreateDeviceId()`; the SDK caller supplies
`getDeviceId` explicitly. Omitting it fails before authorization.

The interaction must honor both its own `AbortSignal` and each prompt's signal.
Browser login emits an `auth_url`, then waits for the loopback callback or a
`manual_code` prompt containing the full final redirect URL. A callback can
cancel that pending prompt; handle cancellation without logging the URL or its
authorization code. This flow does not offer device-code login. For remote or
headless hosts, use the manual callback URL path with a browser on another
machine, or use a legacy provider only when explicitly configured and supported.
Keep the Node/Bun OAuth implementation behind a server-side boundary.

Pi owns client registration, PKCE, token exchange, and refresh. See the
[ChatGPT OAuth implementation](https://github.com/earendil-works/pi/blob/02eed88fd8912e54a804ddebd409e2e4c08ac5ef/packages/ai/src/auth/oauth/openai-chatgpt.ts).
The [Responses adapter](https://github.com/earendil-works/pi/blob/02eed88fd8912e54a804ddebd409e2e4c08ac5ef/packages/ai/src/api/openai-responses.ts)
omits unsupported request fields for ChatGPT tokens and links shared-limit
errors to ChatGPT usage settings. Keep usage-limit failures actionable; a login
does not guarantee unlimited inference or a particular credit allocation.

## Provider and model preflight

Use a stable application configuration:

```ts
export const OPENAI_PROVIDER = "openai";
export const OPENAI_MODEL = configuredModelId; // From this provider's catalog.

export const DefaultPiAgentConfig = {
  provider: OPENAI_PROVIDER,
  model: OPENAI_MODEL,
  thinkingLevel: "low" as const,
};
```

Create one `ModelRuntime` per application layer, then validate the requested
provider/model before session creation:

```ts
const modelRuntime = await ModelRuntime.create();
const resolvedModel = modelRuntime.getModel(OPENAI_PROVIDER, OPENAI_MODEL);

if (!modelRuntime.hasConfiguredAuth(OPENAI_PROVIDER) ||
    !modelRuntime.isUsingOAuth(OPENAI_PROVIDER)) {
  throw new MissingCodexLogin({ provider: OPENAI_PROVIDER });
}

if (resolvedModel === undefined) {
  throw new CodexModelUnavailable({
    provider: OPENAI_PROVIDER,
    model: OPENAI_MODEL,
  });
}
```

Keep these checks separate. A model can be present in the catalog while the
subscription credential is missing, expired, or being overridden by a different
auth path. `ModelRuntime.getAvailable()` is useful when selecting from several
authenticated models; an explicit default should still validate the exact
provider/model pair.

Select the model from the installed `openai` catalog and validate the exact
pair with `getModel(OPENAI_PROVIDER, OPENAI_MODEL)`. The legacy application's
`gpt-5.6-luna` default is not a recommendation for the new provider.

## Session construction

For a focused subscription-backed helper, create an in-memory, tool-free
session:

```ts
const { session } = await createAgentSession({
  model: resolvedModel,
  modelRuntime,
  noTools: "all",
  sessionManager: SessionManager.inMemory(),
  thinkingLevel: "low",
});
```

This is appropriate when the application only needs streamed text and should
not read or mutate the repository. If the product needs tools, make that an
explicit capability decision and constrain the allowlist; do not inherit Pi's
default `bash`, `edit`, and `write` tools accidentally.

The implementation creates a fresh session per prompt while reusing the single
runtime. This keeps mutable conversation state isolated between requests and
still avoids rebuilding provider/auth resolution for every prompt. If an
application intentionally retains conversation state, give that session one
clear owner and serialize access to it.

## Effect service and stream adapter

Expose an application-shaped Effect service, not raw Pi objects:

```ts
export class PiAgent extends Context.Service<PiAgent, {
  readonly authenticate: (
    interaction: AuthInteraction,
  ) => Effect.Effect<void, PiAuthenticationError>;
  readonly metadata: () => Effect.Effect<PiAgentConfig, PiAgentError>;
  readonly streamPrompt: (prompt: string) => Stream.Stream<string, PiAgentError>;
}>()("app/PiAgent") {}
```

Keep authentication explicit and separate from metadata/inference. A missing
credential may trigger an application-level login flow, but model preflight
should not silently open a browser.

```ts
const authenticate = Effect.fn("PiAgent.authenticate")(function* (
  interaction: AuthInteraction,
) {
  yield* Effect.tryPromise({
    try: (signal) =>
      runtime.login("openai", "oauth", {
        ...interaction,
        signal: interaction.signal === undefined
          ? signal
          : AbortSignal.any([signal, interaction.signal]),
      }, loginOptions),
    catch: (cause) =>
      new PiAuthenticationError({
        provider: "openai",
        cause,
      }),
  });
});
```

Provide that operation through the live `Layer`. On interruption, cancel the
signal passed to Pi so pending login work stops and the browser callback
server closes. Use `Effect.acquireRelease` for terminal/UI resources owned by
the application. Cleanup must be best-effort without hiding the primary login
failure.

Adapt Pi's `session.subscribe` callback to an Effect `Stream`:

1. Subscribe only after provider/model preflight succeeds.
2. Forward `message_update` + `text_delta` payloads to a queue-backed stream.
3. End the stream after `session.prompt()` resolves.
4. Fail the stream with the typed adapter error if prompting fails.
5. Keep event callbacks small and non-blocking.

The implementation uses `Stream.callback`, `Queue.offerUnsafe`,
`Queue.failCauseUnsafe`, and `Queue.endUnsafe` for this bridge. Use the current
Effect declarations and the existing project conventions before copying those
low-level operations into a new adapter.

## Scoped cleanup and interruption

Treat the session and subscription as scoped resources:

```ts
const acquireSession = Effect.acquireRelease(
  Effect.tryPromise({
    try: () => runtime.createSession(config),
    catch: (cause) => new PiSessionCreationError({ cause }),
  }),
  (session) => Effect.try({
    try: session.dispose,
    catch: () => undefined,
  }).pipe(Effect.ignore),
);
```

Register the unsubscribe finalizer in the same scope. Wrap the prompt with an
interrupt handler:

```ts
const runPrompt = Effect.tryPromise({
  try: () => session.prompt(prompt),
  catch: (cause) => new PiInferenceError({ cause }),
}).pipe(
  Effect.onInterrupt(() =>
    Effect.tryPromise({ try: session.abort, catch: () => undefined }).pipe(
      Effect.ignore,
    ),
  ),
);
```

The finalizer should be best-effort: cleanup failure must not hide the primary
model or provider failure. On normal completion and failure, unsubscribe before
disposing the session. On interruption, abort first and then let scope cleanup
finish the subscription/session lifecycle.

## Error taxonomy

Keep failures actionable and typed:

- `MissingCodexLogin`: no configured OAuth credential, or the provider is using
  API-key auth instead of the required subscription auth;
- `CodexModelUnavailable`: the requested provider/model is not in Pi's catalog;
- `PiRuntimeCreationError`: `ModelRuntime.create()` failed;
- `PiAuthenticationError`: direct Pi OAuth login failed or was cancelled;
- `PiSessionCreationError`: model/session or event subscription setup failed;
- `PiInferenceError`: an accepted prompt failed during inference.

Do not retry `session.prompt()` by default. A failed prompt may have already
executed work or consumed subscription usage. Retry only a separately proven
idempotent setup/read boundary, with an explicit bounded policy. Preserve
partial streamed output as partial output; do not report a successful final
answer after a stream failure.

## Output and diagnostics

Keep diagnostics separate from the answer stream:

```ts
writeDiagnostic(
  `[pi] provider=${config.provider} model=${config.model} auth=oauth thinking=${config.thinkingLevel}\n`,
);
writeResponse(delta);
```

Write metadata to stderr and assistant text to stdout so callers can pipe the
answer without parsing logs. Never include credential sources, token values,
raw auth errors, or full provider configuration in diagnostics.

## Test contract

Do not require a live subscription for ordinary unit tests. Inject a fake
`PiSdk`/`PiRuntime` and provide the `PiAgent` layer with `@effect/vitest`.
The implementation's useful cases are:

- streamed deltas preserve order;
- success unsubscribes and disposes;
- missing auth fails before session creation;
- direct OAuth login delegates to Pi with `openai` and the stable UUID option;
- login failures are typed and cancellation reaches Pi's interaction signal;
- successful login precedes model/session creation;
- manual callback input honors prompt cancellation;
- legacy credentials do not satisfy the new provider's auth preflight;
- API-key auth is rejected;
- unavailable model fails before session creation;
- runtime, session, subscription, and inference failures are typed;
- subscription setup failure still disposes the session;
- an interrupted prompt aborts, unsubscribes, and disposes without sleeps;
- one runtime is reused while each prompt receives a fresh session; and
- the CLI writes metadata before deltas and does not append a newline after a
  failed stream.

Reserve a small explicit integration smoke test for the real provider/model and
credential store. Keep it separate from deterministic CI tests and never log
the credential contents.

## Checklist

- [ ] Direct Pi SDK login uses `ModelRuntime.login("openai", "oauth", ..., loginOptions)`.
- [ ] A persistent installation UUID is supplied through `getDeviceId`.
- [ ] The interaction renders browser/manual callback prompts and honors cancellation.
- [ ] The installed Pi supports `openai` OAuth and contains the bundled login fix.
- [ ] The chosen model resolves under the configured provider; OAuth is required.
- [ ] `ModelRuntime` is reused at the application layer.
- [ ] Sessions are in-memory/tool-free unless persistence/tools are intentional.
- [ ] Auth/model preflight occurs before session creation.
- [ ] Stream subscription and session disposal are scoped.
- [ ] Interrupts abort the active prompt.
- [ ] Prompt inference is not blindly retried.
- [ ] Unit tests use fakes; live subscription checks are explicit and isolated.
