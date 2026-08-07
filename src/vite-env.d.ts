/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Seire ja statistika on vabatahtlikud: ilma nendeta rakendus töötab,
  // lihtsalt ei teata endast midagi. Seepärast `?`.
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_CF_ANALYTICS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
