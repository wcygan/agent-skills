#!/usr/bin/env bun
import { cp, lstat, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const skillRoot = resolve(import.meta.dir, "..");

const template = join(skillRoot, "examples");

const excluded = new Set([
  "node_modules",
  ".git",
  ".output",
  "dist",
  ".tanstack",
  ".vite",
  ".cache",
  ".data",
  "test-results",
  "playwright-report",
  "coverage",
  ".DS_Store",
  ".playwright-cli",
]);

function usage() {
  console.log(
    "Usage: bun create.ts <destination> [--name <app-name>] [--skip-install]\n\nCreates an independent app. Destination must not exist.\nNames use lowercase letters, digits, and hyphens (max 63 characters).\nDependencies are installed with the bundled lockfile unless --skip-install is set.",
  );
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    usage();

    return;
  }

  let destination: string | undefined;
  let name: string | undefined;
  let install = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--skip-install") install = false;
    else if (arg === "--name") {
      name = args[++i];

      if (!name || name.startsWith("--")) throw new Error("--name requires an app name");
    } else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else if (destination) throw new Error("Provide exactly one destination");
    else destination = resolve(arg);
  }

  if (!destination) {
    usage();
    throw new Error("A destination is required");
  }

  name ??= basename(destination);

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(name)) {
    throw new Error("Use --name with a lowercase hostname, for example --name my-app");
  }

  await mkdir(dirname(destination), { recursive: true });
  destination = join(await realpath(dirname(destination)), basename(destination));
  const sourceRoot = await realpath(skillRoot);

  if (destination === sourceRoot || destination.startsWith(sourceRoot + sep)) {
    throw new Error("Create the application outside the installed skill directory");
  }

  // Exclusive creation establishes ownership; existing directories (even empty) are never overwritten.
  await mkdir(destination);

  try {
    await cp(template, destination, {
      recursive: true,
      filter: async (source) => {
        const parts = relative(template, source).split(sep);

        if (
          parts.some(
            (part) => excluded.has(part) || /\.sqlite(?:-wal|-shm)?$/.test(part) || (part.startsWith(".env") && part !== ".env.example"),
          )
        )
          return false;

        // Never follow or distribute links to local files/secrets.
        if ((await lstat(source)).isSymbolicLink())
          throw new Error(`Template contains a symbolic link: ${relative(template, source)}`);

        return true;
      },
      dereference: false,
    });
    const manifestPath = join(destination, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const originalName = manifest.name;
    manifest.name = name;
    manifest.scripts.dev = `portless run --name ${name} bun --bun vite --host 127.0.0.1`;
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    // Bun's lockfile is JSONC. Replace only the root workspace name, preserving dependency pins.
    const lockPath = join(destination, "bun.lock");
    const lock = await readFile(lockPath, "utf8");
    const nameEntry = `"name": ${JSON.stringify(originalName)}`;

    if (!lock.includes(nameEntry)) throw new Error("Template lockfile does not match package.json");
    await writeFile(lockPath, lock.replace(nameEntry, `"name": ${JSON.stringify(name)}`));
    const readmePath = join(destination, "README.md");
    const readme = await readFile(readmePath, "utf8");
    await writeFile(
      readmePath,
      readme
        .replace(/^# Foundation/m, `# ${name}`)
        .replaceAll("https://foundation.localhost", `https://${name}.localhost`),
    );
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }

  if (install) {
    const child = Bun.spawn([process.execPath, "install", "--frozen-lockfile"], {
      cwd: destination,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const code = await child.exited;

    if (code !== 0)
      throw new Error(
        `Dependency installation failed (${code}). App retained at ${destination}; run just setup there to retry.`,
      );
  }

  console.log(
    `\nCreated ${name} at ${destination}\n\nNext:\n  cd '${destination.replaceAll("'", "'\\''")}'\n  ${install ? "just dev" : "just setup\n  just dev"}\n\nDevelopment URL: https://${name}.localhost (Portless may add a Git worktree prefix)\nRequires just and Portless; see README.md. Mock mode needs no API key.`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Bootstrap failed");
    process.exitCode = 1;
  });
}
