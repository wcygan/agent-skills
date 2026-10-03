import { type ReactNode, useEffect, useRef, useState } from "react";
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

function NavigationLinks({ count, onNavigate }: { count: number; onNavigate?: () => void }) {
  return (
    <>
      <div className="nav-pages">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.to === "/" }}
            activeProps={{ className: "active", "aria-current": "page" }}
            onClick={onNavigate}
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
        onClick={onNavigate}
      >
        <HeaderIcon path="M9 2h6l.5 3 2 1.2 2.8-1 2 3.6-2.3 2.2v2l2.3 2.2-2 3.6-2.8-1-2 1.2-.5 3H9l-.5-3-2-1.2-2.8 1-2-3.6L4 14v-2L1.7 9.8l2-3.6 2.8 1L8.5 5 9 2ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        Settings
      </Link>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const dialog = menu.current;

    if (!dialog) return;

    if (!menuOpen) {
      dialog.close();

      return;
    }

    dialog.showModal();
    closeButton.current?.focus();

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 760px)");

    const onResize = () => {
      if (!mobile.matches) setMenuOpen(false);
    };

    mobile.addEventListener("change", onResize);

    return () => mobile.removeEventListener("change", onResize);
  }, []);

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
        <nav className="desktop-navigation" aria-label="Main navigation">
          <NavigationLinks count={count} />
        </nav>
        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(true)}
        >
          <HeaderIcon path="M4 6h16M4 12h16M4 18h16" />
        </button>
      </header>
      <dialog
        ref={menu}
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Main menu"
        onClose={() => setMenuOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;

          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href], button:not([tabindex='-1'])",
          );

          const first = controls[0];
          const last = controls[controls.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <button
          type="button"
          className="mobile-nav-scrim"
          aria-label="Dismiss navigation"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
        <div className="mobile-nav-panel">
          <div className="mobile-nav-header">
            <div>
              <span className="brand"><span className="brand-mark">F</span>Forma</span>
              <p>Design team</p>
            </div>
            <button
              ref={closeButton}
              type="button"
              className="mobile-nav-close"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <HeaderIcon path="m6 6 12 12M6 18 18 6" />
            </button>
          </div>
          <nav aria-label="Main navigation">
            <NavigationLinks count={count} onNavigate={() => setMenuOpen(false)} />
          </nav>
        </div>
      </dialog>
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
