import { createServerFn } from "@tanstack/react-start";
import { Effect, Schema } from "effect";
import {
  CollectionItem,
  CollectionItemId,
  SaveCollectionItem,
  DeleteCollectionItem,
} from "../../shared/collections";
import { Collections } from "../collections/service";
import { runServerEffect } from "../start-bridge.server";

export const listCollections = createServerFn({ method: "GET" }).handler(() =>
  runServerEffect(
    "Collections.list",
    Schema.Array(CollectionItem),
    Effect.flatMap(Collections, (collections) => collections.list()),
  ),
);

export const getCollectionItem = createServerFn({ method: "GET" })
  .validator(Schema.toStandardSchemaV1(CollectionItemId))
  .handler(({ data }) =>
    runServerEffect(
      "Collections.get",
      Schema.NullOr(CollectionItem),
      Effect.flatMap(Collections, (collections) => collections.get(data.id)),
    ),
  );

export const saveCollectionItem = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(SaveCollectionItem))
  .handler(({ data }) =>
    runServerEffect(
      "Collections.save",
      CollectionItem,
      Effect.flatMap(Collections, (collections) => collections.save(data)),
    ),
  );

export const deleteCollectionItem = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(DeleteCollectionItem))
  .handler(({ data }) =>
    runServerEffect(
      "Collections.remove",
      Schema.Null,
      Effect.flatMap(Collections, (collections) => collections.remove(data.id, data.version)).pipe(
        Effect.as(null),
      ),
    ),
  );
