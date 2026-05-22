import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Faltan las variables de entorno de Supabase en .env.local");
}

// Cliente seguro que se ejecuta en el servidor usando la service role key.
// Esto permite interactuar con la DB con privilegios administrativos (bypass RLS).
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});
