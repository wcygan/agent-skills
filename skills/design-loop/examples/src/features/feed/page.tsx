import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "../../app/workspace-provider";
import { Button, PageHeading, Empty } from "../../components/workspace-ui";
import { command, type Post } from "../../shared/workspace";

function PostItem({
  post,
  openConversation,
}: {
  post: Post;
  openConversation: boolean;
}) {
  const { state, act, pending } = useWorkspace();
  const [expanded, setExpanded] = useState(openConversation);
  const [draft, setDraft] = useState("");
  const replies = state.replies.filter((r) => r.postId === post.id);

  return (
    <article className="post">
      <div className="post-header">
        <span className="avatar" aria-hidden="true">
          {post.author
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </span>
        <div>
          <h2>{post.author}</h2>
          <small>
            {new Date(post.created).toLocaleString("en-US", {
              timeZone: "UTC",
            })}{" "}
            UTC
          </small>
        </div>
        <details className="post-menu">
          <summary aria-label={`Actions for ${post.author}'s update`}>
            ⋯
          </summary>
          <div className="menu">
            <Button
              disabled={pending}
              onClick={() =>
                void act(
                  command("post-save", { id: post.id }),
                  "Saved state updated.",
                )
              }
            >
              {post.saved ? "Remove from saved" : "Save update"}
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                void act(
                  command("post-hide", { id: post.id }),
                  "Post hidden. Use Show hidden to restore it.",
                )
              }
            >
              Hide update
            </Button>
          </div>
        </details>
      </div>
      <p className="post-body">{post.body}</p>
      <div className="related-links">
        {post.ticketId ? (
          <Link to="/tickets" search={{ ticket: post.ticketId }}>
            {post.ticketId}
          </Link>
        ) : null}
        {post.releaseId ? (
          <Link to="/deployments" search={{ release: post.releaseId }}>
            Related deployment
          </Link>
        ) : null}
      </div>
      <div className="actions">
        <Button
          disabled={pending}
          aria-pressed={Boolean(post.liked)}
          onClick={() =>
            void act(command("post-like", { id: post.id }), "Like updated.")
          }
        >
          {post.liked ? "Liked" : "Like"}
        </Button>
        <Button
          aria-expanded={expanded}
          aria-controls={`replies-${post.id}`}
          onClick={() => setExpanded((value) => !value)}
        >
          Reply · {replies.length}
        </Button>
        {post.saved ? <span className="help">Saved</span> : null}
      </div>
      <div hidden={!expanded} className="replies" id={`replies-${post.id}`}>
        {replies.map((r) => (
          <div className="reply" key={r.id}>
            <strong>{r.author}</strong>
            <p>{r.body}</p>
          </div>
        ))}
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (
              await act(
                command("reply", {
                  id: crypto.randomUUID(),
                  related: post.id,
                  value: draft,
                }),
                "Reply posted.",
              )
            )
              setDraft("");
          }}
        >
          <label htmlFor={`reply-${post.id}`}>Reply to {post.author}</label>
          <textarea
            id={`reply-${post.id}`}
            value={draft}
            maxLength={1200}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="actions">
            <span className="help">Visible to Design team</span>
            <Button
              type="submit"
              className="primary"
              disabled={pending || !draft.trim()}
            >
              Post reply
            </Button>
          </div>
        </form>
      </div>
    </article>
  );
}

export function FeedPage() {
  const { state, act, pending } = useWorkspace();
  const [view, setView] = useState("Feed");
  const [draft, setDraft] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [releaseId, setReleaseId] = useState("");
  const [hidden, setHidden] = useState(false);
  const [conversation, setConversation] = useState("");

  const posts = state.posts.filter((p) =>
    hidden
      ? Boolean(p.hidden)
      : !p.hidden && (view !== "Saved" || Boolean(p.saved)),
  );

  return (
    <>
      <PageHeading
        title="Team feed"
        description="Current goals, progress, and the conversations behind the work."
      />
      <fieldset className="tabs">
        <legend className="sr-only">Feed views</legend>
        {["Feed", "Saved", "Notifications"].map((v) => (
          <Button
            key={v}
            aria-pressed={v === view}
            onClick={() => {
              setView(v);
              setHidden(false);
            }}
          >
            {v}
            {v === "Notifications"
              ? ` · ${state.notifications.filter((n) => !n.read).length}`
              : ""}
          </Button>
        ))}
      </fieldset>
      {view === "Notifications" ? (
        state.notifications.map((n) => (
          <div
            className={`attention-row ${!n.read ? "unread" : ""}`}
            key={n.id}
          >
            <div>
              <strong>{n.body}</strong>
              <p>{n.read ? "Read" : "Unread"}</p>
            </div>
            <Button
              disabled={pending}
              onClick={async () => {
                if (
                  await act(
                    command("notification-read", { id: n.id }),
                    "Notification marked as read.",
                  )
                ) {
                  setConversation(n.postId);
                  setView("Feed");
                }
              }}
            >
              View conversation
            </Button>
          </div>
        ))
      ) : (
        <>
          <form
            className="panel composer"
            onSubmit={async (e) => {
              e.preventDefault();

              if (
                await act(
                  command("post", {
                    id: crypto.randomUUID(),
                    value: draft,
                    related: ticketId,
                    note: releaseId,
                  }),
                  "Team update posted.",
                )
              )
                setDraft("");
            }}
          >
            <label htmlFor="post-draft">Share a goal or progress update</label>
            <textarea
              id="post-draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2400}
              placeholder="What are we working toward, and what changed?"
            />
            <div className="composer-links">
              <label htmlFor="post-ticket">Related ticket</label>
              <select
                id="post-ticket"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
              >
                <option value="">None</option>
                {state.tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}
                  </option>
                ))}
              </select>
              <label htmlFor="post-release">Deployment</label>
              <select
                id="post-release"
                value={releaseId}
                onChange={(e) => setReleaseId(e.target.value)}
              >
                <option value="">None</option>
                {state.releases.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.version} · {r.appId}
                  </option>
                ))}
              </select>
            </div>
            <div className="actions">
              <span className="help">Visible to Design team</span>
              <Button
                type="submit"
                className="primary"
                disabled={pending || !draft.trim()}
              >
                Post update
              </Button>
            </div>
          </form>
          <Button onClick={() => setHidden((value) => !value)}>
            {hidden ? "Back to feed" : "Show hidden"}
          </Button>
          {!posts.length ? (
            <Empty
              title={hidden ? "No hidden updates" : "No updates in this view"}
            />
          ) : (
            posts.map((p) =>
              hidden ? (
                <div className="attention-row" key={p.id}>
                  <p>{p.body}</p>
                  <Button
                    disabled={pending}
                    onClick={() =>
                      void act(
                        command("post-hide", { id: p.id }),
                        "Post restored.",
                      )
                    }
                  >
                    Restore update
                  </Button>
                </div>
              ) : (
                <PostItem
                  key={p.id}
                  post={p}
                  openConversation={p.id === conversation}
                />
              ),
            )
          )}
        </>
      )}
    </>
  );
}
