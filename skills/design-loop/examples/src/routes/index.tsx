import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "../features/overview/page";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return <OverviewPage />;
}
