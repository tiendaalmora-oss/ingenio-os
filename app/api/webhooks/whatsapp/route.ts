import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { evaluateGatekeeper } from "@/lib/ai/gatekeeper";
import { classifyGlobalIntent } from "@/lib/ai/router";

// Variables de entorno para conectar con WAHA (WhatsApp HTTP API)
const WAHA_URL = process.env.WAHA_URL || "http://localhost:3000";
const WAHA_SESSION = process.env.WAHA_SESSION || "default";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

/**
 * Helper para enviar mensajes de texto a través de WAHA
 */
async function sendWahaMessage(chatId: string, text: string) {
  try {
    const finalChatId = chatId.includes("@") ? chatId : `${chatId}@c.us`;
    const wahaUrlBase = WAHA_URL.replace(/\/+$/, ''); // Remove trailing slashes
    
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
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Excepción enviando por WAHA:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Webhook para recibir mensajes entrantes de WAHA
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook WhatsApp Recibido:", JSON.stringify(body, null, 2));

    // Validar estructura básica de WAHA
    if (body.event !== "message" || !body.payload) {
      return NextResponse.json({ success: true, message: "No es un mensaje entrante" });
    }

    const { from, body: content, type, fromMe } = body.payload;
    const pushName = body.payload._data?.notifyName || body.payload.notifyName || body.payload.pushName || "";
    const isTestNumber = false;

    // Ignorar mensajes enviados por el propio bot para no hacer bucles (a menos que queramos auditar todo)
    if (fromMe) {
      return NextResponse.json({ success: true });
    }

    // Limpiar el teléfono (ej: "5491112345678@c.us" -> "5491112345678")
    const phone = from.split("@")[0];

    // 1. Encontrar o Crear Contacto
    let { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select("*, funnels(*)")
      .eq("phone", phone)
      .single();

    let isNewContact = false;

    if (!contact) {
      isNewContact = true;
      
      // Clasificación Global
      const { data: activeFunnels } = await supabase.from("funnels").select("*").eq("activo", true);
      let assignedFunnelId = null;
      let stepId = null;

      if (activeFunnels && activeFunnels.length > 0) {
        try {
          assignedFunnelId = await classifyGlobalIntent(activeFunnels, content || "");
        } catch (routerErr) {
          console.error("Error en router IA:", routerErr);
        }
      }

      if (assignedFunnelId) {
        const { data: firstStep } = await supabase.from("funnel_steps").select("id").eq("funnel_id", assignedFunnelId).order("orden", { ascending: true }).limit(1).single();
        if (firstStep) stepId = firstStep.id;
      }

      const { data: newContact, error: insertError } = await supabase.from("crm_contacts").insert([{
        phone,
        name: pushName || "Sin nombre",
        funnel_id: assignedFunnelId,
        current_step_id: stepId,
        source: "whatsapp",
        is_test: isTestNumber,
        ultimo_mensaje: content,
        ultimo_contacto: new Date().toISOString()
      }]).select().single();

      contact = newContact;

      // Registrar evento de lead nuevo
      await supabase.from("contact_events").insert([{
        contact_id: contact.id,
        tipo: "lead_entregado",
        descripcion: "Lead nuevo ingresado vía WhatsApp y ruteado"
      }]);
    } else {
      // Si ya existía, actualizamos fecha de último contacto
      await supabase.from("crm_contacts").update({ 
        ultimo_mensaje: content,
        ultimo_contacto: new Date().toISOString() 
      }).eq("id", contact.id);
    }

    // 2. Registrar la conversación en la tabla de auditoría
    const { error: insertMsgError } = await supabase.from("crm_conversations").insert([{
      contact_id: contact.id,
      direction: "inbound",
      type: type === "chat" || !type ? "text" : type,
      content: content || "Multimedia",
      metadata: body.payload
    }]);

    if (insertMsgError) {
      console.error("Error guardando inbound en crm_conversations:", insertMsgError);
    }

    // 3. Funnel Engine Lógico (Respuestas automáticas e IA)
    // Obtener todo el historial reciente de la conversación
    const { data: chatHistory } = await supabase
      .from("crm_conversations")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (isNewContact) {
      if (contact.current_step_id) {
        // Flujo tradicional para Contacto Nuevo con embudo asignado: Disparar la primera plantilla.
        const { data: template } = await supabase
          .from("bot_templates")
          .select("*")
          .eq("step_id", contact.current_step_id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();
        
        if (template && template.mensaje) {
          // Enviar respuesta por WAHA usando el ID exacto que nos llegó
          const sendResult = await sendWahaMessage(from, template.mensaje);
          
          // Guardar la respuesta saliente en la base de datos
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id,
            direction: "outbound",
            type: "text",
            content: sendResult.success ? template.mensaje : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
            metadata: { template_id: template.id, sendResult }
          }]);
        }
      } else {
        // Contacto nuevo PERO el Router IA no pudo asignarle un embudo (mensaje genérico)
        const fallbackMsg = "¡Hola! Gracias por contactarte con nosotros. 👋\n\nContanos, ¿en qué te podemos ayudar el día de hoy?";
        const sendResult = await sendWahaMessage(from, fallbackMsg);
        await supabase.from("crm_conversations").insert([{
          contact_id: contact.id,
          direction: "outbound",
          type: "text",
          content: fallbackMsg,
          metadata: { router_fallback: true }
        }]);
      }
    } else if (!isNewContact && contact.current_step_id && contact.status !== 'humano') {
      // Flujo de IA Guardián para contactos existentes que están en un paso del embudo
      // 1. Obtener la etapa actual del contacto para ver si tiene configurada la IA
      const { data: currentStep } = await supabase
        .from("funnel_steps")
        .select("*")
        .eq("id", contact.current_step_id)
        .single();

      if (currentStep && currentStep.ai_goal) {
        try {
          const aiResult = await evaluateGatekeeper(chatHistory || [], currentStep, content || "");

          if (aiResult.accion === "avanzar") {
            // Avanzar a la siguiente etapa
            const { data: nextStep } = await supabase
              .from("funnel_steps")
              .select("*")
              .eq("funnel_id", currentStep.funnel_id)
              .gt("order_index", currentStep.order_index)
              .order("order_index", { ascending: true })
              .limit(1)
              .single();

            if (nextStep) {
              // 1. Actualizamos el contacto
              await supabase.from("crm_contacts").update({ current_step_id: nextStep.id }).eq("id", contact.id);

              // 2. Buscamos la plantilla de la nueva etapa
              const { data: nextTemplate } = await supabase
                .from("bot_templates")
                .select("*")
                .eq("step_id", nextStep.id)
                .order("created_at", { ascending: true })
                .limit(1)
                .single();

              if (nextTemplate && nextTemplate.mensaje) {
                const sendResult = await sendWahaMessage(from, nextTemplate.mensaje);
                await supabase.from("crm_conversations").insert([{
                  contact_id: contact.id,
                  direction: "outbound",
                  type: "text",
                  content: sendResult.success ? nextTemplate.mensaje : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                  metadata: { template_id: nextTemplate.id, ai_action: "avanzar", sendResult }
                }]);
              }
            }
          } else if (aiResult.accion === "responder" && aiResult.respuesta_ia) {
            // Enviar la respuesta de la IA (Atajador de objeciones)
            const sendResult = await sendWahaMessage(from, aiResult.respuesta_ia);
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id,
              direction: "outbound",
              type: "text",
              content: sendResult.success ? aiResult.respuesta_ia : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
              metadata: { ai_action: "responder", sendResult }
            }]);
          } else if (aiResult.accion === "humano") {
            // Escalar a humano: Cambiar estado y no responder
            await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
            // No enviamos mensaje automático
          }
        } catch (aiErr: any) {
          console.error("Error en evaluación de IA:", aiErr);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id,
            direction: "outbound",
            type: "text",
            content: `[ERROR IA] Fallo al consultar el Gatekeeper: ${aiErr.message}`,
            metadata: { error: true }
          }]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error procesando webhook:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
