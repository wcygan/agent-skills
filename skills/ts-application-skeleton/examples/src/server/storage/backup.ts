import { copyFile, readFile, unlink, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { Effect } from "effect";
import { SqliteClient } from "@effect/sql-sqlite-bun";

// Export includes committed WAL contents; copying only the live .sqlite file does not.
export const backupDatabase = Effect.fn("Database.backup")(function* (destination: string) {
  const sql = yield* SqliteClient.SqliteClient;
  const bytes = yield* sql.export;
  yield* Effect.tryPromise({
    try: () => writeFile(resolve(destination), bytes, { flag: "wx", mode: 0o600 }),
    catch: () => new Error("Cannot create backup. Choose a new writable destination."),
  });
});

// Restore to a new data directory, then point APP_DATA_DIR at it. Never overwrite a live DB.
export const restoreDatabase = Effect.fn("Database.restore")(function* (
  source: string,
  destination: string,
) {
  const bytes = yield* Effect.tryPromise({
    try: () => readFile(source),
    catch: () => new Error("Cannot read backup file."),
  });

  if (bytes.subarray(0, 16).toString() !== "SQLite format 3\0") {
    return yield* Effect.fail(new Error("Backup is not a SQLite database."));
  }

  yield* Effect.tryPromise({
    try: () => copyFile(source, destination, constants.COPYFILE_EXCL),
    catch: () => new Error("Cannot restore backup. The destination must not exist."),
  });

  const validation = yield* Effect.gen(function* () {
    const sql = yield* SqliteClient.SqliteClient;
    const result = yield* sql`PRAGMA integrity_check`;

    if (result.length !== 1 || result[0]?.integrity_check !== "ok") {
      return yield* Effect.fail(new Error("Backup failed SQLite integrity validation."));
    }
  }).pipe(
    Effect.provide(SqliteClient.layer({ filename: destination, create: false })),
    Effect.onError(() => Effect.tryPromise(() => unlink(destination)).pipe(Effect.ignore)),
  );

  return validation;
});
