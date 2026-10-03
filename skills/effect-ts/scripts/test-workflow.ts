import { cp, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { basename, join, resolve } from "node:path"

// Dependencies, SQLite state, and build artifacts never enter the skill catalog.
const source = resolve(import.meta.dir, "../examples/workflow")
const directory = await mkdtemp(join(tmpdir(), "effect-workflow-fixture-"))
const app = join(directory, "app")
const excluded = new Set(["node_modules", ".data", "dist", ".git"])

async function run(args: string[], extraEnv: Record<string, string> = {}) {
  const child = Bun.spawn([process.execPath, ...args], {
    cwd: app,
    env: { ...process.env, NODE_ENV: "development", ...extraEnv },
    stdout: "inherit", stderr: "inherit",
  })
  const timer = setTimeout(() => child.kill("SIGKILL"), 120_000)
  try {
    const code = await child.exited
    if (code !== 0) throw new Error(`bun ${args.join(" ")} exited with ${code}`)
  } finally { clearTimeout(timer) }
}

try {
  await cp(source, app, { recursive: true, filter: (path) => !excluded.has(basename(path)) })
  await run(["install", "--frozen-lockfile"])
  await run(["run", "typecheck"])
  await run(["test"])
  // Exercise the server as a built Bun bundle as well as its TypeScript source.
  await run(["build", "server.ts", "--target=bun", "--outdir=dist"])
  await run(["test"], { WORKFLOW_SERVER: "dist/server.js" })
} finally {
  await rm(directory, { recursive: true, force: true })
}
