import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/decisions")({
  component: DecisionsLayout,
});

function DecisionsLayout() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/decisions" &&
        location.pathname !== "/decisions/" && (
          <Link
            to="/decisions"
            className="mb-6 inline-block text-sm text-accent"
          >
            ← All decision demos
          </Link>
        )}
      <Outlet />
    </>
  );
}
