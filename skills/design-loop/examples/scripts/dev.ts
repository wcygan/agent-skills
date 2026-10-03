import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve from this file so installed skills work from any current directory.
const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const skillFile = join(appRoot, "..", "SKILL.md");

// gh-managed skill files stay immutable; dependencies and data live in a cache.
if (existsSync(skillFile) && /^\s+github-pinned:/m.test(readFileSync(skillFile, "utf8"))) {
  const ignored = new Set([
    "node_modules", ".git", ".data", ".output", ".tanstack", "dist",
    "test-results", "playwright-report", "coverage", ".browser-use", ".venv",
    "__pycache__",
  ]);

  const files = [...new Bun.Glob("**/*").scanSync({ cwd: appRoot, dot: true, onlyFiles: true })]
    .filter((path) => !path.split("/").some((part) => ignored.has(part)))
    .filter((path) => !/(^|\/)\.env($|\.)/.test(path) || path === ".env.example")
    .sort();

  const hash = new Bun.CryptoHasher("sha256");

  for (const path of files) {
    hash.update(path + "\0");
    hash.update(readFileSync(join(appRoot, path)));
  }

  const cacheRoot = join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "design-loop", "forma");
  const runtimeRoot = join(cacheRoot, hash.digest("hex"), "app");

  for (const path of files) {
    const destination = join(runtimeRoot, path);

    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(appRoot, path), destination);
  }

  console.log(`App directory: ${runtimeRoot}`);

  const runtime = Bun.spawn([process.execPath, join(runtimeRoot, "scripts/dev.ts"), ...process.argv.slice(2)], {
    cwd: runtimeRoot,
    env: { ...process.env, APP_DATA_DIR: process.env.APP_DATA_DIR ?? join(cacheRoot, "data") },
    stdin: "inherit", stdout: "inherit", stderr: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(signal, () => runtime.kill(signal));
  }

  process.exit(await runtime.exited);
}

process.chdir(appRoot);

const port = Number(process.env.PORT ?? 5173);

if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("PORT must be an integer between 1024 and 65535.");
}

for (const args of [["install", "--frozen-lockfile"], ["run", "seed"]]) {
  const child = Bun.spawn([process.execPath, ...args], {
    cwd: appRoot,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const code = await child.exited;

  if (code !== 0) process.exit(code);
}

const env = { ...process.env };

const macCli = "/Applications/Tailscale.app/Contents/MacOS/Tailscale";

const tailscale = Bun.which("tailscale") ?? (existsSync(macCli) ? macCli : undefined);

if (tailscale && (env.HOST ?? "0.0.0.0") === "0.0.0.0") {
  try {
    const status = JSON.parse(execFileSync(tailscale, ["status", "--json"], {
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
    }));

    if (status.BackendState === "Running") {
      const dnsName = status.Self?.DNSName?.replace(/\.$/, "");

      if (dnsName && status.CurrentTailnet?.MagicDNSEnabled) {
        // Permit this machine's exact names; retain Vite's host checks.
        env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = [
          env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS,
          dnsName,
          dnsName.split(".")[0],
        ].filter(Boolean).join(",");
        console.log(`Tailscale: http://${dnsName}:${port}`);
      }

      const ip = status.Self?.TailscaleIPs?.find((address: string) => !address.includes(":"));

      if (ip) console.log(`Tailscale IP: http://${ip}:${port}`);
    }
  } catch {
    console.log("Tailscale discovery unavailable; continuing with local/LAN access.");
  }
}

const server = Bun.spawn([
  process.execPath, "--bun", join(appRoot, "node_modules/vite/bin/vite.js"),
  ...process.argv.slice(2),
], { cwd: appRoot, env, stdin: "inherit", stdout: "inherit", stderr: "inherit" });

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.on(signal, () => server.kill(signal));
}

process.exit(await server.exited);
