# Pi agent framework

Read when the feature requires agent sessions, tools, or streamed agent events.

Embed the Pi SDK in the Bun process behind an Effect capability such as
`AgentRunner`. Check the installed SDK version and matching docs before choosing
package imports or session options. The current docs use
`@earendil-works/pi-coding-agent`; older examples may use another scope.

The adapter owns session creation, event subscription, prompting, abort, and
disposal. Wrap promise operations as Effects and register cleanup. Forward
Effect interruption to the SDK's abort operation; unsubscribe listeners and
dispose sessions on every exit. Inspect terminal events/results as well as
promise completion before reporting success.

Give each conversation or job its own session ownership. Share provider
configuration, not mutable conversation history across users. Select OpenRouter
and the configured model explicitly. Control SDK resource discovery and tool
allowlists so application behavior does not inherit a developer's local Pi
extensions or filesystem authority by accident.

Expose application tools through existing Effect services, with validated
arguments and explicit permissions. Bridge back to Effects at the tool callback
boundary. Bound concurrency, run duration, and tool execution; stream typed
application events when the UI needs progress.

Test success, provider failure, and abort cleanup with a fake adapter. Verify
SDK compatibility under Bun before claiming the integration works.

Sources: [Pi docs](https://pi.dev/docs/latest),
[SDK](https://pi.dev/docs/latest/sdk).
