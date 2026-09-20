import { CollectionsLive } from "./collections/service";
import { Config, Layer, References, Schema } from "effect";
import { PiLive } from "./adapters/pi";
import { OpenRouterDecisionsLive } from "./adapters/openrouter-decisions";
import { ProviderMocksLive } from "./mocks/openrouter";
import { ConfigLive } from "./config";

import { DatabaseLive } from "./storage/database";

export const ServicesLive = Layer.mergeAll(PiLive, OpenRouterDecisionsLive, CollectionsLive).pipe(
  Layer.provide(ProviderMocksLive),
  Layer.provideMerge(ConfigLive),
);

const LoggingLive = Layer.effect(
  References.MinimumLogLevel,
  Config.schema(Schema.Literals(["Debug", "Info", "Warn", "Error", "None"]), "LOG_LEVEL").pipe(
    Config.withDefault("Info"),
  ),
);

export const AppLive = ServicesLive.pipe(
  Layer.provide(DatabaseLive),
  Layer.provideMerge(LoggingLive),
);
