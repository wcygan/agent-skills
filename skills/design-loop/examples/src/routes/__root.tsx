import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AppShell } from "../app/app-shell";
import { WorkspaceProvider } from "../app/workspace-provider";
import { getWorkspace } from "../server/functions/workspace";
import stylesheet from "../styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Forma · Ship software together" },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
      { rel: "icon", href: "/favicon.svg" },
    ],
  }),
  loader: async () => {
    const result = await getWorkspace();

    if (!result.ok) throw new Error(result.message);

    return result.value;
  },
  component: Root,
  notFoundComponent: () => (
    <div className="empty">
      <h1>Page not found</h1>
      <Link to="/">Return to overview</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="empty">
      <h1>Couldn’t load Forma</h1>
      <p>
        {error instanceof Error ? error.message : "Please retry the request."}
      </p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  ),
});

function Root() {
  const state = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <WorkspaceProvider initial={state}>
          <AppShell>
            <Outlet />
          </AppShell>
        </WorkspaceProvider>
        <Scripts />
      </body>
    </html>
  );
}
