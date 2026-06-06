import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: contacts } = await supabase.from("crm_contacts").select("*").eq("phone", "254635793186937");
  console.log("Contacts:", contacts);

  if (contacts && contacts.length > 0) {
    const { data: convs } = await supabase.from("crm_conversations").select("*").eq("contact_id", contacts[0].id).order("created_at", { ascending: true });
    console.log("Conversations:", convs);
  }
}

check();
