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
  const contactsRes = await fetch(`${supabaseUrl}/rest/v1/crm_contacts?select=id,phone,ultimo_contacto,current_step_id,last_followup_step_id,status`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  const contacts = await contactsRes.json();
  console.log("Contacts in bot status:", contacts);
}
test();
