import { expect, test } from "bun:test";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const source = resolve(import.meta.dir, "..");

const environment = {
  ...process.env,
  AI_MODE: "mock",
  OPENROUTER_API_KEY: "",
  OPENROUTER_MODEL: "openai/gpt-4.1-mini",
  OPENROUTER_DECISION_MODEL: "typesafe/jev-1.13",
  // Every child resolves this inside its disposable working directory.
  APP_DATA_DIR: ".data",
};

// Bun test sets NODE_ENV=test; generated builds must select their own normal mode.
delete environment.NODE_ENV;

function launch(
  args: string[],
  cwd: string,
  timeoutMs = 120_000,
  extraEnv: Record<string, string> = {},
) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...environment, ...extraEnv },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let log = "";
  let finished = false;

  const capture = (chunk: Buffer) => {
    log = (log + chunk.toString()).slice(-24_000);
  };

  child.stdout.on("data", capture);
  child.stderr.on("data", capture);

  const stop = (signal: NodeJS.Signals = "SIGTERM") => {
    if (child.pid) {
      try {
        process.kill(-child.pid, signal);
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) throw error;
      }
    }
  };

  const timer = setTimeout(() => stop("SIGKILL"), timeoutMs);

  const exited = new Promise<number>((accept, reject) => {
    child.once("error", reject);
    child.once("close", (code) => {
      finished = true;
      clearTimeout(timer);
      accept(code ?? -1);
    });
  });

  return {
    exited,
    stop,
    log: () => log,
    finished: () => finished,
    async close() {
      stop();
      const kill = setTimeout(() => stop("SIGKILL"), 3000);

      try {
        await exited;
      } finally {
        clearTimeout(kill);
        clearTimeout(timer);
      }
    },
  };
}

async function command(args: string[], cwd: string) {
  const run = launch(args, cwd);
  const code = await run.exited;

  if (code !== 0) throw new Error(`Command failed (${args.join(" ")}):\n${run.log()}`);

  return run.log();
}

