import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect, Layer, ManagedRuntime, Result } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { Workspace, WorkspaceLive } from "../src/server/workspace/service";
import { databaseLayer } from "../src/server/storage/database";
import { command } from "../src/shared/workspace";

const createRuntime = (filename: string) =>
  ManagedRuntime.make(
    WorkspaceLive.pipe(Layer.provideMerge(databaseLayer(filename))),
  );

test("production gate checks staging, exact artifact approval, versions, and one-time execution", async () => {
  const directory = await mkdtemp(join(tmpdir(), "forma-gate-"));
  const runtime = createRuntime(join(directory, "app.sqlite"));

  try {
    await runtime.runPromise(
      Effect.gen(function* () {
        const workspace = yield* Workspace;
        const sql = yield* SqlClient.SqlClient;
        yield* workspace.mutate(command("seed"));

        const blocked = yield* workspace
          .mutate(command("deploy", { id: "rel-console", version: 1 }))
          .pipe(Effect.result);

        expect(Result.isFailure(blocked)).toBe(true);

        const failedBuild = yield* workspace
          .mutate(
            command("approval-submit", {
              id: "rel-api",
              version: 1,
              value: "Promote API",
              note: "Roll back on error.",
            }),
          )
          .pipe(Effect.result);

        expect(Result.isFailure(failedBuild)).toBe(true);

        const submitted = yield* workspace.mutate(
          command("approval-submit", {
            id: "rel-console",
            version: 1,
            value: "Promote console",
            note: "Monitor errors; roll back on regression.",
          }),
        );

        const approval = submitted.approvals[0];

        if (!approval) throw new Error("Expected approval");
        yield* workspace.mutate(
          command("approval-decide", {
            id: approval.id,
            version: 1,
            value: "Approved",
          }),
        );

        const stale = yield* workspace
          .mutate(
            command("approval-decide", {
              id: approval.id,
              version: 1,
              value: "Changes requested",
              note: "Stale decision",
            }),
          )
          .pipe(Effect.result);

        expect(Result.isFailure(stale)).toBe(true);
        yield* sql`UPDATE approvals SET artifact='wrong-artifact' WHERE id=${approval.id}`;

        const wrongArtifact = yield* workspace
          .mutate(command("deploy", { id: "rel-console", version: 1 }))
          .pipe(Effect.result);

        expect(Result.isFailure(wrongArtifact)).toBe(true);
        yield* sql`UPDATE approvals SET artifact='sha256:console-a3f42d1' WHERE id=${approval.id}`;

        const deployed = yield* workspace.mutate(
          command("deploy", { id: "rel-console", version: 1 }),
        );

        expect(
          deployed.releases.find((r) => r.id === "rel-console")?.stage,
        ).toBe("Production");
        expect(deployed.approvals[0]?.status).toBe("Deployed");

        const replay = yield* workspace
          .mutate(command("deploy", { id: "rel-console", version: 1 }))
          .pipe(Effect.result);

        expect(Result.isFailure(replay)).toBe(true);
        expect((yield* workspace.snapshot()).posts.length).toBe(
          deployed.posts.length,
        );
      }),
    );
  } finally {
    await runtime.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});

test("workspace updates survive restart, stale writes fail, and seeding preserves edits", async () => {
  const directory = await mkdtemp(join(tmpdir(), "forma-persistence-"));
  const file = join(directory, "app.sqlite");
  const first = createRuntime(file);

  try {
    await first.runPromise(
      Effect.gen(function* () {
        const service = yield* Workspace;
        const sql = yield* SqlClient.SqlClient;

        yield* service.mutate(command("seed"));
        yield* sql`UPDATE preferences SET value='gpt-5' WHERE key='model'`;

        const seeded = yield* service.mutate(command("seed"));

        expect(seeded.preferences.find((p) => p.key === "model")?.value).toBe("gpt-6.1-sol");

        const unsupported = yield* service.mutate(
          command("preference", { id: "model", value: "gpt-5" }),
        ).pipe(Effect.result);

        expect(Result.isFailure(unsupported)).toBe(true);
        yield* service.mutate(command("preference", { id: "model", value: "gpt-6-luna" }));
        yield* service.mutate(
          command("ticket-update", {
            id: "FRM-102",
            version: 1,
            value: "Done",
          }),
        );

        const stale = yield* service
          .mutate(
            command("ticket-update", {
              id: "FRM-102",
              version: 1,
              value: "Todo",
            }),
          )
          .pipe(Effect.result);

        expect(Result.isFailure(stale)).toBe(true);
        yield* service.mutate(
          command("preference", { id: "fast", value: "false" }),
        );
        yield* service.mutate(command("preference", { id: "effort", value: "high" }));
        yield* service.mutate(command("seed"));
      }),
    );
    await first.dispose();
    const second = createRuntime(file);

    try {
      const state = await second.runPromise(
        Effect.flatMap(Workspace, (s) => s.snapshot()),
      );

      expect(state.tickets.find((t) => t.id === "FRM-102")?.status).toBe(
        "Done",
      );
      expect(state.preferences.find((p) => p.key === "fast")?.value).toBe(
        "false",
      );
      expect(state.preferences.find((p) => p.key === "effort")?.value).toBe("high");
      expect(state.preferences.find((p) => p.key === "model")?.value).toBe("gpt-6-luna");
    } finally {
      await second.dispose();
    }
  } finally {
    await first.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});

test("approval drafts and resubmission retain request identity and activity", async () => {
  const directory = await mkdtemp(join(tmpdir(), "forma-approval-"));
  const runtime = createRuntime(join(directory, "app.sqlite"));

  try {
    await runtime.runPromise(
      Effect.gen(function* () {
        const service = yield* Workspace;
        yield* service.mutate(command("seed"));

        const draft = yield* service.mutate(
          command("approval-save", {
            id: "rel-console",
            version: 1,
            value: "Promote console",
            note: "Watch errors and roll back on failure.",
            files: ["checklist.txt"],
          }),
        );

        const first = draft.approvals[0];

        if (!first) throw new Error("Expected draft");
        expect(first.status).toBe("Draft");

        const submitted = yield* service.mutate(
          command("approval-submit", {
            id: "rel-console",
            version: 1,
            value: first.title,
            note: first.reason,
            files: [...first.attachments],
          }),
        );

        expect(submitted.approvals[0]?.id).toBe(first.id);

        const missingReason = yield* service
          .mutate(
            command("approval-decide", {
              id: first.id,
              version: 2,
              value: "Changes requested",
            }),
          )
          .pipe(Effect.result);

        expect(Result.isFailure(missingReason)).toBe(true);
        yield* service.mutate(
          command("approval-decide", {
            id: first.id,
            version: 2,
            value: "Changes requested",
            note: "Name the rollback owner.",
          }),
        );

        const revised = yield* service.mutate(
          command("approval-submit", {
            id: "rel-console",
            version: 1,
            value: first.title,
            note: "Maya owns rollback.",
            files: ["checklist.txt"],
          }),
        );

        expect(revised.approvals.length).toBe(1);
        expect(revised.approvals[0]?.id).toBe(first.id);
        expect(revised.approvals[0]?.status).toBe("Pending");
        expect(revised.events.length).toBe(4);
      }),
    );
  } finally {
    await runtime.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});
