import { PageHeading } from "../../components/page-heading";
import { Link } from "@tanstack/react-router";
import { CollectionActions } from "./collection-actions";
import { StatusPill, statusDotClass } from "./status-pill";
import type { CollectionItem } from "../../shared/collections";

export function CollectionsPage({ collections }: { collections: readonly CollectionItem[] }) {
  return (
    <>
      <CollectionActions />

      <PageHeading eyebrow="03 / From overview to detail" title="Collections">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua.
      </PageHeading>
      <div className="mb-7 grid grid-cols-3 gap-3" aria-label="Collection summary">
        {(["Draft", "Archived", "Active"] as const).map((status) => (
          <div key={status} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span aria-hidden className={`size-1.5 rounded-full ${statusDotClass[status]}`} />
              {status}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {collections.filter((item) => item.status === status).length}
            </p>
          </div>
        ))}
      </div>
      {collections.length === 0 && (
        <p className="panel p-8">No collection items yet. Create your first item above.</p>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        {collections.map((item) => (
          <Link
            key={item.id}
            to="/collections/$itemId"
            params={{ itemId: item.id }}
            className="panel flex flex-col p-6 transition-colors hover:border-blue-400"
          >
            <span className="self-start">
              <StatusPill status={item.status} />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">{item.summary}</p>
            <div className="mt-6 flex justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>{item.owner}</span>
              <span>{item.category}</span>
            </div>
            <span className="mt-6 text-sm font-semibold text-accent">
              View collection item <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-400">Local collections · Saved on this computer</p>
    </>
  );
}
