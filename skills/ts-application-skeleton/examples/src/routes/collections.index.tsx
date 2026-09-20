import { CollectionsPage } from "../features/collections/collection-list";
import { createFileRoute } from "@tanstack/react-router";
import { listCollections } from "../server/functions/collections";

export const Route = createFileRoute("/collections/")({
  loader: async () => {
    const result = await listCollections();

    if (!result.ok) throw new Error(result.message);

    return result.value;
  },
  component: CollectionsPageRoute,
});

function CollectionsPageRoute() {
  return <CollectionsPage collections={Route.useLoaderData()} />;
}
