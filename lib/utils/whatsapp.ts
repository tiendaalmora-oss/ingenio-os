// lib/utils/whatsapp.ts

const WAHA_URL = process.env.WAHA_URL || "http://localhost:3000";
const WAHA_SESSION = process.env.WAHA_SESSION || "default";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

export const ADVANCE_KEYWORDS = [
  "sí", "si", "dale", "ok", "okey", "bueno", "está bien", "esta bien",
  "quiero", "pasame", "pasá", "mandame", "mandá", "adelante", "claro",
  "me interesa", "interesado", "interesada", "de acuerdo", "perfecto",
  "excelente", "genial", "listo", "va", "vamos", "por favor", "please"
];

export async function sendWahaMessage(chatId: string, text: string) {
  try {
    // Retraso artificial para simular tipeo humano
    await new Promise(resolve => setTimeout(resolve, 3000));

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

export function hasAdvanceIntent(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return ADVANCE_KEYWORDS.some(kw => lower.includes(kw));
}

export function interpolateTemplate(text: string, contact: any): string {
  return text
    .replace(/\{nombre\}/gi, contact.name || "")
    .replace(/\{name\}/gi, contact.name || "")
    .replace(/\{telefono\}/gi, contact.phone || "")
    .replace(/\{phone\}/gi, contact.phone || "");
}
