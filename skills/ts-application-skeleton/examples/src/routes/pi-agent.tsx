import { createFileRoute } from "@tanstack/react-router";
import { AgentPage } from "../features/pi-agent/page";

export const Route = createFileRoute("/pi-agent")({ component: AgentPage });
