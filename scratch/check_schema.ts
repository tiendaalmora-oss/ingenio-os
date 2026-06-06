import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const headers = {
  "apikey": supabaseKey,
  "Authorization": `Bearer ${supabaseKey}`,
  "Content-Type": "application/json"
};

async function run() {
  const fRes = await fetch(`${supabaseUrl}/rest/v1/funnels?limit=1`, { headers });
  const funnels = await fRes.json();
  console.log("Funnels data:", funnels[0]);
}

run();
