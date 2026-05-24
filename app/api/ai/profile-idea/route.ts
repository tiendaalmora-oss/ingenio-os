import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";

export async function POST(req: Request) {
  try {
    const { title, niche } = await req.json();

    if (!title || !niche) {
      return NextResponse.json(
        { success: false, error: "Título y Nicho son obligatorios" },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY no configurada en el servidor" },
        { status: 500 }
      );
    }

    const systemPrompt = `Eres el Director Creativo de Ingenio OS, una plataforma de validación ultra rápida de productos (SaaS e info-productos tipo VerdePro).
Tu tarea es tomar una idea de producto y su nicho y perfilar el ecosistema de validación comercial.
Debes devolver obligatoriamente un objeto JSON con la siguiente estructura:
{
  "avatar": "Perfil detallado del comprador ideal (avatar) en 2-3 oraciones enfocadas en su perfil psicológico y operativo.",
  "pain_points": ["Dolor de cabeza principal 1", "Dolor de cabeza principal 2", "Dolor de cabeza principal 3"],
  "desires": ["Deseo principal 1", "Deseo principal 2", "Deseo principal 3"],
  "offer": "Una oferta irresistible y promesa principal agresiva para la landing (ej: 'Consigue X en Y tiempo sin Z').",
  "product_description": "Breve descripción comercial del producto digital que se entregará (ej: 'Guía práctica con plantillas listas para usar que automatizan el stock')."
}
Responde únicamente con el objeto JSON válido. No agregues texto adicional antes o después del JSON.`;

    const userPrompt = `Idea: "${title}"\nNicho: "${niche}"`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://os.ingeniodigital.shop",
        "X-Title": "Ingenio OS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error de OpenRouter: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("La IA devolvió una respuesta vacía.");
    }

    const profileData = JSON.parse(content);
    return NextResponse.json({ success: true, profile: profileData });
  } catch (err: any) {
    console.error("Error profiling idea:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al perfilar la idea" },
      { status: 500 }
    );
  }
}
