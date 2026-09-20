import { Link, useRouter } from "@tanstack/react-router";

export function RoutePending() {
  return <output className="panel p-8">Loading…</output>;
}

export function RouteFailure() {
  const router = useRouter();

  return (
    <section className="panel p-8">
      <h1 className="text-xl font-semibold">Could not load this page</h1>
      <p className="mt-3 text-slate-500">Check that the application is running, then try again.</p>
      <button className="primary-button mt-5" onClick={() => router.invalidate()}>
        Try again
      </button>
    </section>
  );
}

export function RouteMissing() {
  return (
    <section className="panel p-8">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent">
        Back to overview
      </Link>
    </section>
  );
}
