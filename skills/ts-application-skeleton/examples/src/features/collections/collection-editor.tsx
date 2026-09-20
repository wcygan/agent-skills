import { useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Option, Schema } from "effect";
import { type CollectionItem, CollectionFields } from "../../shared/collections";
import { deleteCollectionItem, saveCollectionItem } from "../../server/functions/collections";

const empty = {
  title: "",
  summary: "",
  owner: "",
  category: "",
  status: "Draft",
  description: "",
  details: "",
  highlights: [],
} satisfies CollectionFields;

export function CollectionEditor({
  item,
  onClose,
}: {
  item?: CollectionItem;
  onClose: (saved?: boolean) => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CollectionFields>(item ?? empty);
  const [titleError, setTitleError] = useState("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = useRef(false);
  const newId = useRef<string | undefined>(undefined);
  const titleInput = useRef<HTMLInputElement>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();

    if (busy.current) return;
    const valid = Schema.decodeUnknownOption(CollectionFields.fields.title)(values.title);

    if (Option.isNone(valid)) {
      setTitleError("Enter a title between 1 and 120 characters.");
      titleInput.current?.focus();

      return;
    }

    setTitleError("");
    busy.current = true;
    setPending(true);
    setError("");

    try {
      newId.current ??= crypto.randomUUID();

      const result = await saveCollectionItem({
        data: { ...values, id: item?.id ?? newId.current, version: item?.version ?? 0 },
      });

      if (!result.ok) {
        setError(result.message);
        setConflict(result.code === "Conflict");

        return;
      }

      await router.invalidate();
      await router.navigate({ to: "/collections/$itemId", params: { itemId: result.value.id } });
      onClose(true);
    } catch {
      setError("Could not save. Your changes are still here. Please try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function remove() {
    if (!item || busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");

    try {
      const result = await deleteCollectionItem({ data: { id: item.id, version: item.version } });

      if (!result.ok) {
        setError(result.message);
        setConflict(result.code === "Conflict");

        return;
      }

      await router.navigate({ to: "/collections" });
      await router.invalidate();
      onClose(true);
    } catch {
      setError("Could not delete. Please try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <section className="panel mb-8 p-6" aria-labelledby="editor-title">
      <h2 id="editor-title" className="mb-5 text-xl font-semibold">
        {item ? "Edit collection item" : "New collection item"}
      </h2>
      <form onSubmit={save} noValidate className="space-y-4">
        <div>
          <label htmlFor="item-title" className="block text-sm font-medium">
            Title
          </label>
          <input
            ref={titleInput}
            id="item-title"
            value={values.title}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? "title-error" : undefined}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
          {titleError && (
            <p id="title-error" role="alert" className="mt-1 text-sm text-red-700">
              {titleError}
            </p>
          )}
        </div>
        {(["summary", "owner", "category", "description", "details"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={`item-${field}`} className="block text-sm font-medium capitalize">
              {field}
            </label>
            <textarea
              id={`item-${field}`}
              value={values[field]}
              onChange={(e) => setValues({ ...values, [field]: e.target.value })}
              rows={field === "description" || field === "details" ? 3 : 1}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3"
            />
          </div>
        ))}
        <div>
          <label htmlFor="item-status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="item-status"
            value={values.status}
            onChange={(e) => {
              const status = Schema.decodeUnknownSync(CollectionFields.fields.status)(
                e.target.value,
              );

              setValues({ ...values, status });
            }}
            className="mt-1 rounded-lg border border-slate-300 p-3"
          >
            <option>Draft</option>
            <option>Active</option>
            <option>Archived</option>
          </select>
        </div>
        <div>
          <label htmlFor="item-highlights" className="block text-sm font-medium">
            Highlights (one per line)
          </label>
          <textarea
            id="item-highlights"
            value={values.highlights.join("\n")}
            onChange={(e) => setValues({ ...values, highlights: e.target.value.split("\n") })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {conflict && (
          <button
            type="button"
            className="text-sm font-semibold text-accent"
            onClick={async () => {
              await router.invalidate();
              onClose(true);
            }}
          >
            Reload latest item
          </button>
        )}
        <div className="flex flex-wrap gap-4">
          <button className="primary-button" disabled={pending || conflict}>
            {pending ? "Working…" : "Save item"}
          </button>
          <button type="button" onClick={() => onClose()} disabled={pending}>
            Cancel
          </button>
          {item && (
            <button
              type="button"
              className="text-red-700"
              disabled={pending || conflict}
              onClick={() => setConfirmDelete(true)}
            >
              Delete item
            </button>
          )}
        </div>
        {confirmDelete && (
          <div className="rounded-lg bg-red-50 p-4">
            <p>Delete this collection item? This cannot be undone.</p>
            <button
              type="button"
              className="mt-3 font-semibold text-red-700"
              disabled={pending || conflict}
              onClick={remove}
            >
              Confirm delete
            </button>
            <button
              type="button"
              className="ml-5"
              disabled={pending}
              onClick={() => setConfirmDelete(false)}
            >
              Keep item
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
