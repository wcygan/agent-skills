import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Config, Effect, Layer } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-bun";

// Keep migrations statically imported so the production bundle includes them.
export const migrations = SqliteMigrator.fromRecord({
  "001_collection_items": Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`CREATE TABLE collection_items (
      id TEXT PRIMARY KEY,
      version INTEGER NOT NULL CHECK (version > 0),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Draft', 'Active', 'Archived')),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT NOT NULL,
      highlights TEXT NOT NULL
    )`;
  }),
});

export const databaseLayer = (filename: string) =>
  SqliteMigrator.layer({ loader: migrations }).pipe(
    Layer.provideMerge(SqliteClient.layer({ filename, busyTimeout: "1 second" })),
  );

export const DatabaseLive = Layer.unwrap(
  Effect.gen(function* () {
    const directory = yield* Config.String("APP_DATA_DIR").pipe(Config.withDefault(".data"));
    const absoluteDirectory = resolve(directory);
    yield* Effect.tryPromise({
      try: () => mkdir(absoluteDirectory, { recursive: true, mode: 0o700 }),
      catch: () => new Error("Cannot create APP_DATA_DIR. Check its path and permissions."),
    });
    yield* Effect.logInfo("Opening application database").pipe(
      Effect.annotateLogs({ dataDirectory: absoluteDirectory }),
    );

    return databaseLayer(resolve(absoluteDirectory, "app.sqlite"));
  }),
);
