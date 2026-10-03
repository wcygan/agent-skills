import type { ReactNode, ComponentProps } from "react";
import { useWorkspace } from "../app/workspace-provider";

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function Button({ className = "", ...props }: ComponentProps<"button">) {
  return <button type="button" className={`button ${className}`} {...props} />;
}

export function Status({ children }: { children: string }) {
  const tones = new Map<string, string>(
    Object.entries({
      Done: "complete",
      Approved: "complete",
      Deployed: "complete",
      Production: "complete",
      "Staging ready": "complete",
      Failed: "failed",
      "Changes requested": "failed",
      Pending: "waiting",
      "In progress": "waiting",
      Waiting: "waiting",
      Complete: "complete",
    }),
  );

  return (
    <span className={`status ${tones.get(children) ?? "neutral"}`}>
      <span aria-hidden="true" className="status-dot" />
      {children}
    </span>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function WorkspaceFeedback() {
  const { feedback, error, pending, retry, refresh } = useWorkspace();

  return (
    <div className="feedback">
      <output aria-live="polite" className={error ? "error" : ""}>
        {pending ? "Saving…" : feedback}
      </output>
      {error ? (
        <>
          <Button onClick={() => void retry()} disabled={pending}>
            Retry
          </Button>
          <Button onClick={() => void refresh()}>Refresh data</Button>
        </>
      ) : null}
    </div>
  );
}
