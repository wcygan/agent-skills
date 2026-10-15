---
name: typescript-app-stack
description: "Explain TypeScript application components and locate their documentation: runtimes, Effect, TanStack, PostgreSQL, Pi models and durable execution, infrastructure, and observability. Use for stack orientation and component reference lookup."
license: MIT
---

# TypeScript application stack

A component reference organized by responsibility. Each component file contains
its high-level purpose and links to documentation for further exploration.

Read the component files relevant to the question. For version-specific APIs,
match the documentation to the project's installed version.

## Component groups

| Group | Components |
| --- | --- |
| Language and execution | [TypeScript](references/runtime/typescript.md), [Bun](references/runtime/bun.md), [Node.js](references/runtime/nodejs.md) |
| Backend programming model | [Effect](references/backend/effect.md), [@effect/platform-bun](references/backend/effect-platform-bun.md) |
| Web application | [React](references/web/react.md), [React DOM](references/web/react-dom.md), [TanStack Start](references/web/tanstack-start.md), [TanStack Router](references/web/tanstack-router.md), [TanStack Query](references/web/tanstack-query.md), [Vite](references/web/vite.md), [Vite React plugin](references/web/vite-plugin-react.md) |
| Persistence | [PostgreSQL](references/data/postgresql.md), [@effect/sql-pg](references/data/effect-sql-pg.md) |
| AI and durable execution | [Large language models (LLMs)](references/ai/language-models.md), [Decision models (classifiers)](references/ai/decision-models.md), [@earendil-works/pi-ai](references/ai/pi-ai.md), [@earendil-works/pi-durable](references/ai/pi-durable.md), [@earendil-works/chord](references/ai/chord.md), [OpenRouter](references/ai/openrouter.md) |
| Infrastructure and developer workflow | [Alchemy](references/infrastructure/alchemy.md), [Docker](references/infrastructure/docker.md), [just](references/infrastructure/just.md), [Portless](references/infrastructure/portless.md), [concurrently](references/infrastructure/concurrently.md), [nodemon](references/infrastructure/nodemon.md) |
| Observability | [OpenTelemetry](references/observability/opentelemetry.md), [OpenTelemetry Protocol (OTLP)](references/observability/otlp.md), [Grafana](references/observability/grafana.md), [Loki](references/observability/loki.md), [Tempo](references/observability/tempo.md), [Prometheus](references/observability/prometheus.md), [grafana/otel-lgtm](references/observability/otel-lgtm.md), [Grafana MCP](references/observability/grafana-mcp.md) |
| Checks and content utilities | [Prettier](references/tooling/prettier.md), [Bun test](references/tooling/bun-test.md), [Poppler pdftotext](references/tooling/pdftotext.md), [he](references/tooling/he.md) |
