import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import {
  Snapshot,
  Ticket,
  Application,
  Release,
  Approval,
  Post,
  Reply,
  Notification,
  Preference,
  WorkspaceEvent,
  Command,
} from "../../shared/workspace";
import { AppError } from "../errors";

const StoredRelease = Schema.Struct({
  ...Release.fields,
  ticketIds: Schema.fromJsonString(Schema.Array(Schema.String)),
});

const StoredApproval = Schema.Struct({
  ...Approval.fields,
  attachments: Schema.fromJsonString(Schema.Array(Schema.String)),
});

const storageError = () =>
  AppError.make({
    code: "Storage",
    message: "Could not access the workspace. Retry or check the server logs.",
  });

const conflict = (message: string) =>
  AppError.make({ code: "Conflict", message });

export class Workspace extends Context.Service<
  Workspace,
  {
    snapshot: () => Effect.Effect<Snapshot, AppError>;
    mutate: (input: Command) => Effect.Effect<Snapshot, AppError>;
  }
>()("forma/Workspace") {}

export const WorkspaceLive = Layer.effect(
  Workspace,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const snapshot = Effect.fn("Workspace.snapshot")(
      function* () {
        const [
          tickets,
          apps,
          releases,
          approvals,
          posts,
          replies,
          notifications,
          preferences,
          events,
        ] = yield* Effect.all(
          [
            sql`SELECT id,title,description,status,owner,app_id AS appId,version FROM tickets ORDER BY id`,
            sql`SELECT * FROM applications ORDER BY name`,
            sql`SELECT id,app_id AS appId,version,commit_hash AS "commit",artifact,stage,ticket_ids AS ticketIds,revision FROM releases ORDER BY id`,
            sql`SELECT id,release_id AS releaseId,artifact,title,reason,status,note,attachments,version FROM approvals ORDER BY rowid DESC`,
            sql`SELECT id,author,body,ticket_id AS ticketId,release_id AS releaseId,created,saved,liked,hidden FROM posts ORDER BY created DESC`,
            sql`SELECT id,post_id AS postId,author,body,created FROM replies ORDER BY created`,
            sql`SELECT id,post_id AS postId,body,read FROM notifications ORDER BY rowid DESC`,
            sql`SELECT * FROM preferences`,
            sql`SELECT id,entity_id AS entityId,body,created FROM workspace_events ORDER BY created`,
          ],
          { concurrency: "unbounded" },
        ).pipe(Effect.mapError(storageError));

        return yield* Schema.decodeUnknownEffect(Snapshot)({
          tickets: yield* Schema.decodeUnknownEffect(Schema.Array(Ticket))(
            tickets,
          ),
          apps: yield* Schema.decodeUnknownEffect(Schema.Array(Application))(
            apps,
          ),
          releases: yield* Schema.decodeUnknownEffect(
            Schema.Array(StoredRelease),
          )(releases),
          approvals: yield* Schema.decodeUnknownEffect(
            Schema.Array(StoredApproval),
          )(approvals),
          posts: yield* Schema.decodeUnknownEffect(Schema.Array(Post))(posts),
          replies: yield* Schema.decodeUnknownEffect(Schema.Array(Reply))(
            replies,
          ),
          notifications: yield* Schema.decodeUnknownEffect(
            Schema.Array(Notification),
          )(notifications),
          events: yield* Schema.decodeUnknownEffect(
            Schema.Array(WorkspaceEvent),
          )(events),
          preferences: yield* Schema.decodeUnknownEffect(
            Schema.Array(Preference),
          )(preferences),
        }).pipe(Effect.mapError(storageError));
      },
      Effect.mapError((error) =>
        Schema.is(AppError)(error) ? error : storageError(),
      ),
    );

    const seed = Effect.gen(function* () {
      yield* sql`INSERT OR IGNORE INTO applications VALUES ('console','Customer console','The main customer workspace','console.forma.example'),('api','Public API','API and integrations','api.forma.example'),('website','Public website','Product, pricing, and docs','forma.example')`;
      yield* sql`INSERT OR IGNORE INTO tickets VALUES ('FRM-101','Simplify notification preferences','Bring email delivery and notification types together.','Done','Maya','console',1),('FRM-102','Verify mobile navigation','Keep primary actions visible on narrow screens.','In progress','Alex','console',1),('FRM-103','Fix artifact signing','Repair the failing signature verification step.','Todo','Sam','api',1),('FRM-104','Publish pricing improvements','Explain plans and billing units clearly.','Done','Maya','website',1)`;
      yield* sql`INSERT OR IGNORE INTO releases VALUES ('rel-console','console','v1.8.0','a3f42d1','sha256:console-a3f42d1','Staging ready','["FRM-101","FRM-102"]',1),('rel-api','api','v2.3.1','b8e90a2','sha256:api-b8e90a2','Failed','["FRM-103"]',1),('rel-website','website','v1.2.0','c19fdea','sha256:website-c19fdea','Production','["FRM-104"]',1)`;
      yield* sql`INSERT OR IGNORE INTO posts VALUES ('goal-console','Maya Chen','Goal: make the customer console easier to use. Notification preferences are done; mobile review is in progress. The release is in staging, waiting for production approval.','FRM-102','rel-console','2026-10-03T10:00:00Z',0,0,0),('goal-api','Build agent','The API artifact failed signature verification. Production is blocked until the build is repaired and staging passes.','FRM-103','rel-api','2026-10-03T09:30:00Z',0,0,0)`;
      yield* sql`INSERT OR IGNORE INTO replies VALUES ('reply-one','goal-console','Alex Rivera','I’ll finish the mobile check before we request production approval.','2026-10-03T10:15:00Z')`;
      yield* sql`INSERT OR IGNORE INTO notifications VALUES ('notice-one','goal-console','Alex replied to the console launch goal',0)`;
      yield* sql`INSERT OR IGNORE INTO preferences VALUES ('provider','OpenAI'),('model','gpt-5'),('effort','medium'),('fast','false'),('email','true'),('mentions','true')`;
    });

    const mutate = Effect.fn("Workspace.mutate")(function* (input: Command) {
      const c = yield* Schema.decodeUnknownEffect(Command)(input).pipe(
        Effect.mapError(storageError),
      );

      yield* sql
        .withTransaction(
          Effect.gen(function* () {
            if (c.kind === "seed") {
              yield* seed;

              return;
            }

            const state = yield* snapshot();
            const ticket = state.tickets.find((t) => t.id === c.id);
            const release = state.releases.find((r) => r.id === c.id);
            const approval = state.approvals.find((a) => a.id === c.id);

            if (c.kind === "ticket-create") {
              if (
                !c.value.trim() ||
                !state.apps.some((a) => a.id === c.related)
              )
                return yield* Effect.fail(
                  conflict("Enter a title and choose an application."),
                );
              yield* sql`INSERT INTO tickets VALUES (${c.id},${c.value.trim()},${c.note},'Todo','You',${c.related},1)`;
            } else if (
              c.kind === "ticket-update" ||
              c.kind === "ticket-archive"
            ) {
              if (!ticket || ticket.version !== c.version)
                return yield* Effect.fail(
                  conflict("This ticket changed. Refresh before updating it."),
                );

              const status =
                c.kind === "ticket-archive"
                  ? ticket.status === "Archived"
                    ? "Todo"
                    : "Archived"
                  : c.value;

              if (!["Todo", "In progress", "Done", "Archived"].includes(status))
                return yield* Effect.fail(
                  conflict("Choose a valid ticket status."),
                );
              yield* sql`UPDATE tickets SET status=${status}, version=version+1 WHERE id=${c.id}`;
            } else if (c.kind === "release-retry") {
              if (
                !release ||
                release.stage !== "Failed" ||
                release.revision !== c.version
              )
                return yield* Effect.fail(
                  conflict("Only the current failed build can be retried."),
                );
              yield* sql`UPDATE releases SET stage='Staging ready',revision=revision+1 WHERE id=${c.id}`;
            } else if (
              c.kind === "approval-submit" ||
              c.kind === "approval-save"
            ) {
              if (
                !release ||
                release.stage !== "Staging ready" ||
                release.revision !== c.version
              )
                return yield* Effect.fail(
                  conflict(
                    "Production requests require the current artifact to pass staging.",
                  ),
                );

              if (!c.value.trim() || !c.note.trim() || c.files.length > 3)
                return yield* Effect.fail(
                  conflict(
                    "Enter a title and rollout plan; attach at most three files.",
                  ),
                );

              const existing = state.approvals.find(
                (a) =>
                  a.releaseId === release.id &&
                  a.artifact === release.artifact &&
                  !["Draft", "Changes requested"].includes(a.status),
              );

              if (existing)
                return yield* Effect.fail(
                  conflict(
                    "This artifact already has an approval request. Open the existing request.",
                  ),
                );

              const revision = state.approvals.find(
                (a) =>
                  a.releaseId === release.id &&
                  a.artifact === release.artifact &&
                  ["Draft", "Changes requested"].includes(a.status),
              );

              const requestId = revision?.id ?? crypto.randomUUID();
              const status = c.kind === "approval-save" ? "Draft" : "Pending";

              if (revision) {
                yield* sql`UPDATE approvals SET title=${c.value.trim()},reason=${c.note.trim()},status=${status},attachments=${JSON.stringify(c.files)},version=version+1 WHERE id=${revision.id}`;
              } else {
                yield* sql`INSERT INTO approvals VALUES (${requestId},${release.id},${release.artifact},${c.value.trim()},${c.note.trim()},${status},'',${JSON.stringify(c.files)},1)`;
              }

              yield* sql`INSERT INTO workspace_events VALUES (${crypto.randomUUID()},${requestId},${status === "Draft" ? "Maya saved the request draft." : revision ? "Maya submitted the updated request for review." : "Maya submitted the request; Alex is assigned to review."},${new Date().toISOString()})`;
            } else if (c.kind === "approval-decide") {
              if (
                !approval ||
                approval.status !== "Pending" ||
                approval.version !== c.version
              )
                return yield* Effect.fail(
                  conflict(
                    "This approval changed. Refresh before reviewing it.",
                  ),
                );

              if (c.value !== "Approved" && c.value !== "Changes requested")
                return yield* Effect.fail(conflict("Choose a valid decision."));

              if (c.value === "Changes requested" && !c.note.trim())
                return yield* Effect.fail(
                  conflict("Explain what needs to change."),
                );
              yield* sql`UPDATE approvals SET status=${c.value},note=${c.note},version=version+1 WHERE id=${c.id}`;
              yield* sql`INSERT INTO workspace_events VALUES (${crypto.randomUUID()},${c.id},${c.value === "Approved" ? "Alex approved this exact artifact. " + c.note : "Alex requested changes: " + c.note},${new Date().toISOString()})`;
            } else if (c.kind === "deploy") {
              const approved = state.approvals.find(
                (a) =>
                  a.releaseId === release?.id &&
                  a.artifact === release?.artifact &&
                  a.status === "Approved",
              );

              if (
                !release ||
                release.stage !== "Staging ready" ||
                release.revision !== c.version ||
                !approved
              )
                return yield* Effect.fail(
                  conflict(
                    "Production deployment requires approval for this exact staged artifact.",
                  ),
                );
              yield* sql`UPDATE releases SET stage='Production',revision=revision+1 WHERE id=${release.id}`;
              yield* sql`UPDATE approvals SET status='Deployed',version=version+1 WHERE id=${approved.id}`;
              yield* sql`INSERT INTO workspace_events VALUES (${crypto.randomUUID()},${approved.id},'The approved artifact was deployed to production in the simulation.',${new Date().toISOString()})`;
              yield* sql`INSERT INTO posts VALUES (${crypto.randomUUID()},'Deploy agent',${release.version + " is now in production. Approved by the reviewer; deployed artifact " + release.artifact},${release.ticketIds[0] ?? ""},${release.id},${new Date().toISOString()},0,0,0)`;
            } else if (c.kind === "post") {
              if (!c.value.trim())
                return yield* Effect.fail(
                  conflict("Write an update before posting."),
                );
              yield* sql`INSERT INTO posts VALUES (${c.id},'You',${c.value.trim()},${c.related},${c.note},${new Date().toISOString()},0,0,0)`;
            } else if (c.kind === "reply") {
              if (
                !c.value.trim() ||
                !state.posts.some((p) => p.id === c.related)
              )
                return yield* Effect.fail(
                  conflict("Write a reply to an existing post."),
                );
              yield* sql`INSERT INTO replies VALUES (${c.id},${c.related},'You',${c.value.trim()},${new Date().toISOString()})`;
            } else if (
              ["post-save", "post-like", "post-hide"].includes(c.kind)
            ) {
              const post = state.posts.find((p) => p.id === c.id);

              if (!post) return yield* Effect.fail(conflict("Post not found."));

              if (c.kind === "post-save")
                yield* sql`UPDATE posts SET saved=${post.saved ? 0 : 1} WHERE id=${c.id}`;

              if (c.kind === "post-like")
                yield* sql`UPDATE posts SET liked=${post.liked ? 0 : 1} WHERE id=${c.id}`;

              if (c.kind === "post-hide")
                yield* sql`UPDATE posts SET hidden=${post.hidden ? 0 : 1} WHERE id=${c.id}`;
            } else if (c.kind === "notification-read") {
              yield* sql`UPDATE notifications SET read=1 WHERE id=${c.id}`;
            } else if (c.kind === "preference") {
              if (
                ![
                  "provider",
                  "model",
                  "effort",
                  "fast",
                  "email",
                  "mentions",
                  "openai",
                  "openrouter",
                ].includes(c.id)
              )
                return yield* Effect.fail(conflict("Unknown preference."));
              yield* sql`INSERT INTO preferences VALUES (${c.id},${c.value}) ON CONFLICT(key) DO UPDATE SET value=excluded.value`;
            }
          }),
        )
        .pipe(
          Effect.mapError((error) =>
            Schema.is(AppError)(error) ? error : storageError(),
          ),
        );

      return yield* snapshot();
    });

    return Workspace.of({ snapshot, mutate });
  }),
);
