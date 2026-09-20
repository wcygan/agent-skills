import { AppShell } from "../app/app-shell";
import { ExampleNavigation } from "../app/example-navigation";
import { ProviderBanner } from "../app/provider-banner";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { getProviderMode } from "../server/functions/ai";
import stylesheet from "../styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Foundation · Application playground" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "stylesheet", href: stylesheet },
    ],
  }),
  loader: async () => {
    const result = await getProviderMode();

    if (!result.ok) throw new Error(`${result.message} Reference: ${result.requestId}`);

    return result.value;
  },
  component: Root,
  notFoundComponent: () => (
    <div className="panel p-8">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent">
        Return home
      </Link>
    </div>
  ),
});

function Root() {
  const mode = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppShell navigation={<ExampleNavigation />} banner={<ProviderBanner mode={mode} />}>
          <Outlet />
        </AppShell>
        <Scripts />
      </body>
    </html>
  );
}
