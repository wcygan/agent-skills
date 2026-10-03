import { Match } from "effect";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "../../app/workspace-provider";
import {
  Button,
  PageHeading,
  Status,
  Empty,
} from "../../components/workspace-ui";
import { command, type Release } from "../../shared/workspace";

function Pipeline({ release }: { release: Release }) {
  const items = [
    {
      title: "Pull request",
      detail: `Merged · ${release.commit}`,
      status: "Complete",
    },
    { title: "Version", detail: release.version, status: "Complete" },
    {
      title: "Artifact",
      detail:
        release.stage === "Failed"
          ? "Signature check failed"
          : "Generated and signed",
      status: release.stage === "Failed" ? "Failed" : "Complete",
    },
    {
      title: "Staging",
      detail: release.stage === "Failed" ? "Build required" : "Checks passed",
      status: release.stage === "Failed" ? "Waiting" : "Complete",
    },
    {
      title: "Production",
      detail:
        release.stage === "Production" ? "Published" : "Approval required",
      status: release.stage === "Production" ? "Complete" : "Waiting",
    },
  ];

  return (
    <ol className="pipeline">
      {items.map((item, index) => (
        <li key={item.title} className={item.status.toLowerCase()}>
          <span className="step-number">{index + 1}</span>
          <strong>{item.title}</strong>
          <small>{item.detail}</small>
          <Status>{item.status}</Status>
        </li>
      ))}
    </ol>
  );
}

export function DeploymentsPage({ selectedId }: { selectedId?: string }) {
  const { state, act, pending } = useWorkspace();

  const releases = selectedId
    ? state.releases.filter((r) => r.id === selectedId)
    : state.releases;

  return (
    <>
      <PageHeading
        title="Deployments"
        description="Applications, their release pipelines, and the path to production."
      />
      {selectedId ? (
        <Link className="back-link" to="/deployments">
          ← All applications
        </Link>
      ) : null}
      {!releases.length ? (
        <Empty title={selectedId ? "Release not found" : "No applications yet"}>
          <Link to="/">Return to overview</Link>
        </Empty>
      ) : null}
      {releases.map((r) => {
        const app = state.apps.find((a) => a.id === r.appId);

        const approval = state.approvals.find(
          (a) =>
            a.releaseId === r.id &&
            a.artifact === r.artifact &&
            a.status !== "Changes requested",
        );

        return (
          <section className="release-section" key={r.id}>
            <div className="section-heading">
              <div>
                <h2>
                  <Link to="/deployments" search={{ release: r.id }}>
                    {app?.name}
                  </Link>
                </h2>
                <p>
                  {app?.description} · {app?.domain}
                </p>
              </div>
              <Status>{r.stage}</Status>
            </div>
            <Pipeline release={r} />
            <div className="release-meta">
              <span>
                Artifact <code>{r.artifact}</code>
              </span>
              <span>
                Commit <code>{r.commit}</code>
              </span>
            </div>
            <div className="related-links">
              <Link
                className="button"
                to="/agent"
                search={{
                  context: `/deployments?release=${encodeURIComponent(r.id)}`,
                }}
              >
                Discuss with agent ↗
              </Link>
              {r.ticketIds.map((id) => (
                <Link key={id} to="/tickets" search={{ ticket: id }}>
                  {id}: {state.tickets.find((t) => t.id === id)?.title}
                </Link>
              ))}
            </div>
            <div className="release-actions">
              {Match.value(r.stage).pipe(
                Match.when("Failed", () => (
                  <>
                    <p>
                      The build failed signature verification. Retry simulates a
                      repaired artifact and successful staging.
                    </p>
                    <Button
                      disabled={pending}
                      onClick={() =>
                        void act(
                          command("release-retry", {
                            id: r.id,
                            version: r.revision,
                          }),
                          "Build retried. Artifact checks and staging passed in the simulation.",
                        )
                      }
                    >
                      Retry build
                    </Button>
                  </>
                )),
                Match.when("Production", () => (
                  <p>
                    This version is published to production in the local
                    simulation.
                  </p>
                )),
                Match.orElse(() => (
                  <>
                    <p>
                      {approval
                        ? `Production approval: ${approval.status}.`
                        : "Production is locked until a reviewer approves this artifact."}
                    </p>
                    {approval ? (
                      <Link to="/approvals" search={{ request: approval.id }}>
                        {approval.status === "Draft"
                          ? "Continue approval draft →"
                          : "View approval →"}
                      </Link>
                    ) : (
                      <Link
                        className="button"
                        to="/approvals"
                        search={{ release: r.id }}
                      >
                        Request production approval
                      </Link>
                    )}
                    <Button
                      className="primary"
                      disabled={pending || approval?.status !== "Approved"}
                      onClick={() =>
                        void act(
                          command("deploy", { id: r.id, version: r.revision }),
                          "Approved artifact deployed to production in the simulation.",
                        )
                      }
                    >
                      Deploy to production
                    </Button>
                  </>
                )),
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
