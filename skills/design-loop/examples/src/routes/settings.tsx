import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "../features/settings/page";

export const Route = createFileRoute("/settings")({
  component: Page,
});

function Page() {
  return <SettingsPage />;
}
