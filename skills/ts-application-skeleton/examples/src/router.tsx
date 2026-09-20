import { RouteFailure, RouteMissing, RoutePending } from "./components/route-feedback";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPendingComponent: RoutePending,
    defaultErrorComponent: RouteFailure,
    defaultNotFoundComponent: RouteMissing,
  });
}
