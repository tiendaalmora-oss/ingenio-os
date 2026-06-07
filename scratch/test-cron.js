const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}
globalThis.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCron() {
  console.log("Iniciando prueba del cron...");
  
  const { data: stepsWithDrip, error: stepsError } = await supabase
    .from("funnel_steps")
    .select("id, nombre, followup_delay_minutes, followup_template, followup_condition")
    .not("followup_delay_minutes", "is", null)
    .not("followup_template", "is", null);
    
  if (stepsError) {
    console.error("Error fetching steps:", stepsError);
    return;
  }
  
  console.log(`Encontradas ${stepsWithDrip?.length || 0} etapas con Drip configurado.`);
  
  if (!stepsWithDrip || stepsWithDrip.length === 0) return;
  
  for (const step of stepsWithDrip) {
    console.log(`\nRevisando etapa: ${step.nombre}`);
    console.log(`- Delay configurado: ${step.followup_delay_minutes} minutos`);
    console.log(`- Condición: ${step.followup_condition}`);
    
    const cutoffTime = new Date(Date.now() - step.followup_delay_minutes * 60 * 1000).toISOString();
    console.log(`- Buscando contactos con status='bot', current_step_id='${step.id}', ultimo_contacto < ${cutoffTime}`);
    
    const { data: eligibleContacts, error: contactsError } = await supabase
      .from("crm_contacts")
      .select("id, phone, name, ultimo_contacto, last_followup_step_id, status")
      .eq("current_step_id", step.id)
      .eq("status", "bot");
      
    if (contactsError) {
      console.error("  Error buscando contactos:", contactsError);
      continue;
    }
    
    console.log(`  Contactos totales en esta etapa: ${eligibleContacts.length}`);
    
    for (const contact of eligibleContacts) {
      console.log(`  -> Contacto: ${contact.phone} | ultimo_contacto: ${contact.ultimo_contacto} | last_followup_step_id: ${contact.last_followup_step_id}`);
      
      const isPastCutoff = contact.ultimo_contacto < cutoffTime;
      console.log(`     ¿Pasó el tiempo de espera?: ${isPastCutoff ? 'Sí' : 'No'}`);
      
      const alreadySent = contact.last_followup_step_id === step.id;
      console.log(`     ¿Ya se le envió el drip?: ${alreadySent ? 'Sí' : 'No'}`);
    }
  }
}

testCron();
