import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "חסרים VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY. ראו README.md (משתני סביבה)."
  );
}

export const supabase = createClient(url, anonKey);
