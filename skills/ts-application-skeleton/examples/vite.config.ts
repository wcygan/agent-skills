import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Portless supplies PORT; Vite does not read it automatically.
  server: {
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
