import { Schema } from "effect";

export const Ticket = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  status: Schema.Literals(["Todo", "In progress", "Done", "Archived"]),
  owner: Schema.String,
  appId: Schema.String,
  version: Schema.Number,
});

export type Ticket = typeof Ticket.Type;

export const Application = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  description: Schema.String,
  domain: Schema.String,
});

export const Release = Schema.Struct({
  id: Schema.String,
  appId: Schema.String,
  version: Schema.String,
  commit: Schema.String,
  artifact: Schema.String,
  stage: Schema.Literals(["Failed", "Staging ready", "Production"]),
  ticketIds: Schema.Array(Schema.String),
  revision: Schema.Number,
});

export type Release = typeof Release.Type;

export const Approval = Schema.Struct({
  id: Schema.String,
  releaseId: Schema.String,
  artifact: Schema.String,
  title: Schema.String,
  reason: Schema.String,
  status: Schema.Literals([
    "Draft",
    "Pending",
    "Changes requested",
    "Approved",
    "Deployed",
  ]),
  note: Schema.String,
  attachments: Schema.Array(Schema.String),
  version: Schema.Number,
});

export type Approval = typeof Approval.Type;

export const Post = Schema.Struct({
  id: Schema.String,
  author: Schema.String,
  body: Schema.String,
  ticketId: Schema.String,
  releaseId: Schema.String,
  created: Schema.String,
  saved: Schema.Number,
  liked: Schema.Number,
  hidden: Schema.Number,
});

export type Post = typeof Post.Type;

export const Reply = Schema.Struct({
  id: Schema.String,
  postId: Schema.String,
  author: Schema.String,
  body: Schema.String,
  created: Schema.String,
});

export const Notification = Schema.Struct({
  id: Schema.String,
  postId: Schema.String,
  body: Schema.String,
  read: Schema.Number,
});

export const Preference = Schema.Struct({
  key: Schema.String,
  value: Schema.String,
});

export const WorkspaceEvent = Schema.Struct({
  id: Schema.String,
  entityId: Schema.String,
  body: Schema.String,
  created: Schema.String,
});

export const Snapshot = Schema.Struct({
  tickets: Schema.Array(Ticket),
  apps: Schema.Array(Application),
  releases: Schema.Array(Release),
  approvals: Schema.Array(Approval),
  posts: Schema.Array(Post),
  replies: Schema.Array(Reply),
  notifications: Schema.Array(Notification),
  preferences: Schema.Array(Preference),
  events: Schema.Array(WorkspaceEvent),
});

export type Snapshot = typeof Snapshot.Type;

export const Command = Schema.Struct({
  kind: Schema.Literals([
    "seed",
    "ticket-create",
    "ticket-update",
    "ticket-archive",
    "release-retry",
    "approval-submit",
    "approval-save",
    "approval-decide",
    "deploy",
    "post",
    "reply",
    "post-save",
    "post-like",
    "post-hide",
    "notification-read",
    "preference",
  ]),
  id: Schema.String.check(Schema.isMaxLength(100)),
  value: Schema.String.check(Schema.isMaxLength(4000)),
  related: Schema.String.check(Schema.isMaxLength(100)),
  note: Schema.String.check(Schema.isMaxLength(4000)),
  version: Schema.Number.check(
    Schema.isInt(),
    Schema.isGreaterThanOrEqualTo(0),
  ),
  files: Schema.Array(Schema.String.check(Schema.isMaxLength(255))),
});

export type Command = typeof Command.Type;

export function command(
  kind: Command["kind"],
  fields: Partial<Omit<Command, "kind">> = {},
): Command {
  return {
    kind,
    id: "",
    value: "",
    related: "",
    note: "",
    version: 0,
    files: [],
    ...fields,
  };
}

export const AgentInput = Schema.Struct({
  text: Schema.Trim.check(Schema.isMinLength(1), Schema.isMaxLength(4000)),
  page: Schema.String.check(Schema.isMaxLength(100)),
});

export const AgentResult = Schema.Struct({
  text: Schema.String,
  mode: Schema.Literals(["mock", "live"]),
  sources: Schema.Array(
    Schema.Struct({ path: Schema.String, title: Schema.String }),
  ),
});
