import { expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import config from "../oxlint.config";

test("every vendored plugin rule is enabled as an error", async () => {
  const enabledRules = new Map(Object.entries(config.rules));
  let count = 0;

  for (const [name, entrypoint] of [
    ["anti-slop", "index.ts"],
    ["anti-slop-effect", "effect/index.ts"],
  ] as const) {
    const source = await Bun.file(`tools/oxlint/anti-slop/${entrypoint}`).text();

    for (const match of source.matchAll(/^\s*"([a-z-]+)":/gm)) {
      expect(enabledRules.get(`${name}/${match[1]}`)).toBe("error");
      count += 1;
    }
  }

  expect(count).toBe(23);
});

test("Oxlint executes both plugins and accepts corrected code", () => {
  const directory = mkdtempSync(join(tmpdir(), "foundation-lint-"));
  const fixture = join(directory, "fixture.ts");

  const lint = () =>
    Bun.spawnSync([
      resolve("node_modules/.bin/oxlint"),
      "--config",
      resolve("oxlint.config.ts"),
      fixture,
    ]);

  try {
    writeFileSync(
      fixture,
      'const value = Reflect.get({ a: 1 }, "a");\n\nif (value._tag === "Ready") console.log(value);\n',
    );
    const rejected = lint();
    const diagnostics = rejected.stdout.toString() + rejected.stderr.toString();

    expect(rejected.exitCode).toBe(1);
    expect(diagnostics).toContain("anti-slop(no-reflect-get)");
    expect(diagnostics).toContain("anti-slop-effect(no-manual-tag-comparison)");

    writeFileSync(
      fixture,
      'import { Predicate } from "effect";\n\nconst value = { a: 1 };\n\nconsole.log(value.a, Predicate.isTagged("Ready")(value));\n',
    );
    expect(lint().exitCode).toBe(0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
