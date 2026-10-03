import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { DeploymentsPage } from "../features/deployments/page";

export const Route = createFileRoute("/deployments")({
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({ release: Schema.optional(Schema.String) }),
  ),
  component: Page,
});

function Page() {
  const search = Route.useSearch();

  return <DeploymentsPage selectedId={search.release} />;
}
