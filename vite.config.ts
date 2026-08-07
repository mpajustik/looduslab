import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Sentry lülitab need lipud silumiskoodi ja jõudlusmõõtmise ümber.
    // Kumbagi me ei kasuta (vt src/lib/seire.ts) – `false` lubab need
    // osad buildist välja visata ja hoiab seirepaki poole väiksemana.
    __SENTRY_DEBUG__: false,
    __SENTRY_TRACING__: false,
  },
  test: {
    // Testid on puhtad funktsioonid (model.ts, checker) – DOM-i pole vaja.
    // Kui kunagi on vaja komponenditeste, lisame jsdom-i eraldi otsusega.
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
  },
});
