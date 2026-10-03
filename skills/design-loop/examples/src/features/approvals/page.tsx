import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useWorkspace } from "../../app/workspace-provider";
import {
  Button,
  PageHeading,
  Status,
  Empty,
} from "../../components/workspace-ui";
import { command, type Approval } from "../../shared/workspace";

function ApprovalDetail({
  approval,
  children,
}: {
  approval: Approval;
  children?: ReactNode;
}) {
  const { state } = useWorkspace();
  const release = state.releases.find((r) => r.id === approval.releaseId);

  return (
    <section className="panel form-panel">
      <div className="section-heading">
        <h2>{approval.title}</h2>
        <Status>{approval.status}</Status>
      </div>
      <dl className="summary-list">
        <div>
          <dt>Application</dt>
          <dd>{state.apps.find((a) => a.id === release?.appId)?.name}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{release?.version}</dd>
        </div>
        <div>
          <dt>Artifact</dt>
          <dd>
            <code>{approval.artifact}</code>
          </dd>
        </div>
        <div>
          <dt>Rollout plan</dt>
          <dd>{approval.reason}</dd>
        </div>
        <div>
          <dt>Attachments</dt>
          <dd>{approval.attachments.join(", ") || "None"}</dd>
        </div>
        <div>
          <dt>Reviewer</dt>
          <dd>Alex Rivera · simulated separate reviewer</dd>
        </div>
      </dl>
      {approval.note ? (
        <div className="callout">
          <strong>Reviewer note</strong>
          <p>{approval.note}</p>
        </div>
      ) : null}
      <div className="related-links">
        <Link
          className="button"
          to="/agent"
          search={{
            context: `/approvals?request=${encodeURIComponent(approval.id)}`,
          }}
        >
          Discuss with agent ↗
        </Link>
        <Link to="/deployments" search={{ release: approval.releaseId }}>
          Open deployment →
        </Link>
        {release?.ticketIds.map((id) => (
          <Link key={id} to="/tickets" search={{ ticket: id }}>
            {id}
          </Link>
        ))}
      </div>
      {["Draft", "Changes requested"].includes(approval.status) ? (
        <Link
          className="button"
          to="/approvals"
          search={{ release: approval.releaseId }}
        >
          {approval.status === "Draft"
            ? "Continue draft"
            : "Revise and resubmit"}
        </Link>
      ) : null}
      <h3 className="section-title">Request activity</h3>
      <ol className="timeline">
        {state.events.flatMap((event) =>
          event.entityId === approval.id
            ? [
                <li key={event.id}>
                  {event.body}
                  <small>
                    {new Date(event.created).toLocaleString("en-US", {
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </small>
                </li>,
              ]
            : [],
        )}
      </ol>
      {children}
    </section>
  );
}

function ApprovalDecision({ approval }: { approval: Approval }) {
  const { act, pending } = useWorkspace();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await act(
          command("approval-decide", {
            id: approval.id,
            version: approval.version,
            value: "Approved",
            note,
          }),
          "Artifact approved. The operator can now deploy it.",
        );
      }}
    >
      <label htmlFor="reviewer-note">Reviewer note</label>
      <textarea
        id="reviewer-note"
        maxLength={1000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Required when requesting changes"
        aria-describedby="reviewer-error"
      />
      {error ? (
        <p id="reviewer-error" className="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="actions">
        <Button
          disabled={pending}
          onClick={async () => {
            if (!note.trim()) {
              setError("Explain what needs to change.");

              return;
            }

            setError("");
            await act(
              command("approval-decide", {
                id: approval.id,
                version: approval.version,
                value: "Changes requested",
                note,
              }),
              "Changes requested. The operator can revise the rollout plan.",
            );
          }}
        >
          Request changes
        </Button>
        <Button type="submit" className="primary" disabled={pending}>
          Approve artifact
        </Button>
      </div>
    </form>
  );
}

function ApprovalForm({ releaseId }: { releaseId: string }) {
  const { state, act, pending } = useWorkspace();
  const navigate = useNavigate();
  const release = state.releases.find((r) => r.id === releaseId);

  const prior = state.approvals.find(
    (a) =>
      a.releaseId === releaseId &&
      ["Draft", "Changes requested"].includes(a.status),
  );

  const [title, setTitle] = useState(
    prior?.title || `Promote ${release?.version ?? "release"} to production`,
  );

  const [reason, setReason] = useState(
    prior?.reason ||
      "Staging checks passed. Monitor error rate after rollout; roll back to the previous version if errors increase.",
  );

  const [files, setFiles] = useState<string[]>([...(prior?.attachments ?? [])]);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");

  if (!release)
    return (
      <Empty title="Release not found">
        <Link to="/deployments">Choose a deployment</Link>
      </Empty>
    );

  return (
    <section className="panel form-panel">
      <div className="steps">
        <strong>{review ? "2. Review" : "1. Request details"}</strong>
        <span>→ Production approval</span>
      </div>
      {prior?.note ? (
        <p className="callout">Changes requested: {prior.note}</p>
      ) : null}
      {review ? (
        <>
          <dl className="summary-list">
            <div>
              <dt>Request</dt>
              <dd>{title}</dd>
            </div>
            <div>
              <dt>Rollout plan</dt>
              <dd>{reason}</dd>
            </div>
            <div>
              <dt>Artifact</dt>
              <dd>{release.artifact}</dd>
            </div>
            <div>
              <dt>Attachments</dt>
              <dd>{files.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt>Reviewer</dt>
              <dd>Alex Rivera</dd>
            </div>
          </dl>
          <p className="callout">
            Approval applies only to this artifact. Submitting does not deploy
            it.
          </p>
          <div className="actions">
            <Button onClick={() => setReview(false)}>Edit details</Button>
            <Button
              className="primary"
              disabled={pending}
              onClick={async () => {
                if (
                  await act(
                    command("approval-submit", {
                      id: release.id,
                      version: release.revision,
                      value: title,
                      note: reason,
                      files,
                    }),
                    "Request submitted for production approval.",
                  )
                )
                  await navigate({ to: "/approvals", search: {} });
              }}
            >
              Submit for approval
            </Button>
          </div>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!title.trim() || !reason.trim()) {
              setError("Enter a request title and rollout plan.");

              return;
            }

            setError("");
            setReview(true);
          }}
        >
          <label htmlFor="approval-title">Request title</label>
          <input
            id="approval-title"
            value={title}
            maxLength={120}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="rollout-plan">Rollout and rollback plan</label>
          <textarea
            id="rollout-plan"
            value={reason}
            maxLength={2000}
            required
            onChange={(e) => setReason(e.target.value)}
          />
          <label htmlFor="approval-files">Supporting files (optional)</label>
          <input
            id="approval-files"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={(e) => {
              const incoming = [...(e.target.files ?? [])];

              if (
                incoming.length + files.length > 3 ||
                incoming.some(
                  (f) =>
                    f.size > 5 * 1024 * 1024 ||
                    !/\.(pdf|png|jpe?g|txt)$/i.test(f.name),
                )
              ) {
                setError(
                  "Use up to three PDF, PNG, JPG, or TXT files, 5 MB each.",
                );
              } else {
                setError("");
                setFiles((current) => [
                  ...new Set([...current, ...incoming.map((f) => f.name)]),
                ]);
              }

              e.target.value = "";
            }}
          />
          <p className="help">
            Metadata only: contents are not read or uploaded. Up to 3 files, 5
            MB each.
          </p>
          <Button
            onClick={() =>
              setFiles((current) =>
                current.includes("rollout-checklist.txt")
                  ? current
                  : [...current.slice(0, 2), "rollout-checklist.txt"],
              )
            }
          >
            Add sample checklist
          </Button>
          {files.map((file) => (
            <div key={file} className="attachment">
              {file}
              <Button
                onClick={() =>
                  setFiles((current) => current.filter((f) => f !== file))
                }
                aria-label={`Remove ${file}`}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="callout">
            {state.apps.find((a) => a.id === release.appId)?.name} ·{" "}
            {release.version}
            <br />
            <code>{release.artifact}</code>
            <br />
            Requester: Maya Chen · Reviewer: Alex Rivera
          </div>
          {error ? (
            <p role="alert" className="error">
              {error}
            </p>
          ) : null}
          <div className="actions">
            <Button
              disabled={pending}
              onClick={async () => {
                if (!title.trim() || !reason.trim()) {
                  setError("Enter a title and rollout plan before saving.");

                  return;
                }

                if (
                  await act(
                    command("approval-save", {
                      id: release.id,
                      version: release.revision,
                      value: title,
                      note: reason,
                      files,
                    }),
                    "Draft saved. Nothing has been submitted.",
                  )
                )
                  await navigate({ to: "/approvals", search: {} });
              }}
            >
              Save draft
            </Button>
            <Link
              className="button"
              to="/deployments"
              search={{ release: release.id }}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              className="primary"
              disabled={release.stage !== "Staging ready"}
            >
              Review request
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

export function ApprovalsPage({
  requestId,
  releaseId,
}: {
  requestId?: string;
  releaseId?: string;
}) {
  const { state } = useWorkspace();
  const [role, setRole] = useState("Operator");
  const approval = state.approvals.find((a) => a.id === requestId);

  return (
    <>
      <PageHeading
        title="Production approvals"
        description="Review the staged artifact and rollout plan before production."
        actions={
          <div>
            <label htmlFor="demo-role" className="sr-only">
              Demo role
            </label>
            <select
              id="demo-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Operator</option>
              <option>Reviewer</option>
            </select>
          </div>
        }
      />
      <p className="help">
        Demo role:{" "}
        {role === "Operator" ? "Maya Chen, requester" : "Alex Rivera, reviewer"}
        . Roles are simulated; this local app has no authentication.
      </p>
      {releaseId ? (
        <ApprovalForm key={releaseId} releaseId={releaseId} />
      ) : requestId ? (
        approval ? (
          <ApprovalDetail key={approval.id} approval={approval}>
            {approval.status === "Pending" ? (
              role === "Reviewer" ? (
                <ApprovalDecision approval={approval} />
              ) : (
                <p className="callout">
                  Waiting for Alex Rivera. Switch to the reviewer demo to review
                  this request.
                </p>
              )
            ) : null}
          </ApprovalDetail>
        ) : (
          <Empty title="Approval not found">
            <Link to="/approvals">All approvals</Link>
          </Empty>
        )
      ) : (
        <>
          {state.approvals.length ? (
            state.approvals.map((a) => (
              <Link
                key={a.id}
                to="/approvals"
                search={{ request: a.id }}
                className="attention-row"
              >
                <div>
                  <strong>{a.title}</strong>
                  <p>
                    {state.releases.find((r) => r.id === a.releaseId)?.version}{" "}
                    · {a.artifact}
                  </p>
                </div>
                <Status>{a.status}</Status>
              </Link>
            ))
          ) : (
            <Empty title="No approval requests">
              <p>Open a staged deployment to request production approval.</p>
              <Link className="button" to="/deployments">
                View deployments
              </Link>
            </Empty>
          )}
        </>
      )}
    </>
  );
}
