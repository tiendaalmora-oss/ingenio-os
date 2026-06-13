import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { sendWahaMessage, downloadWahaMedia, transcribeAudio } from "@/lib/utils/whatsapp";
import { executeAIForContact } from "@/lib/ai/processor";

const MULTIMEDIA_TYPES = ["audio", "ptt", "image", "video", "document", "sticker", "gif"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook WhatsApp Recibido:", JSON.stringify(body, null, 2));

    if (!["message", "message.any"].includes(body.event) || !body.payload) {
      return NextResponse.json({ success: true, message: "No es un evento de mensaje" });
    }

    const { fromMe } = body.payload;

    if (fromMe) {
      if (body.payload?.source === "api" || body.payload?._data?.source === "api") {
        return NextResponse.json({ success: true, message: "Ignorando eco de la API" });
      }
      processOutboundBackground(body).catch(err => console.error("Error en bg outbound:", err));
      return NextResponse.json({ success: true, message: "Sincronizando outbound" });
    }

    // Ejecutar procesamiento inmediato (guardar DB y llamar al debouncer)
    await processMessageImmediate(body);

    return NextResponse.json({ success: true, message: "Mensaje encolado en debouncer" });

  } catch (error: any) {
    console.error("Error crítico en webhook POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function processMessageImmediate(body: any) {
  try {
    const from = body.payload.from;
    const type = body.payload.type || body.payload._data?.type || "chat";
    let content = body.payload.body;
    const pushName = body.payload._data?.notifyName || body.payload.notifyName || body.payload.pushName || "";
    const isTestNumber = false;
    const phone = from.split("@")[0];

    // ==============================================================
    // 1. Manejo de Multimedia (Inmediato)
    // ==============================================================
    const isMultimedia = MULTIMEDIA_TYPES.includes(type);
    
    if (isMultimedia) {
      let { data: contactCheck } = await supabase.from("crm_contacts").select("id, name").eq("phone", phone).single();

      if (!contactCheck) {
        const { data: newC } = await supabase.from("crm_contacts").insert([{
          phone, name: pushName || "Sin nombre", source: "whatsapp", is_test: isTestNumber,
          ultimo_mensaje: `[${type.toUpperCase()}]`, ultimo_contacto: new Date().toISOString()
        }]).select("id, name").single();
        contactCheck = newC;
      }

      if (!contactCheck) return NextResponse.json({ success: false, error: "Contact could not be created" });

      if (type === "audio" || type === "ptt") {
        // Log original inbound
        await supabase.from("crm_conversations").insert([{
          contact_id: contactCheck.id, direction: "inbound", type: type,
          content: `[Audio recibido, procesando transcripción...]`, metadata: { type }
        }]);

        const msgId = body.payload.id?._serialized || body.payload.id;
        const buffer = await downloadWahaMedia(msgId);
        
        let transcriptSuccess = false;
        if (buffer) {
          const transcript = await transcribeAudio(buffer);
          if (transcript && transcript.trim() !== "") {
            transcriptSuccess = true;
            // Overwrite content for the debouncer
            content = `[Audio transcrito]: "${transcript}"`;
            body.payload.body = content;
            body.payload.type = "chat"; // Trick the rest of the flow
            
            // Save the transcription as an inbound message
            await supabase.from("crm_conversations").insert([{
              contact_id: contactCheck.id, direction: "inbound", type: "text",
              content: content, metadata: { original_type: type, transcript_success: true }
            }]);
          }
        }

        if (!transcriptSuccess) {
          // Fallback if transcription failed
          let multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Recibimos tu audio pero tuvimos un problema al transcribirlo. En cuanto un asesor esté disponible lo va a escuchar y te responderá por este medio. 🙏`;
          await sendWahaMessage(from, multimediaMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contactCheck.id, direction: "outbound", type: "text",
            content: multimediaMsg, metadata: { multimedia_fallback: true, original_type: type }
          }]);
          await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contactCheck.id);
          return;
        }
        
        // If success, we DO NOT return, we let the code continue down to debouncer!
        
      } else {
        // Other multimedia (image, video, document, etc.) triggers fallback
        await supabase.from("crm_conversations").insert([{
          contact_id: contactCheck.id, direction: "inbound", type: type,
          content: `[Mensaje de ${type.toUpperCase()} recibido]`, metadata: { type }
        }]);

        let multimediaMsg = `Hola${pushName ? " " + pushName : ""} 👋 Recibimos tu ${type === 'image' ? 'imagen' : type === 'video' ? 'video' : 'archivo'}. En cuanto un asesor esté disponible lo va a revisar y te responderá por este medio. 🙏`;
        
        await sendWahaMessage(from, multimediaMsg);

        if (contactCheck) {
          await supabase.from("crm_conversations").insert([{
            contact_id: contactCheck.id, direction: "outbound", type: "text",
            content: multimediaMsg, metadata: { multimedia_fallback: true, original_type: type }
          }]);

          await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contactCheck.id);
          await supabase.from("contact_events").insert([{
            contact_id: contactCheck.id, tipo: "escalado_humano", descripcion: `Cliente envió multimedia (${type}).`
          }]);
        }

        return;
      }
    }

    // Interceptar intenciones de llamada en mensajes de texto
    if (type === "chat" || !type) {
      const lowerContent = (content || "").toLowerCase();
      const callKeywords = ["llamar", "llamada", "llamame", "llamo", "puedo llamar", "audio", "te llamo"];
      const isCallIntent = callKeywords.some(kw => lowerContent.includes(kw));
      
      // We will only auto-intercept if it's explicitly asking for a call, but let's be careful not to block legit sales messages like "como se llama". 
      // Actually, regex: \b(llamar|llamada|llamame|te llamo|los llamo|puedo llamar)\b
      const callRegex = /\b(llamar|llamada|llamame|llamáme|te llamo|los llamo|puedo llamar)\b/i;
      if (callRegex.test(lowerContent)) {
        let { data: contactCheck } = await supabase.from("crm_contacts").select("id, name").eq("phone", phone).single();
        if (contactCheck) {
          const callMsg = "¡Hola! Cómo estás. Te comento que por una cuestión de orden y para que nos quede registrado el historial técnico de cada comercio, manejamos toda nuestra atención, soporte y ventas exclusivamente por mensaje de texto o audios de WhatsApp por este medio. 📋✍️\n\nAdelantame tu consulta por acá (puede ser por audio si te queda más cómodo) y te respondo al toque con toda la información técnica.";
          await sendWahaMessage(from, callMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contactCheck.id, direction: "outbound", type: "text",
            content: callMsg, metadata: { intercepted_call_intent: true }
          }]);
          await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contactCheck.id);
          return; // Detenemos el flujo aquí
        }
      }
    }

    // ==============================================================
    // 2. Encontrar o Crear Contacto
    // ==============================================================
    let { data: contacts } = await supabase
      .from("crm_contacts")
      .select("id, status")
      .eq("phone", phone)
      .order("created_at", { ascending: true })
      .limit(1);

    let contact = contacts && contacts.length > 0 ? contacts[0] : null;

    if (!contact) {
      const { data: newContact } = await supabase.from("crm_contacts").insert([{
        phone, name: pushName || "Sin nombre", source: "whatsapp", is_test: isTestNumber,
        ultimo_mensaje: content, ultimo_contacto: new Date().toISOString()
      }]).select("id, status").single();

      contact = newContact;

      if (contact) {
        await supabase.from("contact_events").insert([{
          contact_id: contact.id, tipo: "lead_entregado", descripcion: "Lead nuevo ingresado vía WhatsApp"
        }]);
      }
    } else {
      await supabase.from("crm_contacts").update({ 
        ultimo_mensaje: content, ultimo_contacto: new Date().toISOString() 
      }).eq("id", contact.id);
    }

    if (!contact) return; // Safety check

    // ==============================================================
    // 3. Registrar la conversación
    // ==============================================================
    await supabase.from("crm_conversations").insert([{
      contact_id: contact.id, direction: "inbound", type: "text",
      content: content || "", metadata: body.payload
    }]);

    // ==============================================================
    // 4. Delegar a la IA (Agrupación / Debouncing de 20s)
    // ==============================================================
    if (contact.status !== "humano") {
      // Ejecutamos la IA sincrónicamente para evitar que Vercel congele el proceso en background
      await executeAIForContact(contact.id, phone, from);
    }

  } catch (err: any) {
    console.error("Error crítico en proceso inmediato webhook:", err);
  }
}

async function processOutboundBackground(body: any) {
  try {
    const to = body.payload.to;
    const content = body.payload.body;
    const type = body.payload.type || body.payload._data?.type || "text";
    const phone = to.split("@")[0];

    let { data: contact } = await supabase.from("crm_contacts").select("id").eq("phone", phone).single();
    
    // Si es una campaña a contactos fríos que no están en el CRM, los creamos silenciosamente
    if (!contact) {
      const { data: newContact } = await supabase.from("crm_contacts").insert([{
        phone, name: "Campaña Masiva", source: "whatsapp", is_test: false,
        ultimo_mensaje: `[Enviado Físico]`, ultimo_contacto: new Date().toISOString()
      }]).select("id").single();
      contact = newContact;
      if (!contact) return; // Failsafe
    }

    const { data: veryRecentMsg } = await supabase
      .from("crm_conversations")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("direction", "outbound")
      .eq("content", content || "")
      .gte("created_at", new Date(Date.now() - 15000).toISOString())
      .limit(1);
      
    if (veryRecentMsg && veryRecentMsg.length > 0) return;

    await supabase.from("crm_conversations").insert([{
      contact_id: contact.id, direction: "outbound", type: type || "text",
      content: content || `[${(type || "multimedia").toUpperCase()}]`, metadata: { source: "physical_phone", payload: body.payload }
    }]);

    let isAutomatedGreeting = false;
    if (body.payload._data && body.payload._data.automatedGreetingMessageShown === true) {
      isAutomatedGreeting = true;
    }

    let updateData: any = {
      ultimo_contacto: new Date().toISOString(),
      ultimo_mensaje: `[Teléfono Físico] ${content ? content.substring(0, 30) : type}`,
      // Por defecto, si el humano interviene, pausamos el bot. Pero si es saludo automático de WA Business, lo dejamos en bot.
      status: isAutomatedGreeting ? "bot" : "humano"
    };

    // Auto-enrutamiento inteligente para Campañas Masivas
    // Si el texto saliente incluye el enlace a la demo, adelantamos al cliente a la etapa "Interesado" y mantenemos el bot
    if (content && typeof content === 'string') {
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes("demoavios") || lowerContent.includes("aviospre")) {
        updateData.current_step_id = "87f36164-3021-4dad-b3df-70d4a68f70ec"; // Interesado Avíos
        updateData.funnel_id = "c4b64445-23c1-4d06-83b4-02d48c2f28cc"; // Avíos
        updateData.status = "bot"; // Reactivamos el bot para la campaña
      } else if (lowerContent.includes("demoverdeos")) {
        updateData.current_step_id = "075a9dd0-a090-4335-af48-d2412026533d"; // Interesado VerdeOS
        updateData.funnel_id = "f268d949-4756-4171-98d6-25ef8ba91aa0"; // VerdeOS
        updateData.status = "bot"; // Reactivamos el bot para la campaña
      }
    }

    await supabase.from("crm_contacts").update(updateData).eq("id", contact.id);

  } catch (error) {
    console.error("Error sincronizando outbound:", error);
  }
}
