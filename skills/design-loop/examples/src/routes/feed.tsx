import { createFileRoute } from "@tanstack/react-router";
import { FeedPage } from "../features/feed/page";

export const Route = createFileRoute("/feed")({
  component: Page,
});

function Page() {
  return <FeedPage />;
}
