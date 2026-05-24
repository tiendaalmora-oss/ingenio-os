import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const rawModel = process.env.OPENROUTER_MODEL || "";
const DEFAULT_MODEL = rawModel.trim().replace(/\.+$/, "") || "openai/gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const { code, instruction } = await req.json();

    if (!code || !instruction) {
      return NextResponse.json(
        { success: false, error: "El código fuente y las instrucciones son obligatorios." },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY no configurada en el servidor" },
        { status: 500 }
      );
    }

    const systemPrompt = `Eres un Desarrollador Senior Experto. 
Tu tarea es modificar el código fuente proporcionado exactamente como pide el usuario.
- Analiza el código actual.
- Aplica las modificaciones de forma limpia, eficiente y manteniendo la estructura existente.
- Tu respuesta debe contener ÚNICAMENTE EL CÓDIGO FINAL MODIFICADO.
- NO incluyas ninguna explicación, ni texto antes ni después.
- NO uses bloques de formato markdown como \`\`\`html o \`\`\`javascript. Simplemente devuelve el código puro tal cual para que el sistema lo pueda sobreescribir directamente.`;

    const userPrompt = `INSTRUCCIONES DEL USUARIO:
${instruction}

CÓDIGO ACTUAL:
${code}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://os.ingeniodigital.shop",
        "X-Title": "Ingenio OS Code Editor",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error de OpenRouter: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let newCode = data.choices?.[0]?.message?.content || "";

    if (!newCode) {
      throw new Error("La IA devolvió una respuesta vacía.");
    }

    // Por seguridad, si el modelo terco aún así manda formato markdown, se lo limpiamos:
    newCode = newCode.trim();
    if (newCode.startsWith("\`\`\`html")) {
      newCode = newCode.replace(/^\`\`\`html/, "").replace(/\`\`\`$/, "").trim();
    } else if (newCode.startsWith("\`\`\`js") || newCode.startsWith("\`\`\`javascript")) {
      newCode = newCode.replace(/^\`\`\`[a-z]*/, "").replace(/\`\`\`$/, "").trim();
    } else if (newCode.startsWith("\`\`\`")) {
      newCode = newCode.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    return NextResponse.json({ success: true, newCode });
  } catch (err: any) {
    console.error("Error AI editing code:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error interno de la IA." },
      { status: 500 }
    );
  }
}
