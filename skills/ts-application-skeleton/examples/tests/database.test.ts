import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect, ManagedRuntime, Result } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { backupDatabase, restoreDatabase } from "../src/server/storage/backup";
import { databaseLayer } from "../src/server/storage/database";

test("migrations survive reopening and failed transactions roll back", async () => {
  const directory = await mkdtemp(join(tmpdir(), "foundation-database-"));
  const filename = join(directory, "app.sqlite");
  const first = ManagedRuntime.make(databaseLayer(filename));

  try {
    await first.runPromise(
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`INSERT INTO collection_items VALUES
        ('test', 1, 'Title', 'Summary', 'Owner', 'Draft', 'Category', 'Description', 'Details', '[]')`;

        const failure = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`UPDATE collection_items SET title = 'Rolled back' WHERE id = 'test'`;

              return yield* Effect.fail("abort");
            }),
          )
          .pipe(Effect.result);

        expect(Result.isFailure(failure)).toBe(true);
      }),
    );
    await first.dispose();
    const reopened = ManagedRuntime.make(databaseLayer(filename));

    try {
      await reopened.runPromise(
        Effect.gen(function* () {
          const sql = yield* SqlClient.SqlClient;
          const rows = yield* sql`SELECT title FROM collection_items WHERE id = 'test'`;
          expect(rows).toEqual([{ title: "Title" }]);
        }),
      );
    } finally {
      await reopened.dispose();
    }
  } finally {
    await first.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});

test("backup restores committed records and refuses to overwrite an existing database", async () => {
  const directory = await mkdtemp(join(tmpdir(), "foundation-backup-"));
  const runtime = ManagedRuntime.make(databaseLayer(join(directory, "source.sqlite")));
  const backup = join(directory, "backup.sqlite");
  const restoredPath = join(directory, "restored.sqlite");

  try {
    await runtime.runPromise(
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`INSERT INTO collection_items VALUES
        ('saved', 1, 'Saved', '', '', 'Active', '', '', '', '[]')`;
        yield* backupDatabase(backup);
      }),
    );
    await Effect.runPromise(restoreDatabase(backup, restoredPath));
    const restored = ManagedRuntime.make(databaseLayer(restoredPath));

    try {
      await restored.runPromise(
        Effect.gen(function* () {
          const sql = yield* SqlClient.SqlClient;
          expect(yield* sql`SELECT id, title FROM collection_items`).toEqual([
            { id: "saved", title: "Saved" },
          ]);
        }),
      );
    } finally {
      await restored.dispose();
    }

    await expect(Effect.runPromise(restoreDatabase(backup, restoredPath))).rejects.toThrow(
      "destination must not exist",
    );
    await expect(runtime.runPromise(backupDatabase(backup))).rejects.toThrow(
      "new writable destination",
    );
  } finally {
    await runtime.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});