test("bootstrap excludes local artifacts, refuses overwrites, and starts every route", async () => {
  const temporary = await mkdtemp("/tmp/foundation-bootstrap-");

  try {
    // Exercise the distributable script from a different cwd, including a path containing spaces.
    const skill = join(temporary, "installed skill");
    await cp(source, skill, { recursive: true });
    const template = join(skill, "examples");
    await writeFile(join(template, ".env"), "DO_NOT_COPY=secret\n");
    await writeFile(join(template, ".env.local"), "DO_NOT_COPY=secret\n");

    for (const directory of ["node_modules", ".output", ".git", "dist", ".tanstack", ".data", "test-results", "playwright-report"]) {
      await mkdir(join(template, directory), { recursive: true });
      await writeFile(join(template, directory, "sentinel"), "local artifact");
    }

    const generator = join(skill, "scripts/create.ts");
    const copyOnly = join(temporary, "copy-only");
    await command([generator, copyOnly, "--skip-install"], temporary);
    expect(await Bun.file(join(copyOnly, "package.json")).exists()).toBe(true);
    expect(existsSync(join(copyOnly, "node_modules"))).toBe(false);
    const app = join(temporary, "generated app");
    await command([generator, app, "--name", "bootstrap-demo"], temporary);
    const manifest = JSON.parse(await readFile(join(app, "package.json"), "utf8"));
    expect(manifest.name).toBe("bootstrap-demo");
    expect(manifest.scripts.dev).toContain("--name bootstrap-demo");

    for (const file of [
      ".env",
      ".env.local",
      ".git/sentinel",
      ".output/sentinel",
      "dist/sentinel",
      ".tanstack/sentinel",
      "node_modules/sentinel",
      ".data/sentinel",
      "test-results/sentinel",
      "playwright-report/sentinel",
    ])
      expect(await Bun.file(join(app, file)).exists()).toBe(false);
    expect(await Bun.file(join(app, ".env.example")).exists()).toBe(true);
    expect(await Bun.file(join(app, "foundation.json")).json()).toMatchObject({ version: "0.2.0" });
    expect(await Bun.file(join(app, ".github/workflows/check.yml")).exists()).toBe(true);
    const lock = await readFile(join(app, "bun.lock"), "utf8");
    expect(lock).toContain('"name": "bootstrap-demo"');
    await command(["install", "--frozen-lockfile"], app);
    expect(await readFile(join(app, "bun.lock"), "utf8")).toBe(lock);
    await writeFile(join(app, "keep.txt"), "preserve me");

    const duplicate = launch(
      [generator, app, "--name", "bootstrap-demo", "--skip-install"],
      temporary,
    );

    expect(await duplicate.exited).not.toBe(0);
    expect(await readFile(join(app, "keep.txt"), "utf8")).toBe("preserve me");

    const invalid = launch(
      [generator, join(temporary, "invalid"), "--name", "bad;name", "--skip-install"],
      temporary,
    );

    expect(await invalid.exited).not.toBe(0);

    await command(["run", "check"], app);
    await command(["scripts/database.ts", "seed"], app);

    const reservation = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () => new Response("reserved"),
    });

    const port = reservation.port;
    await reservation.stop(true);
    const server = launch(["run", "start"], app, 60_000, { PORT: String(port), HOST: "127.0.0.1" });

    try {
      const base = `http://127.0.0.1:${port}`;
      const deadline = Date.now() + 30_000;
      let ready = false;

      while (Date.now() < deadline && !server.finished()) {
        try {
          const response = await fetch(base, { signal: AbortSignal.timeout(1000) });
          await response.arrayBuffer();

          if (response.ok) {
            ready = true;
            break;
          }
        } catch {
          /* Listener may not be bound yet. */
        }

        await Bun.sleep(100);
      }

      if (!ready) throw new Error(`Generated app did not start:\n${server.log()}`);

      for (const [path, content] of [
        ["/", "Small by design."],
        ["/pi-agent", "What’s on your mind?"],
        ["/decisions", "Small judgments. Useful software."],
        ["/decisions/tickets", "A different message. A different next step."],
        ["/decisions/ranking", "Ranking playground"],
        ["/decisions/evidence", "Evidence checker"],
        ["/decisions/actions", "Request → typed action"],
        ["/decisions/skills", "Skill finder"],
        ["/decisions/extraction", "Pick the right value"],
        ["/collections", "Collections"],
        ["/collections/item-1", "Collection item 1"],
        ["/collections/item-2", "Collection item 2"],
        ["/collections/item-3", "Collection item 3"],
      ]) {
        const response = await fetch(base + path, { signal: AbortSignal.timeout(5000) });
        const html = await response.text();
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain("text/html");
        expect(html).toContain(content);
        expect(html).toContain("Mock provider");
        const asset = html.match(/src="([^" ]+\.js)"/);
        expect(asset).not.toBeNull();

        if (asset) {
          const response = await fetch(new URL(asset[1], base));
          expect(response.status).toBe(200);
          expect(response.headers.get("content-type")).toMatch(/javascript/);
          await response.arrayBuffer();
        }
      }
      const missing = await fetch(base + "/collections/missing-item", { signal: AbortSignal.timeout(5000) });
      expect(missing.status).toBe(404);
      expect(await missing.text()).toContain("Collection item not found");
    } finally {
      await server.close();
    }

    // A symlink must never make external data part of a generated app.
    await symlink(join(temporary, "outside-secret"), join(template, "unexpected-link"));
    const rejected = join(temporary, "unsafe-copy");
    const links = launch([generator, rejected, "--skip-install"], temporary);
    expect(await links.exited).not.toBe(0);
    expect(await Bun.file(join(rejected, "package.json")).exists()).toBe(false);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}, 180_000);
