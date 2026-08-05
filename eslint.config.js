import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // supabase/functions on Deno-kood (npm: importid, `Deno` globaal) – seda
  // kontrollib Supabase CLI deploy'mise ajal, mitte brauseri ESLint.
  // NB! See tähendab, et roheline `npm run lint` EI ütle Edge Functionite
  // kohta midagi. Nende kontroll = deploy + curl-test, vt
  // supabase/functions/README.md „Teadaolev auk".
  { ignores: ["dist", "node_modules", "supabase/functions"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
);
