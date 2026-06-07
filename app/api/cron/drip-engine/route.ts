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

    // 1. Obtener todas las etapas que tienen configurado un delay de seguimiento
    const { data: stepsWithDrip, error: stepsError } = await supabase
      .from("funnel_steps")
      .select("id, nombre, followup_delay_minutes, followup_template, followup_condition")
      .not("followup_delay_minutes", "is", null)
      .not("followup_template", "is", null);

    if (stepsError) throw stepsError;

    if (!stepsWithDrip || stepsWithDrip.length === 0) {
      return NextResponse.json({ success: true, message: "No hay configuraciones de drip activas." });
    }

    const report = [];

    // 2. Iterar sobre cada etapa para buscar contactos elegibles
    for (const step of stepsWithDrip) {
      const delayMinutes = step.followup_delay_minutes;
      
      // Calcular la fecha/hora límite. Si el contacto fue actualizado antes de esto, ya pasó el delay.
      const cutoffTime = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();

      // Buscar contactos que:
      // a) Están en esta etapa (current_step_id = step.id)
      // b) No han recibido seguimiento para esta etapa (last_followup_step_id != step.id OR last_followup_step_id is null)
      // c) El tiempo de su último contacto (ultimo_contacto) es anterior al cutoffTime.
      // d) Su status sea 'bot' (si es 'humano' no interrumpimos).
      const { data: eligibleContacts, error: contactsError } = await supabase
        .from("crm_contacts")
        .select("id, phone, name, ultimo_contacto, last_followup_step_id")
        .eq("current_step_id", step.id)
        .eq("status", "bot")
        .lt("ultimo_contacto", cutoffTime);
        
      if (contactsError) {
        console.error(`[DRIP ENGINE] Error buscando contactos para etapa ${step.id}:`, contactsError);
        continue;
      }

      // Filtrar a mano los que ya recibieron el followup de esta etapa
      const pendingContacts = eligibleContacts?.filter(c => c.last_followup_step_id !== step.id) || [];

      for (const contact of pendingContacts) {
        // Chequear condición 'no_reply'.
        // Si es 'no_reply', debemos verificar si el último mensaje lo envió el contacto (inbound) o el bot (outbound).
        // Si el cliente respondió DESPUÉS del mensaje del bot que lo puso en esta etapa, la respuesta actualizaría el updated_at y, 
        // más importante, si respondió, quizá la IA lo movió de etapa. Pero asumiendo que sigue en la etapa,
        // podríamos verificar quién mandó el último mensaje.
        let shouldSend = true;
        if (step.followup_condition === "no_reply") {
          const { data: lastMsg } = await supabase
            .from("crm_conversations")
            .select("direction")
            .eq("contact_id", contact.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          // Si el último mensaje es inbound, significa que el cliente SÍ respondió (y por algún motivo sigue en la misma etapa)
          if (lastMsg && lastMsg.direction === "inbound") {
            shouldSend = false;
          }
        }

        if (shouldSend) {
          // Reemplazar variables (por ahora solo nombre)
          const msgText = step.followup_template.replace(/\{nombre\}/gi, contact.name || "");
          
          console.log(`[DRIP ENGINE] Enviando seguimiento a ${contact.phone} (Etapa: ${step.nombre})`);
          
          const sendResult = await sendWahaMessage(contact.phone, msgText);
          
          if (sendResult.success) {
            // Guardar en conversacion
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id,
              direction: "outbound",
              type: "text",
              content: msgText,
              metadata: { source: "drip_engine", step_id: step.id }
            }]);

            // Actualizar contacto
            await supabase.from("crm_contacts").update({
              last_followup_step_id: step.id
            }).eq("id", contact.id);

            report.push(`Mensaje enviado a ${contact.phone} (Etapa: ${step.nombre})`);
          } else {
            console.error(`[DRIP ENGINE] Falló envío a ${contact.phone}`);
          }
        } else {
            // Si no se envía por la condición no_reply, igual marcamos para no re-evaluarlo constantemente?
            // Podríamos marcarlo para evitar que el cron lo intente eternamente.
            await supabase.from("crm_contacts").update({
              last_followup_step_id: step.id
            }).eq("id", contact.id);
            report.push(`Seguimiento omitido para ${contact.phone} (Condición no_reply no cumplida)`);
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
