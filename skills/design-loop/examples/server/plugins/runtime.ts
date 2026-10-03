import { definePlugin } from "nitro";
import { runtime } from "../../src/server/runtime";

export default definePlugin(async (app) => {
  await runtime.context();
  app.hooks.hook("close", () => runtime.dispose());
});
