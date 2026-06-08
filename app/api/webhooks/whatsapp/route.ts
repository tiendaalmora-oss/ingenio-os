import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { evaluateGatekeeper } from "@/lib/ai/gatekeeper";
import { classifyGlobalIntent } from "@/lib/ai/router";

// Variables de entorno para conectar con WAHA (WhatsApp HTTP API)
const WAHA_URL = process.env.WAHA_URL || "http://localhost:3000";
const WAHA_SESSION = process.env.WAHA_SESSION || "default";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

/**
 * Keywords que indican intención positiva de avance (para etapas sin ai_goal)
 */
const ADVANCE_KEYWORDS = [
  "sí", "si", "dale", "ok", "okey", "bueno", "está bien", "esta bien",
  "quiero", "pasame", "pasá", "mandame", "mandá", "adelante", "claro",
  "me interesa", "interesado", "interesada", "de acuerdo", "perfecto",
  "excelente", "genial", "listo", "va", "vamos", "por favor", "please"
];

/**
 * Tipos de mensaje multimedia que no podemos procesar con IA
 */
const MULTIMEDIA_TYPES = ["audio", "ptt", "image", "video", "document", "sticker", "gif"];

/**
 * Helper para enviar mensajes de texto a través de WAHA
 */
async function sendWahaMessage(chatId: string, text: string) {
  try {
    // Retraso artificial de 7 segundos para simular que un humano está escribiendo
    await new Promise(resolve => setTimeout(resolve, 7000));

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
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Excepción enviando por WAHA:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Detecta si el mensaje contiene intención positiva de avance
 */
function hasAdvanceIntent(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return ADVANCE_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Reemplaza variables dinámicas en el texto de la plantilla
 */
function interpolateTemplate(text: string, contact: any): string {
  return text
    .replace(/\{nombre\}/gi, contact.name || "")
    .replace(/\{name\}/gi, contact.name || "")
    .replace(/\{telefono\}/gi, contact.phone || "")
    .replace(/\{phone\}/gi, contact.phone || "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook WhatsApp Recibido:", JSON.stringify(body, null, 2));

    // Validar estructura básica de WAHA
    if (body.event !== "message" || !body.payload) {
      return NextResponse.json({ success: true, message: "No es un mensaje entrante" });
    }

    const { fromMe } = body.payload;

    // Ignorar mensajes enviados por el propio bot
    if (fromMe) {
      return NextResponse.json({ success: true });
    }

    // 🔥 EJECUCIÓN EN SEGUNDO PLANO 🔥
    // Lanzamos la promesa y no la esperamos (no usamos await).
    // Esto permite responder a WAHA inmediatamente con un 200 OK, 
    // evitando que WAHA haga "timeouts" y mande mensajes duplicados por el retraso de 7 segundos.
    processMessageBackground(body).catch(err => console.error("Error en procesamiento bg:", err));

    return NextResponse.json({ success: true, message: "Procesando en bg" });

  } catch (error: any) {
    console.error("Error crítico en webhook POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * Toda la lógica pesada (IA, Base de Datos, Retrasos artificiales) va acá
 */
async function processMessageBackground(body: any) {
  try {
    const { from, body: content, type } = body.payload;
    const pushName = body.payload._data?.notifyName || body.payload.notifyName || body.payload.pushName || "";
    const isTestNumber = false;

    // Limpiar el teléfono
    const phone = from.split("@")[0];

    // ==============================================================
    // MEJORA 4: Detectar mensajes multimedia ANTES de todo
    // ==============================================================
    const isMultimedia = MULTIMEDIA_TYPES.includes(type);
    if (isMultimedia) {
      // Buscar o crear contacto mínimo para auditoría
      let { data: contactCheck } = await supabase
        .from("crm_contacts")
        .select("id, name")
        .eq("phone", phone)
        .single();

      if (!contactCheck) {
        const { data: newC } = await supabase.from("crm_contacts").insert([{
          phone,
          name: pushName || "Sin nombre",
          source: "whatsapp",
          is_test: isTestNumber,
          ultimo_mensaje: `[${type.toUpperCase()}]`,
          ultimo_contacto: new Date().toISOString()
        }]).select("id, name").single();
        contactCheck = newC;
      }

      // Registrar el inbound multimedia
      if (contactCheck) {
        await supabase.from("crm_conversations").insert([{
          contact_id: contactCheck.id,
          direction: "inbound",
          type: type,
          content: `[Mensaje de ${type.toUpperCase()} recibido]`,
          metadata: { type }
        }]);
      }

      // Responder con mensaje empático según el tipo de multimedia
      let multimediaMsg = "";
      if (type === "audio" || type === "ptt") {
        multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Disculpá, por el momento no puedo escuchar tu audio, pero no te preocupes — en cuanto un asesor esté disponible lo va a escuchar y te va a responder. 🙏`;
      } else if (type === "image") {
        multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Recibimos tu imagen. Por ahora no puedo verla, pero en cuanto un asesor esté disponible la va a revisar y te contacta. 🙏`;
      } else if (type === "video") {
        multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Recibimos tu video. En cuanto un asesor esté disponible lo va a ver y te responde. 🙏`;
      } else if (type === "document") {
        multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Recibimos tu documento. Un asesor lo va a revisar y te responde a la brevedad. 🙏`;
      } else {
        multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Recibimos tu mensaje. Un asesor lo va a atender en breve. 🙏`;
      }
      await sendWahaMessage(from, multimediaMsg);

      if (contactCheck) {
        await supabase.from("crm_conversations").insert([{
          contact_id: contactCheck.id,
          direction: "outbound",
          type: "text",
          content: multimediaMsg,
          metadata: { multimedia_fallback: true, original_type: type }
        }]);

        // Escalamos a humano para que un asesor real vea el audio/imagen
        await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contactCheck.id);
        await supabase.from("contact_events").insert([{
          contact_id: contactCheck.id,
          tipo: "escalado_humano",
          descripcion: `Cliente envió multimedia (${type}). Requiere revisión humana.`
        }]);
      }

      return NextResponse.json({ success: true, handled: "multimedia" });
    }

    // ==============================================================
    // 1. Encontrar o Crear Contacto
    // ==============================================================
    let { data: contacts } = await supabase
      .from("crm_contacts")
      .select("*, funnels(*)")
      .eq("phone", phone)
      .order("created_at", { ascending: true }) // MUY IMPORTANTE: Elegir el más viejo para evitar conflictos de duplicados por race conditions
      .limit(1);

    let contact = contacts && contacts.length > 0 ? contacts[0] : null;
    let isNewContact = false;

    if (!contact) {
      isNewContact = true;
      
      const { data: newContact } = await supabase.from("crm_contacts").insert([{
        phone,
        name: pushName || "Sin nombre",
        source: "whatsapp",
        is_test: isTestNumber,
        ultimo_mensaje: content,
        ultimo_contacto: new Date().toISOString()
      }]).select().single();

      contact = newContact;

      await supabase.from("contact_events").insert([{
        contact_id: contact.id,
        tipo: "lead_entregado",
        descripcion: "Lead nuevo ingresado vía WhatsApp"
      }]);
    } else {
      await supabase.from("crm_contacts").update({ 
        ultimo_mensaje: content,
        ultimo_contacto: new Date().toISOString() 
      }).eq("id", contact.id);
    }

    // ==============================================================
    // 2. Registrar la conversación en la tabla de auditoría
    // ==============================================================
    await supabase.from("crm_conversations").insert([{
      contact_id: contact.id,
      direction: "inbound",
      type: "text",
      content: content || "",
      metadata: body.payload
    }]);

    // ==============================================================
    // 3. Funnel Engine Lógico
    // ==============================================================
    const { data: chatHistory } = await supabase
      .from("crm_conversations")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Contar mensajes inbound para detectar cuántas veces escribió
    const inboundCount = (chatHistory || []).filter(m => m.direction === "inbound").length;

    // ==============================================================
    // FLUJO A: Contacto sin embudo asignado (limbo)
    // ==============================================================
    if (!contact.current_step_id && contact.status !== 'humano') {
      
      // PARCHE DE SEGURIDAD MÁXIMA (Activable temporalmente)
      // Solo activar el bot si el mensaje contiene la frase de la campaña (ignorando tildes y mayúsculas)
      const cleanContent = (content || "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes (avíos -> avios)
        .trim();
        
      if (!cleanContent.includes("quiero la demo de avios") && !cleanContent.includes("quiero la demo")) {
        // No es el mensaje de la campaña. Lo pasamos a humano para que el bot no moleste.
        await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
        await supabase.from("contact_events").insert([{
          contact_id: contact.id,
          tipo: "escalado_humano",
          descripcion: "Ignorado por seguridad (No usó la frase clave de la campaña)"
        }]);
        return NextResponse.json({ success: true, message: "Ignorado por seguridad (no keyword)" });
      }

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
        // ✅ Router identificó el embudo
        const { data: firstStep } = await supabase.from("funnel_steps").select("id").eq("funnel_id", assignedFunnelId).order("orden", { ascending: true }).limit(1).single();
        if (firstStep) stepId = firstStep.id;

        await supabase.from("crm_contacts").update({ funnel_id: assignedFunnelId, current_step_id: stepId }).eq("id", contact.id);
        
        if (stepId) {
          const { data: template } = await supabase.from("bot_templates").select("*").eq("step_id", stepId).order("created_at", { ascending: true }).limit(1).single();
          if (template && template.mensaje) {
            const msg = interpolateTemplate(template.mensaje, contact);
            const sendResult = await sendWahaMessage(from, msg);
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id,
              direction: "outbound",
              type: "text",
              content: sendResult.success ? msg : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
              metadata: { template_id: template.id, sendResult }
            }]);
          }
        }
      } else {
        // ❌ Router no pudo identificar intención

        if (isNewContact || inboundCount === 1) {
          // 🆕 Primer mensaje → bienvenida genérica
          const fallbackMsg = "¡Hola! Gracias por contactarte con nosotros. 👋\n\nContanos, ¿en qué te podemos ayudar el día de hoy?";
          const sendResult = await sendWahaMessage(from, fallbackMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id,
            direction: "outbound",
            type: "text",
            content: fallbackMsg,
            metadata: { router_fallback: true, attempt: inboundCount }
          }]);
        } else if (inboundCount === 2) {
          // ✉️ MEJORA 1: Segundo mensaje sin contexto → nudge específico
          const nudgeMsg = "Hola de nuevo 👋 Queremos ayudarte, solo contanos: ¿qué producto o servicio te interesa?\n\nPor ejemplo podés escribir: *\"demo AviOS\"*, *\"info balanza\"*, *\"activar licencia\"*, etc. 😊";
          const sendResult = await sendWahaMessage(from, nudgeMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id,
            direction: "outbound",
            type: "text",
            content: nudgeMsg,
            metadata: { router_fallback: true, attempt: inboundCount }
          }]);
        } else if (inboundCount >= 3 && inboundCount % 3 === 0) {
          // 🆘 3er+ mensaje sin contexto cada 3 intentos → escalar a humano
          await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
          const humanMsg = "Gracias por tu paciencia 🙏 Uno de nuestros asesores te va a contactar en breve para ayudarte personalmente.";
          await sendWahaMessage(from, humanMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id,
            direction: "outbound",
            type: "text",
            content: humanMsg,
            metadata: { escalated_to_human: true, reason: "limbo_timeout" }
          }]);
          await supabase.from("contact_events").insert([{
            contact_id: contact.id,
            tipo: "escalado_humano",
            descripcion: `Escalado automáticamente después de ${inboundCount} mensajes sin identificar intención`
          }]);
        }
        // Entre el mensaje 2 y el siguiente múltiplo de 3: silencio controlado (no spam)
      }

    // ==============================================================
    // FLUJO B: Contacto con embudo asignado
    // ==============================================================
    } else if (contact.current_step_id && contact.status !== 'humano') {
      const { data: currentStep } = await supabase
        .from("funnel_steps")
        .select("*")
        .eq("id", contact.current_step_id)
        .single();

      if (currentStep) {
        // ==============================================================
        // MEJORA 3: Guardia para etapas SIN ai_goal configurado
        // ==============================================================
        if (!currentStep.ai_goal) {
          const advanceIntent = hasAdvanceIntent(content || "");
          if (advanceIntent) {
            // Avanzar por keyword
            const { data: nextStep } = await supabase
              .from("funnel_steps")
              .select("*")
              .eq("funnel_id", currentStep.funnel_id)
              .gt("orden", currentStep.orden)
              .order("orden", { ascending: true })
              .limit(1)
              .single();

            if (nextStep) {
              await supabase.from("crm_contacts").update({ current_step_id: nextStep.id }).eq("id", contact.id);
              const { data: nextTemplate } = await supabase.from("bot_templates").select("*").eq("step_id", nextStep.id).order("created_at", { ascending: true }).limit(1).single();
              if (nextTemplate && nextTemplate.mensaje) {
                const msg = interpolateTemplate(nextTemplate.mensaje, contact);
                const sendResult = await sendWahaMessage(from, msg);
                await supabase.from("crm_conversations").insert([{
                  contact_id: contact.id,
                  direction: "outbound",
                  type: "text",
                  content: sendResult.success ? msg : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                  metadata: { template_id: nextTemplate.id, ai_action: "keyword_advance" }
                }]);
              }
            } else {
              // No hay siguiente etapa → llegó al final del embudo
              const endMsg = "¡Genial! 🎉 Hemos registrado tu interés. Un asesor se va a poner en contacto contigo muy pronto para cerrar los detalles.";
              await sendWahaMessage(from, endMsg);
              await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
              await supabase.from("crm_conversations").insert([{
                contact_id: contact.id, direction: "outbound", type: "text",
                content: endMsg, metadata: { funnel_completed: true }
              }]);
            }
          }
          // Si no hay ai_goal y no hay keyword de avance → silencio controlado (no spam)
        } else {
          // ==============================================================
          // FLUJO NORMAL: Etapa CON ai_goal → Gatekeeper IA
          // ==============================================================
          try {
            const aiResult = await evaluateGatekeeper(chatHistory || [], currentStep, content || "");

            if (aiResult.accion === "avanzar") {
              const { data: nextStep } = await supabase
                .from("funnel_steps")
                .select("*")
                .eq("funnel_id", currentStep.funnel_id)
                .gt("orden", currentStep.orden)
                .order("orden", { ascending: true })
                .limit(1)
                .single();

              if (nextStep) {
                await supabase.from("crm_contacts").update({ current_step_id: nextStep.id }).eq("id", contact.id);
                const { data: nextTemplate } = await supabase.from("bot_templates").select("*").eq("step_id", nextStep.id).order("created_at", { ascending: true }).limit(1).single();
                if (nextTemplate && nextTemplate.mensaje) {
                  const msg = interpolateTemplate(nextTemplate.mensaje, contact);
                  const sendResult = await sendWahaMessage(from, msg);
                  await supabase.from("crm_conversations").insert([{
                    contact_id: contact.id,
                    direction: "outbound",
                    type: "text",
                    content: sendResult.success ? msg : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                    metadata: { template_id: nextTemplate.id, ai_action: "avanzar", sendResult }
                  }]);
                }
              } else {
                // Fin del embudo
                const endMsg = "¡Excelente! 🎉 Ya tenemos toda la información que necesitamos. Un asesor te va a contactar pronto para los detalles finales.";
                await sendWahaMessage(from, endMsg);
                await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
                await supabase.from("crm_conversations").insert([{
                  contact_id: contact.id, direction: "outbound", type: "text",
                  content: endMsg, metadata: { funnel_completed: true }
                }]);
              }
            } else if (aiResult.accion === "responder" && aiResult.respuesta_ia) {
              const sendResult = await sendWahaMessage(from, aiResult.respuesta_ia);
              await supabase.from("crm_conversations").insert([{
                contact_id: contact.id,
                direction: "outbound",
                type: "text",
                content: sendResult.success ? aiResult.respuesta_ia : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                metadata: { ai_action: "responder", sendResult }
              }]);
            } else if (aiResult.accion === "humano") {
              await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
              await supabase.from("contact_events").insert([{
                contact_id: contact.id,
                tipo: "escalado_humano",
                descripcion: "IA detectó necesidad de atención humana"
              }]);
              // MEJORA 2 + Bonus: Respuesta profesional al escalar (no silencio)
              const humanMsg = "Entendido 👍 Voy a conectarte con uno de nuestros asesores para que pueda ayudarte mejor. ¡En breve te contactan!";
              await sendWahaMessage(from, humanMsg);
              await supabase.from("crm_conversations").insert([{
                contact_id: contact.id, direction: "outbound", type: "text",
                content: humanMsg, metadata: { ai_action: "humano" }
              }]);
            }
          } catch (aiErr: any) {
            // Bonus: Fallback profesional cuando la IA falla
            console.error("Error en evaluación de IA:", aiErr);
            const errorFallbackMsg = "Gracias por tu mensaje 🙏 En breve uno de nuestros asesores te va a ayudar personalmente.";
            await sendWahaMessage(from, errorFallbackMsg);
            await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id,
              direction: "outbound",
              type: "text",
              content: errorFallbackMsg,
              metadata: { ai_error: aiErr.message, fallback_to_human: true }
            }]);
          }
        }
      }
    }

    // Fin del procesamiento asíncrono
  } catch (err: any) {
    console.error("Error crítico en proceso de fondo webhook:", err);
  }
}
