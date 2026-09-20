import { createFileRoute } from "@tanstack/react-router";
import { DecisionsPage } from "../features/decisions/page";

export const Route = createFileRoute("/decisions/tickets")({
  component: DecisionsPage,
});
