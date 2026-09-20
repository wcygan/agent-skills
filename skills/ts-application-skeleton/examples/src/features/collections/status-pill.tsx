import type { CollectionItem } from "../../shared/collections";

const statusPillClass: Record<CollectionItem["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-blue-50 text-accent",
  Archived: "bg-slate-100 text-slate-500",
};

export const statusDotClass: Record<CollectionItem["status"], string> = {
  Active: "bg-emerald-500",
  Draft: "bg-accent",
  Archived: "bg-slate-400",
};

export function StatusPill({ status }: { status: CollectionItem["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusPillClass[status]}`}
    >
      {status}
    </span>
  );
}
