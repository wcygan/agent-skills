import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { CollectionItem, SaveCollectionItem } from "../../shared/collections";
import { AppError } from "../errors";
import { demoItems } from "./fixtures";

const StoredItem = Schema.Struct({
  ...CollectionItem.fields,
  highlights: Schema.fromJsonString(Schema.Array(Schema.String)),
});

const storageFailure = () =>
  AppError.make({
    code: "Storage",
    message: "Could not access local data. Check the application logs and data directory.",
  });

const conflict = () =>
  AppError.make({
    code: "Conflict",
    message: "This item changed or was deleted. Reload the latest item before trying again.",
  });

export class Collections extends Context.Service<
  Collections,
  {
    list: () => Effect.Effect<readonly CollectionItem[], AppError>;
    get: (id: string) => Effect.Effect<CollectionItem | null, AppError>;
    save: (input: SaveCollectionItem) => Effect.Effect<CollectionItem, AppError>;
    remove: (id: string, version: number) => Effect.Effect<void, AppError>;
    seed: () => Effect.Effect<void, AppError>;
  }
>()("app/Collections") {}

export const CollectionsLive = Layer.effect(
  Collections,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const list = Effect.fn("Collections.list")(function* () {
      const rows = yield* sql`SELECT * FROM collection_items ORDER BY id`.pipe(
        Effect.mapError(storageFailure),
      );

      return yield* Schema.decodeUnknownEffect(Schema.Array(StoredItem))(rows).pipe(
        Effect.mapError(storageFailure),
      );
    });

    const get = Effect.fn("Collections.get")(function* (id: string) {
      const rows = yield* sql`SELECT * FROM collection_items WHERE id = ${id}`.pipe(
        Effect.mapError(storageFailure),
      );

      const items = yield* Schema.decodeUnknownEffect(Schema.Array(StoredItem))(rows).pipe(
        Effect.mapError(storageFailure),
      );

      return items[0] ?? null;
    });

    const save = Effect.fn("Collections.save")(
      function* (input: SaveCollectionItem) {
        const valid = yield* Schema.decodeUnknownEffect(SaveCollectionItem)(input).pipe(
          Effect.mapError(storageFailure),
        );

        return yield* sql.withTransaction(
          Effect.gen(function* () {
            const existing = yield* get(valid.id);

            if ((existing?.version ?? 0) !== valid.version) return yield* Effect.fail(conflict());
            const item = CollectionItem.make({ ...valid, version: valid.version + 1 });
            const stored = { ...item, highlights: JSON.stringify(item.highlights) };

            if (existing) {
              yield* sql`UPDATE collection_items SET ${sql.update(stored)} WHERE id = ${item.id}`.pipe(
                Effect.mapError(storageFailure),
              );
            } else {
              yield* sql`INSERT INTO collection_items ${sql.insert(stored)}`.pipe(
                Effect.mapError(storageFailure),
              );
            }

            return item;
          }),
        );
      },
      Effect.mapError((error) => (Schema.is(AppError)(error) ? error : storageFailure())),
    );

    const remove = Effect.fn("Collections.remove")(
      function* (id: string, version: number) {
        yield* sql.withTransaction(
          Effect.gen(function* () {
            const existing = yield* get(id);

            if (!existing || existing.version !== version) return yield* Effect.fail(conflict());
            yield* sql`DELETE FROM collection_items WHERE id = ${id}`.pipe(
              Effect.mapError(storageFailure),
            );
          }),
        );
      },
      Effect.mapError((error) => (Schema.is(AppError)(error) ? error : storageFailure())),
    );

    const seed = Effect.fn("Collections.seed")(function* () {
      yield* sql
        .withTransaction(
          Effect.gen(function* () {
            for (const item of demoItems) {
              const stored = { ...item, highlights: JSON.stringify(item.highlights) };
              yield* sql`INSERT INTO collection_items ${sql.insert(stored)} ON CONFLICT(id) DO NOTHING`;
            }
          }),
        )
        .pipe(Effect.mapError(storageFailure));
    });

    return Collections.of({ list, get, save, remove, seed });
  }),
);
