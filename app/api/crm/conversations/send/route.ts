import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

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
    
    const rawText = await res.text();
    
    if (!res.ok) {
      console.error("Error al enviar mensaje por WAHA:", rawText);
      return { success: false, error: `HTTP ${res.status}: ${rawText}`, debugUrl: wahaUrlBase };
    }
    return { success: true, debug: rawText, debugUrl: wahaUrlBase };
  } catch (error: any) {
    console.error("Excepción enviando por WAHA:", error);
    return { success: false, error: error.message };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contact_id, message } = body;

    if (!contact_id || !message) {
      return NextResponse.json({ success: false, error: "Falta contact_id o message" }, { status: 400 });
    }

    // Obtener el número de teléfono del contacto
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select("phone, status")
      .eq("id", contact_id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ success: false, error: "Contacto no encontrado" }, { status: 404 });
    }

    // Encontrar el ID exacto de chat (para manejar @lid o @g.us)
    const { data: lastInbound } = await supabase
      .from("crm_conversations")
      .select("metadata")
      .eq("contact_id", contact_id)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let exactChatId = contact.phone;
    if (lastInbound && lastInbound.metadata && lastInbound.metadata.from) {
      exactChatId = lastInbound.metadata.from;
    }

    // Enviar el mensaje por WAHA usando el ID exacto
    const sendResult = await sendWahaMessage(exactChatId, message);

    // Registrar el mensaje en la base de datos
    const { data: convData, error: insertError } = await supabase.from("crm_conversations").insert([{
      contact_id: contact_id,
      direction: "outbound",
      type: "text",
      content: sendResult.success ? message : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
      metadata: { source: "crm_manual", sendResult }
    }]).select().single();

    if (insertError) throw insertError;

    // Si el contacto estaba en modo "bot", quizás queramos pasarlo a "humano" automáticamente
    // ya que un humano acaba de intervenir.
    if (contact.status !== 'humano' && sendResult.success) {
      await supabase.from("crm_contacts").update({ status: 'humano' }).eq("id", contact_id);
      await supabase.from("contact_events").insert([{
        contact_id: contact_id,
        tipo: "escalado_humano",
        descripcion: "Escalado automáticamente porque un agente intervino desde el CRM"
      }]);
    }

    return NextResponse.json({ success: true, conversation: convData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
