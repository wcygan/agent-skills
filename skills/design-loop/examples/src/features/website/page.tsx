import { Link } from "@tanstack/react-router";
import { PageHeading } from "../../components/workspace-ui";

export function WebsitePage() {
  return (
    <>
      <PageHeading
        title="A clear path from goal to production."
        description="Forma brings your team and agents together around the software you ship."
      />
      <div className="public-hero">
        <div>
          <h2>
            Understand the work. Approve the release. Ship with confidence.
          </h2>
          <p>
            Connect goals, roadmap tickets, artifacts, staging checks, and
            production approvals in one workspace.
          </p>
          <Link className="button primary" to="/">
            Open workspace
          </Link>
        </div>
        <div className="panel public-preview">
          <h3>One connected release</h3>
          <ol>
            <li>Team goal → roadmap tickets</li>
            <li>Merged PR → version → artifact</li>
            <li>Staging checks → reviewer approval</li>
            <li>Production deployment → progress update</li>
          </ol>
        </div>
      </div>
      <section className="section">
        <h2>Keep the next step clear</h2>
        <div className="feature-grid">
          <div>
            <h3>Follow the roadmap</h3>
            <p>Find tickets and trace the application they affect.</p>
          </div>
          <div>
            <h3>See the deployment</h3>
            <p>Read each stage and its current outcome.</p>
          </div>
          <div>
            <h3>Ask for context</h3>
            <p>A read-only agent explains related work and blockers.</p>
          </div>
        </div>
      </section>
      <section className="section">
        <h2>Simple illustrative plans</h2>
        <p className="help">
          Concept pricing only. No subscription or payment is created.
        </p>
        <div className="pricing-grid">
          <div className="panel">
            <h3>Local</h3>
            <strong>$0</strong>
            <p>One local workspace and sample workflows.</p>
            <Link className="button" to="/">
              Try the workspace
            </Link>
          </div>
          <div className="panel">
            <h3>Team</h3>
            <strong>
              $12 <small>/ person / month</small>
            </strong>
            <p>Illustrative plan for shared roles and workflows.</p>
            <Link className="button" to="/">
              Explore the demo
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <h2>Know what happens</h2>
        <p>
          Records persist in local SQLite. Approvals are enforced against the
          exact staged artifact. Deployment and roles are simulated; no
          infrastructure is changed.
        </p>
        <details>
          <summary>Does this deploy real software?</summary>
          <p>
            No. The scaffold models the workflow. Real authentication, CI,
            artifact storage, and deployment adapters are future integrations.
          </p>
        </details>
        <details>
          <summary>Does the agent make paid model calls?</summary>
          <p>
            Mock mode uses deterministic workspace analysis. Live mode is an
            explicit server configuration with your OpenRouter key.
          </p>
        </details>
      </section>
    </>
  );
}
