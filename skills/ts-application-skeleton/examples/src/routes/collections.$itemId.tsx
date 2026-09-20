import { CollectionItemPage } from "../features/collections/collection-detail";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollectionItem } from "../server/functions/collections";

export const Route = createFileRoute("/collections/$itemId")({
  loader: async ({ params }) => {
    const result = await getCollectionItem({ data: { id: params.itemId } });

    if (!result.ok) throw new Error(result.message);

    if (!result.value) throw notFound();

    return result.value;
  },
  component: CollectionItemPageRoute,
  notFoundComponent: () => (
    <div className="panel p-8">
      <h1 className="text-2xl font-semibold">Collection item not found</h1>
      <p className="mt-3 text-slate-500">This item does not exist in the demo collection.</p>
      <Link to="/collections" className="mt-5 inline-block text-sm font-semibold text-accent">
        Back to all collections
      </Link>
    </div>
  ),
});

function CollectionItemPageRoute() {
  return <CollectionItemPage item={Route.useLoaderData()} />;
}
