import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

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
      // Obtenemos el embudo principal (el primero que exista activo)
      const { data: mainFunnel } = await supabase.from("funnels").select("*").eq("activo", true).order("created_at", { ascending: true }).limit(1).single();
      
      if (mainFunnel) {
        // Obtenemos la etapa inicial (la de menor orden)
        const { data: firstStep } = await supabase.from("funnel_steps").select("*").eq("funnel_id", mainFunnel.id).order("orden", { ascending: true }).limit(1).single();

        const newContactResult = await supabase
          .from("crm_contacts")
          .insert([{ 
            phone, 
            funnel_id: mainFunnel.id, 
            current_step_id: firstStep ? firstStep.id : null,
            ultimo_mensaje: content,
            ultimo_contacto: new Date().toISOString()
          }])
          .select()
          .single();
        
        contact = newContactResult.data;
        isNewContact = true;
        
        // Registrar evento de lead nuevo
        await supabase.from("contact_events").insert([{
          contact_id: contact.id,
          tipo: "lead_entregado",
          descripcion: "Lead nuevo ingresado vía WhatsApp"
        }]);
      }
    } else {
      // Si ya existía, actualizamos fecha de último contacto
      await supabase.from("crm_contacts").update({ 
        ultimo_mensaje: content,
        ultimo_contacto: new Date().toISOString() 
      }).eq("id", contact.id);
    }

    // 2. Registrar la conversación en la tabla de auditoría (Phase 2)
    const { error: insertError } = await supabase.from("crm_conversations").insert([{
      contact_id: contact.id,
      direction: "inbound",
      type: type === "chat" || !type ? "text" : type,
      content: content || "Multimedia",
      metadata: body.payload
    }]);

    if (insertError) {
      console.error("Error guardando inbound en crm_conversations:", insertError);
    }

    // 3. Funnel Engine Lógico (Respuestas automáticas)
    // Si el contacto recién fue creado, le enviamos la plantilla de la etapa 1
    if (isNewContact && contact.current_step_id) {
      const { data: template } = await supabase
        .from("bot_templates")
        .select("*")
        .eq("step_id", contact.current_step_id)
        .eq("activo", true)
        .single();
      
      if (template && template.mensaje) {
        // Enviar respuesta por WAHA usando el ID exacto que nos llegó (ej: @lid o @c.us)
        const sendResult = await sendWahaMessage(from, template.mensaje);
        
        // Guardar la respuesta saliente en la base de datos
        await supabase.from("crm_conversations").insert([{
          contact_id: contact.id,
          direction: "outbound",
          type: "text",
          content: sendResult.success ? template.mensaje : `[ERROR WAHA] Falló el envío: ${sendResult.error}\n\nMensaje original: ${template.mensaje}`,
          metadata: { template_id: template.id, sendResult }
        }]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error procesando webhook:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
