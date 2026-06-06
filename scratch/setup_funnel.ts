import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const headers = {
  "apikey": supabaseKey,
  "Authorization": `Bearer ${supabaseKey}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

async function run() {
  console.log("Configurando primer embudo con reglas de IA...");

  // 1. Obtener el primer embudo activo
  const fRes = await fetch(`${supabaseUrl}/rest/v1/funnels?limit=1`, { headers });
  const funnels = await fRes.json();
  if (!funnels || funnels.length === 0) {
    console.error("No se encontró ningún embudo.");
    return;
  }
  const funnel = funnels[0];
  console.log(`Embudo encontrado: ${funnel.nombre}`);

  // Asegurar que la IA esté activa para el embudo (si existe la columna ai_enabled)
  await fetch(`${supabaseUrl}/rest/v1/funnels?id=eq.${funnel.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ ai_enabled: true })
  });

  // 2. Obtener las etapas del embudo
  const sRes = await fetch(`${supabaseUrl}/rest/v1/funnel_steps?funnel_id=eq.${funnel.id}&order=orden.asc`, { headers });
  const steps = await sRes.json();

  if (!steps || steps.length === 0) {
    console.error("No se encontraron etapas.");
    return;
  }

  // 3. Configurar reglas de IA y Plantillas para la ETAPA 1 (Nuevo Lead)
  const step1 = steps[0];
  if (step1) {
    console.log(`Configurando Etapa 1: ${step1.nombre}`);
    await fetch(`${supabaseUrl}/rest/v1/funnel_steps?id=eq.${step1.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        ai_goal: "El cliente debe mostrar interés en recibir la demostración (demo) de AviOS.",
        ai_valid_intents: "quiero la demo, me interesa verla, pasamela, dale mandamela, quiero ver como funciona, si por favor",
        ai_faq: "AviOS sirve para avícolas, carnicerías, forrajerías y negocios con balanzas. Se instala de forma remota. No cobramos mensualidad, es un pago único por licencia."
      })
    });

    const t1Res = await fetch(`${supabaseUrl}/rest/v1/bot_templates?step_id=eq.${step1.id}&limit=1`, { headers });
    const t1Arr = await t1Res.json();
    const template1 = "¡Hola! Gracias por tu interés en AviOS, nuestro sistema para negocios de pesaje. ⚖️🍗\n\n¿Te gustaría que te envíe una demo sin cargo para que veas cómo funciona en tiempo real?";
    
    if (t1Arr && t1Arr.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/bot_templates?id=eq.${t1Arr[0].id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ mensaje: template1, activo: true })
      });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/bot_templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          funnel_id: funnel.id,
          step_id: step1.id,
          trigger_key: step1.key,
          nombre: `Mensaje: ${step1.nombre}`,
          mensaje: template1,
          activo: true,
          orden: 1
        })
      });
    }
  }

  // 4. Configurar reglas de IA y Plantillas para la ETAPA 2 (Demo Entregada / Primer Contacto)
  const step2 = steps[1];
  if (step2) {
    console.log(`Configurando Etapa 2: ${step2.nombre}`);
    await fetch(`${supabaseUrl}/rest/v1/funnel_steps?id=eq.${step2.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        ai_goal: "El cliente debe indicar que ya vio la demo y que quiere avanzar con la compra o saber precios de licencias.",
        ai_valid_intents: "ya la vi, cuanto cuesta, que precio tiene, como la compro, me interesa comprarlo",
        ai_faq: "Tenemos licencias para 1 sola PC y licencias en red para múltiples PCs. El soporte técnico está incluido."
      })
    });

    const t2Res = await fetch(`${supabaseUrl}/rest/v1/bot_templates?step_id=eq.${step2.id}&limit=1`, { headers });
    const t2Arr = await t2Res.json();
    const template2 = "¡Excelente! Aquí te dejo el enlace para que descargues la demo y la pruebes en tu computadora: [LINK_DEMO]\n\nAvisame en cuanto la instales o si tenés alguna duda durante la prueba, ¡estoy acá para ayudarte!";
    
    if (t2Arr && t2Arr.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/bot_templates?id=eq.${t2Arr[0].id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ mensaje: template2, activo: true })
      });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/bot_templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          funnel_id: funnel.id,
          step_id: step2.id,
          trigger_key: step2.key,
          nombre: `Mensaje: ${step2.nombre}`,
          mensaje: template2,
          activo: true,
          orden: 2
        })
      });
    }
  }

  console.log("¡Embudo configurado exitosamente! Listo para pruebas.");
}

run();
