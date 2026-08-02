import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Testid on puhtad funktsioonid (model.ts, checker) – DOM-i pole vaja.
    // Kui kunagi on vaja komponenditeste, lisame jsdom-i eraldi otsusega.
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
  },
});
