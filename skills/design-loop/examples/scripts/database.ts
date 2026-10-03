import { resolve } from "node:path";
import { Effect, ManagedRuntime } from "effect";
import { DatabaseLive } from "../src/server/storage/database";
import { backupDatabase, restoreDatabase } from "../src/server/storage/backup";

const [command, source, destination] = process.argv.slice(2);

async function main() {
  if (command === "restore" && source && destination) {
    await Effect.runPromise(
      restoreDatabase(resolve(source), resolve(destination)),
    );
    console.log(
      "Restored database. Set APP_DATA_DIR to its directory before starting the app.",
    );

    return;
  }

  if (command !== "backup") {
    throw new Error(
      "Usage: bun scripts/database.ts backup <new-file> | restore <backup> <new-directory/app.sqlite>",
    );
  }

  if (command === "backup" && !source)
    throw new Error("Provide a new backup filename.");
  const runtime = ManagedRuntime.make(DatabaseLive);

  try {
    if (source) {
      await runtime.runPromise(backupDatabase(source));
      console.log("Database backup created.");
    }
  } finally {
    await runtime.dispose();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Database command failed.",
  );
  process.exitCode = 1;
});
