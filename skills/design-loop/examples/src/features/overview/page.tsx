import { Link } from "@tanstack/react-router";
import { useWorkspace } from "../../app/workspace-provider";
import { command } from "../../shared/workspace";
import {
  PageHeading,
  Button,
  Empty,
  Status,
} from "../../components/workspace-ui";

export function OverviewPage() {
  const { state, act, pending } = useWorkspace();
  const waiting = state.approvals.filter((a) => a.status === "Pending");
  const failed = state.releases.filter((r) => r.stage === "Failed");
  const progress = state.tickets.filter((t) => t.status === "In progress");

  return (
    <>
      <PageHeading
        title="Ship software together"
        description="A clear view of goals, active work, and what is ready to deploy."
      />
      {state.apps.length === 0 ? (
        <Empty title="Start your workspace">
          <p>
            Load the connected sample applications, roadmap, and team goals.
          </p>
          <Button
            className="primary"
            disabled={pending}
            onClick={() =>
              void act(command("seed"), "Sample workspace loaded.")
            }
          >
            Load sample workspace
          </Button>
        </Empty>
      ) : (
        <>
          <div className="metrics">
            <Link to="/deployments">
              <span>Applications</span>
              <strong>{state.apps.length}</strong>
              <small>
                {failed.length} failed build{failed.length === 1 ? "" : "s"}
              </small>
            </Link>
            <Link to="/tickets">
              <span>Work in progress</span>
              <strong>{progress.length}</strong>
              <small>From the roadmap</small>
            </Link>
            <Link to="/approvals">
              <span>Needs approval</span>
              <strong>{waiting.length}</strong>
              <small>Before production</small>
            </Link>
          </div>
          <section className="section">
            <h2>Needs attention</h2>
            {failed.map((r) => (
              <Link
                key={r.id}
                to="/deployments"
                search={{ release: r.id }}
                className="attention-row"
              >
                <div>
                  <strong>
                    {state.apps.find((a) => a.id === r.appId)?.name}: artifact
                    build failed
                  </strong>
                  <p>Repair the build before staging and production.</p>
                </div>
                <Status>Failed</Status>
              </Link>
            ))}
            {waiting.map((a) => (
              <Link
                key={a.id}
                to="/approvals"
                search={{ request: a.id }}
                className="attention-row"
              >
                <div>
                  <strong>{a.title}</strong>
                  <p>Review the exact artifact and rollout plan.</p>
                </div>
                <Status>Pending</Status>
              </Link>
            ))}
            {state.releases.flatMap((r) =>
              r.stage === "Staging ready" &&
              !state.approvals.some(
                (a) => a.releaseId === r.id && a.status !== "Changes requested",
              )
                ? [
                    <Link
                      key={r.id}
                      to="/deployments"
                      search={{ release: r.id }}
                      className="attention-row"
                    >
                      <div>
                        <strong>
                          {state.apps.find((a) => a.id === r.appId)?.name} is
                          ready in staging
                        </strong>
                        <p>
                          Request approval when the related tickets are ready.
                        </p>
                      </div>
                      <Status>Waiting</Status>
                    </Link>,
                  ]
                : [],
            )}
          </section>
          <section className="section">
            <div className="section-heading">
              <h2>Current goals</h2>
              <Link to="/feed">Open team feed →</Link>
            </div>
            {state.posts.slice(0, 3).map((p) => (
              <div className="goal" key={p.id}>
                <strong>{p.author}</strong>
                <p>{p.body}</p>
                <div className="related-links">
                  {p.ticketId ? (
                    <Link to="/tickets" search={{ ticket: p.ticketId }}>
                      {p.ticketId}
                    </Link>
                  ) : null}
                  {p.releaseId ? (
                    <Link to="/deployments" search={{ release: p.releaseId }}>
                      Related release
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
