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

export async function downloadWahaMedia(messageId: string): Promise<Buffer | null> {
  try {
    const wahaUrlBase = WAHA_URL.replace(/\/+$/, '');
    const res = await fetch(`${wahaUrlBase}/api/${WAHA_SESSION}/messages/${encodeURIComponent(messageId)}/download`, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        ...(WAHA_API_KEY ? { "X-Api-Key": WAHA_API_KEY } : {})
      }
    });
    if (!res.ok) {
      console.error("Error al descargar media de WAHA:", await res.text());
      return null;
    }
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
  } catch (err) {
    console.error("Excepción al descargar media de WAHA:", err);
    return null;
  }
}

export async function transcribeAudio(buffer: Buffer): Promise<string | null> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY no configurada");
    return null;
  }

  try {
    const blob = new Blob([buffer as any], { type: "audio/ogg" });
    const formData = new FormData();
    formData.append("file", blob, "audio.ogg");
    formData.append("model", "whisper-large-v3-turbo");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: formData
    });

    if (!res.ok) {
      console.error("Error Groq Whisper:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.text;
  } catch (err) {
    console.error("Excepción en Groq Whisper:", err);
    return null;
  }
}

export function interpolateTemplate(text: string, contact: any): string {
  return text
    .replace(/\{nombre\}/gi, contact.name || "")
    .replace(/\{name\}/gi, contact.name || "")
    .replace(/\{telefono\}/gi, contact.phone || "")
    .replace(/\{phone\}/gi, contact.phone || "");
}
