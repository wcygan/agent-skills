import { WorkspaceLive } from "./workspace/service";
import { Config, Layer, References, Schema } from "effect";
import { PiLive } from "./adapters/pi";
import { ProviderMocksLive } from "./mocks/openrouter";
import { ConfigLive } from "./config";

import { DatabaseLive } from "./storage/database";

export const ServicesLive = Layer.mergeAll(PiLive, WorkspaceLive).pipe(
  Layer.provide(ProviderMocksLive),
  Layer.provideMerge(ConfigLive),
);

const LoggingLive = Layer.effect(
  References.MinimumLogLevel,
  Config.schema(
    Schema.Literals(["Debug", "Info", "Warn", "Error", "None"]),
    "LOG_LEVEL",
  ).pipe(Config.withDefault("Info")),
);

export const AppLive = ServicesLive.pipe(
  Layer.provide(DatabaseLive),
  Layer.provideMerge(LoggingLive),
);
