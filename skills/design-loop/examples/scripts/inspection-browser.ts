import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const port = Number(process.env.BROWSER_CDP_PORT ?? 9222);

if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("BROWSER_CDP_PORT must be an integer between 1024 and 65535.");
}

// Fail before launching if another browser already owns this endpoint.
const probe = Bun.listen({ hostname: "127.0.0.1", port, socket: { data() {} } });

probe.stop(true);

const profile = await mkdtemp(join(tmpdir(), "forma-inspection-"));

try {
  const browser = await chromium.launchPersistentContext(profile, {
    headless: !process.argv.includes("--headed"),
    // This process owns signal cleanup so the temporary profile is removed.
    handleSIGINT: false,
    handleSIGTERM: false,
    handleSIGHUP: false,
    viewport: { width: 1280, height: 800 },
    args: [
      "--remote-debugging-address=127.0.0.1",
      `--remote-debugging-port=${port}`,
    ],
  });

  const stop = () => void browser.close();

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  process.on("SIGHUP", stop);
  console.log(`Browser Use endpoint: http://127.0.0.1:${port}`);
  console.log("Use BU_CDP_URL with this endpoint. Ctrl-C closes this browser.");
  await new Promise<void>((resolve) => browser.on("close", () => resolve()));
} finally {
  await rm(profile, { recursive: true, force: true });
}
