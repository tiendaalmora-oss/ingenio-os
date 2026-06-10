import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = 'force-dynamic';

const WAHA_URL = process.env.WAHA_URL || "http://localhost:3000";
const WAHA_SESSION = process.env.WAHA_SESSION || "default";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

async function sendWahaMessage(chatId: string, text: string) {
  try {
    const finalChatId = chatId.includes("@") ? chatId : `${chatId}@c.us`;
    const wahaUrlBase = WAHA_URL.replace(/\/+$/, '');
    
    const res = await fetch(`${wahaUrlBase}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(WAHA_API_KEY ? { "X-Api-Key": WAHA_API_KEY } : {})
      },
      body: JSON.stringify({
        chatId: finalChatId,
        text: text,
        session: WAHA_SESSION
      })
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error("Error al enviar mensaje por WAHA:", errText);
      return { success: false, error: errText };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Excepción enviando por WAHA:", error);
    return { success: false, error: error.message };
  }
}

export async function GET(req: Request) {
  try {
    console.log("[DRIP ENGINE] Iniciando ejecución...");

    // ==============================================================
    // REGLA DE HORARIO COMERCIAL (ARGENTINA UTC-3)
    // ==============================================================
    const argentinaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const currentHour = argentinaTime.getHours();
    
    // Si NO estamos entre las 09:00 y las 20:59, pausamos el motor.
    // Los mensajes no se pierden, simplemente esperarán al día siguiente a las 09:00 para enviarse.
    if (currentHour < 9 || currentHour >= 21) {
      console.log(`[DRIP ENGINE] Pausado. Fuera de horario comercial (${currentHour}hs).`);
      return NextResponse.json({ 
        success: true, 
        message: `Fuera de horario comercial (${currentHour}hs). Los envíos se reanudarán a las 09:00.` 
      });
    }

    // 1. Obtener todas las etapas
    // Buscamos las que tengan drips_config (nuevo sistema) o followup_delay_minutes (sistema viejo)
    const { data: stepsWithDrip, error: stepsError } = await supabase
      .from("funnel_steps")
      .select("id, nombre, drips_config, followup_delay_minutes, followup_template, followup_condition");

    if (stepsError) throw stepsError;

    if (!stepsWithDrip || stepsWithDrip.length === 0) {
      return NextResponse.json({ success: true, message: "No hay configuraciones de drip activas." });
    }

    const report = [];

    // 2. Iterar sobre cada etapa
    for (const step of stepsWithDrip) {
      
      // Normalizamos la lista de seguimientos
      let drips: any[] = [];
      
      if (step.drips_config && Array.isArray(step.drips_config) && step.drips_config.length > 0) {
        drips = step.drips_config;
      } else if (step.followup_delay_minutes && step.followup_template) {
        // Fallback al sistema viejo si aún no migraron la BD
        drips = [{
          delay_minutes: step.followup_delay_minutes,
          template: step.followup_template,
          condition: step.followup_condition || 'no_reply'
        }];
      }

      if (drips.length === 0) continue; // Esta etapa no tiene seguimientos

      // Buscar contactos en esta etapa que estén activos
      const { data: eligibleContacts, error: contactsError } = await supabase
        .from("crm_contacts")
        .select("id, phone, name, ultimo_contacto, last_followup_index")
        .eq("current_step_id", step.id)
        .eq("status", "activo");
        
      if (contactsError) {
        console.error(`[DRIP ENGINE] Error buscando contactos para etapa ${step.id}:`, contactsError);
        continue;
      }

      for (const contact of (eligibleContacts || [])) {
        // Validar que el cliente no haya terminado todos los seguimientos
        const currentIndex = contact.last_followup_index || 0;
        
        if (currentIndex >= drips.length) {
          continue; // Ya recibió todos los drips de esta etapa
        }

        const currentDrip = drips[currentIndex];
        const delayMinutes = currentDrip.delay_minutes || 0;
        
        // Calcular la fecha/hora límite
        const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000).getTime();
        const contactTime = new Date(contact.ultimo_contacto).getTime();

        // Si aún no pasó el tiempo necesario desde el último contacto, lo salteamos
        if (contactTime > cutoffTime) {
          continue; 
        }

        let shouldSend = true;
        
        if (currentDrip.condition === "no_reply") {
          const { data: lastMsg } = await supabase
            .from("crm_conversations")
            .select("direction")
            .eq("contact_id", contact.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          // Si el último mensaje fue del cliente, no enviamos el seguimiento (porque no cumple "sin respuesta")
          if (lastMsg && lastMsg.direction === "inbound") {
            shouldSend = false;
          }
        }

        if (shouldSend) {
          const msgText = currentDrip.template.replace(/\{nombre\}/gi, contact.name || "");
          
          let realChatId = contact.phone;
          const { data: lastInbound } = await supabase
            .from("crm_conversations")
            .select("metadata")
            .eq("contact_id", contact.id)
            .eq("direction", "inbound")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          if (lastInbound && lastInbound.metadata && lastInbound.metadata.from) {
            realChatId = lastInbound.metadata.from;
          }

          console.log(`[DRIP ENGINE] Enviando seguimiento #${currentIndex + 1} a ${realChatId} (Etapa: ${step.nombre})`);
          
          const sendResult = await sendWahaMessage(realChatId, msgText);
          
          if (sendResult.success) {
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id,
              direction: "outbound",
              type: "text",
              content: msgText,
              metadata: { source: "drip_engine", step_id: step.id, drip_index: currentIndex }
            }]);

            // Avanzamos el índice para que el próximo Drip sea el siguiente en la lista
            await supabase.from("crm_contacts").update({
              last_followup_index: currentIndex + 1
            }).eq("id", contact.id);

            report.push(`Mensaje #${currentIndex + 1} enviado a ${contact.phone} (Etapa: ${step.nombre})`);
          } else {
            console.error(`[DRIP ENGINE] Falló envío a ${contact.phone}`);
          }
        } else {
            // Si la condición "no_reply" no se cumple, cancelamos el resto de los seguimientos de esta etapa
            // avanzando el índice hasta el final.
            await supabase.from("crm_contacts").update({
              last_followup_index: drips.length
            }).eq("id", contact.id);
            report.push(`Seguimiento omitido para ${contact.phone} (Respondió antes)`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed_count: report.length,
      report 
    });

  } catch (err: any) {
    console.error("[DRIP ENGINE] Error fatal:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
