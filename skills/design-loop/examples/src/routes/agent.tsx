import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import AgentPage from "../features/agent/page";

export const Route = createFileRoute("/agent")({
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({ context: Schema.optional(Schema.String) }),
  ),
  component: Page,
});

function Page() {
  const { context } = Route.useSearch();

  const safeContext =
    context && /^\/(tickets|deployments|approvals)\?/.test(context)
      ? context
      : undefined;

  return <AgentPage key={safeContext ?? "workspace"} context={safeContext} />;
}
