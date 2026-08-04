import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "VITE_SUPABASE_URL ja VITE_SUPABASE_ANON_KEY peavad .env.local failis olema.",
  );
}

export const supabase = createClient(url, anonKey);
