import { cp, mkdir, mkdtemp, rm } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { tmpdir } from "node:os"

const source = resolve(import.meta.dir, "../examples")
const root = await mkdtemp(join(tmpdir(), "opencode-sdk-check-"))
const app = join(root, "app")
const excluded = new Set(["node_modules", "dist", ".data", ".git"])

async function run(args: string[], name: string) {
  const state = join(root, name)
  await Promise.all(["config", "data", "cache", "state", "home", "tmp"].map((dir) => mkdir(join(state, dir), { recursive: true })))
  const child = Bun.spawn([process.execPath, ...args], {
    cwd: app,
    // Do not forward provider credentials or user OpenCode configuration into the fixture.
    env: { PATH: process.env.PATH ?? "", NODE_ENV: "test", OPENCODE_EXAMPLE_ROOT: state,
      OPENCODE_TEST_HOME: join(state, "home"), TMPDIR: join(state, "tmp"),
      BUN_INSTALL_CACHE_DIR: join(state, "bun-cache"),
      XDG_CONFIG_HOME: join(state, "config"), XDG_DATA_HOME: join(state, "data"),
      XDG_CACHE_HOME: join(state, "cache"), XDG_STATE_HOME: join(state, "state") },
    stdout: "inherit", stderr: "inherit",
  })
  const timer = setTimeout(() => child.kill(), 120_000)
  try {
    if (await child.exited !== 0) throw new Error(`Verification failed: bun ${args.join(" ")}`)
  } finally {
    clearTimeout(timer)
    if (child.exitCode === null) { child.kill(); await child.exited }
  }
}

try {
  await cp(source, app, { recursive: true, filter: (path) => !excluded.has(basename(path)) })
  await run(["install", "--frozen-lockfile"], "install")
  await run(["run", "typecheck"], "types")
  await run(["test", "--timeout", "20000"], "tests")
  await run(["effect.ts"], "effect")
  await run(["code-mode.ts"], "code-mode")
} finally {
  await rm(root, { recursive: true, force: true })
}
