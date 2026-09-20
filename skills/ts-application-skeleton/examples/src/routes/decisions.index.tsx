import { createFileRoute } from "@tanstack/react-router";
import { DecisionDirectory } from "../features/decisions/directory";

export const Route = createFileRoute("/decisions/")({
  component: DecisionDirectory,
});
