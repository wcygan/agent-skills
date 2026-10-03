import { createFileRoute } from "@tanstack/react-router";
import { WebsitePage } from "../features/website/page";

export const Route = createFileRoute("/about")({
  component: Page,
});

function Page() {
  return <WebsitePage />;
}
