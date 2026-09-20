import { databaseLayer } from "../src/server/storage/database";
import { expect, test } from "bun:test";
import { Effect, Schema, Layer } from "effect";
import { CollectionItem } from "../src/shared/collections";
import { Collections, CollectionsLive } from "../src/server/collections/service";

test("every overview item has a distinct stable detail record", async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const service = yield* Collections;
      yield* service.seed();
      const collections = yield* service.list();
      expect(collections.length).toBe(3);
      expect(new Set(collections.map((item) => item.id)).size).toBe(3);

      for (const item of collections) {
        const detail = yield* service.get(item.id);
        expect(detail).toEqual(item);
        expect(Schema.is(CollectionItem)(detail)).toBe(true);
      }

      expect(yield* service.get("missing-item")).toBeNull();
    }).pipe(Effect.provide(CollectionsLive.pipe(Layer.provide(databaseLayer(":memory:"))))),
  );
});

test("writes increment versions and reject stale edits and deletes", async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const service = yield* Collections;
      expect(yield* service.list()).toEqual([]);
      yield* service.seed();
      const original = yield* service.get("item-1");

      if (!original) throw new Error("Missing seeded item");
      const updated = yield* service.save({ ...original, title: "Updated title" });
      expect(updated.version).toBe(2);
      expect(
        yield* service.save({ ...original, title: "Stale title" }).pipe(Effect.flip),
      ).toMatchObject({ code: "Conflict" });
      expect(yield* service.remove(original.id, original.version).pipe(Effect.flip)).toMatchObject({
        code: "Conflict",
      });
      expect((yield* service.get(original.id))?.title).toBe("Updated title");
      yield* service.seed();
      expect((yield* service.get(original.id))?.title).toBe("Updated title");
      yield* service.remove(updated.id, updated.version);
      expect(yield* service.get(updated.id)).toBeNull();
    }).pipe(Effect.provide(CollectionsLive.pipe(Layer.provide(databaseLayer(":memory:"))))),
  );
});

test("collection title schema rejects empty values and encodes records", async () => {
  const { TestSchema } = await import("effect/testing");
  const { SaveCollectionItem } = await import("../src/shared/collections");
  const { demoItems } = await import("../src/server/collections/fixtures");
  const assertions = new TestSchema.Asserts(SaveCollectionItem);
  const item = demoItems[0];

  if (!item) throw new Error("Missing test fixture");
  await assertions
    .decoding()
    .succeed({ ...item, title: "  Trimmed  " }, { ...item, title: "Trimmed" });
  await assertions
    .decoding()
    .fail(
      { ...item, title: "   " },
      'Expected a value with a length of at least 1\n  at ["title"]',
    );
  await new TestSchema.Asserts(CollectionItem).encoding().succeed(item);
});
