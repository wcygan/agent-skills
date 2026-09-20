import { Link } from "@tanstack/react-router";
import { examples } from "./examples";

const navigation = [{ to: "/", label: "Overview" }, ...examples] as const;

export function ExampleNavigation() {
  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-1">
      {navigation.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to !== "/collections" }}
          className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          activeProps={{ className: "bg-blue-50 text-accent font-semibold" }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
