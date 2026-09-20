# OpenRouter

Read when wiring model credentials, selecting models, or implementing provider I/O.

Use OpenRouter as the default LLM provider. Keep `OPENROUTER_API_KEY` in ignored
`.env` for local use and a blank placeholder in `.env.example`. Read it through
Effect's redacted configuration at the server layer; unwrap only when supplying
the provider client. Never expose it through public environment prefixes,
browser bundles, serialized errors, or logs.

The API uses bearer authentication. For direct compatible chat requests, use
`https://openrouter.ai/api/v1` as the base URL. Keep the selected model identifier
explicit in server configuration; verify its required capabilities. When using
Pi, configure its OpenRouter provider through the SDK adapter rather than
building another client for the same agent call.

Validate required credentials when the active provider layer starts. A UI-only
app or fake test layer should not require a real key. Map authentication,
rate-limit, transport, and malformed-output failures to useful typed failures.
Bound requests and retries; avoid retrying an entire tool-using run after it
may have performed side effects.

Test with a fake provider by default. A live smoke call needs an available key
and should be small, with model and outcome recorded but no secret output.
Do not assume this provider implements Effect's DecisionModel contract.

Sources: [API overview](https://openrouter.ai/docs/api_reference/overview),
[authentication](https://openrouter.ai/docs/api_reference/authentication).
