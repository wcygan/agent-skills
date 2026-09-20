import { createFileRoute } from "@tanstack/react-router";
import { DecisionDemo } from "../features/decisions/demo";

export const Route = createFileRoute("/decisions/skills")({ component: Page });

function Page() {
  return <DecisionDemo demo="skills" />;
}
