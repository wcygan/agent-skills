import { useState } from "react";
import { CollectionEditor } from "./collection-editor";
import type { CollectionItem } from "../../shared/collections";

export function CollectionActions({ item }: { item?: CollectionItem }) {
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");

  return (
    <>
      {notice && <output className="mb-4 text-sm text-accent">{notice}</output>}
      {editing ? (
        <CollectionEditor
          item={item}
          onClose={(saved) => {
            setEditing(false);
            setNotice(saved ? "Collection updated." : "");
          }}
        />
      ) : (
        <button
          className="primary-button mb-6"
          onClick={() => {
            setNotice("");
            setEditing(true);
          }}
        >
          {item ? "Edit item" : "New collection item"}
        </button>
      )}
    </>
  );
}
