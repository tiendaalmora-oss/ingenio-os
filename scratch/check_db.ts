import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: contacts } = await supabase.from("crm_contacts").select("*").order("updated_at", { ascending: false }).limit(2);
  console.log("Last Contacts:");
  console.dir(contacts, { depth: null });

  if (contacts && contacts.length > 0) {
    const { data: convs } = await supabase.from("crm_conversations").select("*").eq("contact_id", contacts[0].id).order("created_at", { ascending: true });
    console.log("Conversations for latest contact:");
    console.dir(convs, { depth: null });
  }
}

run();
