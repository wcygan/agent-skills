import "@tanstack/react-start/server-only";
import { ManagedRuntime } from "effect";
import { AppLive } from "./layers";

const makeRuntime = () => ManagedRuntime.make(AppLive);

declare global {
  var foundationRuntime: ReturnType<typeof makeRuntime> | undefined;
}

// Nitro's plugin and Start's SSR bundle can load this module independently.
// Share one process-owned runtime across those entrypoints.
export const runtime = (globalThis.foundationRuntime ??= makeRuntime());

if (import.meta.hot)
  import.meta.hot.dispose(async () => {
    // Clear ownership before asynchronous disposal so HMR cannot reuse the old layer graph.
    if (globalThis.foundationRuntime === runtime) globalThis.foundationRuntime = undefined;

    await runtime.dispose();
  });
