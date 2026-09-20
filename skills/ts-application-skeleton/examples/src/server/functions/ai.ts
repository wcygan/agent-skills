import { DemoInput, DemoResult } from "../../shared/decision-demos";
import { runDemo } from "../decisions/demos";
import { createServerFn } from "@tanstack/react-start";
import { Effect, Schema } from "effect";
import { Prompt, AgentAnswer, Assessment, ProviderMode } from "../../shared/contracts";
import { AgentRunner } from "../adapters/pi";
import { assessTicket } from "../decisions/ticket";
import { AppConfig } from "../config";
import { runServerEffect } from "../start-bridge.server";

export const askAgent = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(Prompt))
  .handler(({ data }) =>
    runServerEffect(
      "Agent.ask",
      AgentAnswer,
      Effect.flatMap(AgentRunner, (agent) => agent.run(data.text)),
    ),
  );

export const evaluateTicket = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(Prompt))
  .handler(({ data }) => runServerEffect("Ticket.evaluate", Assessment, assessTicket(data)));

export const getProviderMode = createServerFn({ method: "GET" }).handler(() =>
  runServerEffect(
    "Provider.mode",
    ProviderMode,
    Effect.map(AppConfig, (config) => config.mode),
  ),
);

export const evaluateDemo = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(DemoInput))
  .handler(({ data }) => runServerEffect("Decisions.demo", DemoResult, runDemo(data)));
