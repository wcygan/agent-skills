import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { WorkspaceFeedback } from "../components/workspace-ui";
import { useWorkspace } from "./workspace-provider";

const links = [
  {
    to: "/",
    label: "Overview",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  {
    to: "/agent",
    label: "Agent",
    icon: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  },
  {
    to: "/tickets",
    label: "Tickets",
    icon: "M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6V4ZM13 7v2m0 3v1m0 3v1",
  },
  {
    to: "/deployments",
    label: "Deployments",
    icon: "m12 3 9 5v8l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5",
  },
  {
    to: "/approvals",
    label: "Approvals",
    icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 12l3 3 5-6",
  },
  {
    to: "/feed",
    label: "Team feed",
    icon: "M21 11a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4ZM8 9h8M8 13h5",
  },
] as const;

function HeaderIcon({ path }: { path: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const isAgent = useRouterState({
    select: (router) => router.location.pathname === "/agent",
  });

  const { state } = useWorkspace();
  const count = state.approvals.filter((a) => a.status === "Pending").length;

  return (
    <div className={isAgent ? "app-shell agent-shell" : "app-shell"}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">F</span>Forma
        </Link>
        <span className="team-name">Design team</span>
        <nav aria-label="Main navigation">
          <div className="nav-pages">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "active", "aria-current": "page" }}
              >
                <HeaderIcon path={link.icon} />
                {link.label}
                {link.to === "/approvals" && count > 0 ? (
                  <span className="badge">{count}</span>
                ) : null}
              </Link>
            ))}
          </div>
          <Link
            to="/settings"
            className="nav-settings"
            activeProps={{ className: "active", "aria-current": "page" }}
          >
            <HeaderIcon path="M9 2h6l.5 3 2 1.2 2.8-1 2 3.6-2.3 2.2v2l2.3 2.2-2 3.6-2.8-1-2 1.2-.5 3H9l-.5-3-2-1.2-2.8 1-2-3.6L4 14v-2L1.7 9.8l2-3.6 2.8 1L8.5 5 9 2ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            Settings
          </Link>
        </nav>
      </header>
      <div className="workspace-shell">
        <main id="main">
          <WorkspaceFeedback />
          {children}
        </main>
        {isAgent ? null : (
          <footer>
            <Link to="/about">About Forma</Link>
          </footer>
        )}
      </div>
    </div>
  );
}
