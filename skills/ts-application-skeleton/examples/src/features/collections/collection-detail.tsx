import { Link } from "@tanstack/react-router";
import { CollectionActions } from "./collection-actions";
import { StatusPill } from "./status-pill";
import type { CollectionItem } from "../../shared/collections";

export function CollectionItemPage({ item }: { item: CollectionItem }) {
  return (
    <>
      <CollectionActions item={item} />

      <nav aria-label="Breadcrumb" className="mb-7 text-sm">
        <Link to="/collections" className="text-accent hover:underline">
          ← Collections
        </Link>
      </nav>
      <div className="mb-9 max-w-3xl">
        <StatusPill status={item.status} />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-500">{item.summary}</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
        <article className="panel space-y-8 p-6 sm:p-8">
          <section>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Details</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.details}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Highlights</h2>
            <ol className="mt-4 space-y-4">
              {item.highlights.map((highlight, index) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs text-slate-500">
                    {index + 1}
                  </span>
                  {highlight}
                </li>
              ))}
            </ol>
          </section>
        </article>
        <aside className="panel p-6">
          <h2 className="text-sm font-semibold">At a glance</h2>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Owner</dt>
              <dd className="mt-1">{item.owner}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Estimated category</dt>
              <dd className="mt-1">{item.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Status</dt>
              <dd className="mt-1">
                <StatusPill status={item.status} />
              </dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </aside>
      </div>
    </>
  );
}
