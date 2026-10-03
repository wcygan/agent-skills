import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { TicketsPage } from "../features/tickets/page";

export const Route = createFileRoute("/tickets")({
  validateSearch: Schema.toStandardSchemaV1(
    Schema.Struct({ ticket: Schema.optional(Schema.String) }),
  ),
  component: Page,
});

function Page() {
  const search = Route.useSearch();

  return <TicketsPage selectedId={search.ticket} />;
}
