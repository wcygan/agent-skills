import { Effect } from "effect";
import { SqlClient } from "effect/unstable/sql";

export const workspaceMigration = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE TABLE tickets (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, owner TEXT NOT NULL, app_id TEXT NOT NULL, version INTEGER NOT NULL)`;
  yield* sql`CREATE TABLE applications (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, domain TEXT NOT NULL)`;
  yield* sql`CREATE TABLE releases (id TEXT PRIMARY KEY, app_id TEXT NOT NULL REFERENCES applications(id), version TEXT NOT NULL, commit_hash TEXT NOT NULL, artifact TEXT NOT NULL, stage TEXT NOT NULL, ticket_ids TEXT NOT NULL, revision INTEGER NOT NULL)`;
  yield* sql`CREATE TABLE approvals (id TEXT PRIMARY KEY, release_id TEXT NOT NULL REFERENCES releases(id), artifact TEXT NOT NULL, title TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL, note TEXT NOT NULL, attachments TEXT NOT NULL, version INTEGER NOT NULL)`;
  yield* sql`CREATE TABLE posts (id TEXT PRIMARY KEY, author TEXT NOT NULL, body TEXT NOT NULL, ticket_id TEXT NOT NULL, release_id TEXT NOT NULL, created TEXT NOT NULL, saved INTEGER NOT NULL DEFAULT 0, liked INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0)`;
  yield* sql`CREATE TABLE replies (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id), author TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL)`;
  yield* sql`CREATE TABLE notifications (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id), body TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0)`;
  yield* sql`CREATE TABLE preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL)`;
});
