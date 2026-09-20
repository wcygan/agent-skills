import { resolve } from "node:path";
import { Effect, Layer, ManagedRuntime } from "effect";
import { Collections, CollectionsLive } from "../src/server/collections/service";
import { DatabaseLive } from "../src/server/storage/database";
import { backupDatabase, restoreDatabase } from "../src/server/storage/backup";

const [command, source, destination] = process.argv.slice(2);

async function main() {
  if (command === "restore" && source && destination) {
    await Effect.runPromise(restoreDatabase(resolve(source), resolve(destination)));
    console.log("Restored database. Set APP_DATA_DIR to its directory before starting the app.");

    return;
  }

  if (command !== "seed" && command !== "backup") {
    throw new Error(
      "Usage: bun scripts/database.ts seed | backup <new-file> | restore <backup> <new-directory/app.sqlite>",
    );
  }

  if (command === "backup" && !source) throw new Error("Provide a new backup filename.");
  const runtime = ManagedRuntime.make(CollectionsLive.pipe(Layer.provideMerge(DatabaseLive)));

  try {
    if (command === "seed") {
      await runtime.runPromise(Effect.flatMap(Collections, (collections) => collections.seed()));
      console.log("Demo items added; existing items preserved.");
    } else if (source) {
      await runtime.runPromise(backupDatabase(source));
      console.log("Database backup created.");
    }
  } finally {
    await runtime.dispose();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Database command failed.");
  process.exitCode = 1;
});
