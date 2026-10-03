import { Effect, Layer, ManagedRuntime } from "effect";
import { Workspace, WorkspaceLive } from "../src/server/workspace/service";
import { DatabaseLive } from "../src/server/storage/database";
import { command } from "../src/shared/workspace";

const runtime = ManagedRuntime.make(
  WorkspaceLive.pipe(Layer.provide(DatabaseLive)),
);

try {
  await runtime.runPromise(
    Effect.flatMap(Workspace, (service) => service.mutate(command("seed"))),
  );
  console.log("Sample workspace loaded without replacing existing records.");
} finally {
  await runtime.dispose();
}
