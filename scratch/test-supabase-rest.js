const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

async function test() {
  const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Get steps with drip
  const stepsRes = await fetch(`${supabaseUrl}/rest/v1/funnel_steps?followup_delay_minutes=not.is.null&followup_template=not.is.null`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  const steps = await stepsRes.json();
  console.log("Steps with drip:", steps.map(s => ({ id: s.id, nombre: s.nombre, delay: s.followup_delay_minutes })));

  // 2. Get contacts in bot status
  const convRes = await fetch(`${supabaseUrl}/rest/v1/crm_conversations?contact_id=eq.fe65bc37-07b5-42c7-94b5-fe1ce8219ba5&select=direction,content,created_at&order=created_at.desc&limit=5`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  const convs = await convRes.json();
  console.log("Conversations:", convs);
}
test();
