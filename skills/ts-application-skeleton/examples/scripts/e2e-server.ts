import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = await mkdtemp(join(tmpdir(), "foundation-browser-"));

const child = Bun.spawn([process.execPath, ".output/server/index.mjs"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    AI_MODE: "mock",
    OPENROUTER_API_KEY: "",
    APP_DATA_DIR: directory,
    HOST: "127.0.0.1",
    PORT: "4199",
  },
  stdout: "inherit",
  stderr: "inherit",
});

const stop = () => child.kill("SIGTERM");

process.on("SIGTERM", stop);

process.on("SIGINT", stop);

try {
  process.exitCode = await child.exited;
} finally {
  await rm(directory, { recursive: true, force: true });
}
