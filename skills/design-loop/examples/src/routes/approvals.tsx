import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { ApprovalsPage } from "../features/approvals/page";

export const Route = createFileRoute("/approvals")({
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({
      request: Schema.optional(Schema.String),
      release: Schema.optional(Schema.String),
    }),
  ),
  component: Page,
});

function Page() {
  const search = Route.useSearch();

  return (
    <ApprovalsPage requestId={search.request} releaseId={search.release} />
  );
}
