import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Direct network access for local and Tailscale inspection.
  server: {
    host: process.env.HOST ?? "0.0.0.0",
    port: Number(process.env.PORT ?? 5173),
    strictPort: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({ preset: "bun", plugins: ["./server/plugins/runtime.ts"] }),
    react(),
  ],
});
