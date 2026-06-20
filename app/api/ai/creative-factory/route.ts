import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { step, context } = await req.json();

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3-haiku";

    let systemPrompt = "Eres un director creativo experto en Meta Ads y TikTok Ads para software micro-SaaS. Devuelves EXCLUSIVAMENTE un JSON válido con un array de strings bajo la clave 'results'. Ningún otro texto.";
    let userPrompt = "";

    switch (step) {
      case "hooks":
        userPrompt = `Genera 20 'Hooks' (Ganchos de 3-5 segundos) para anuncios de video basados en esta oferta: ${context.offer} y este problema: ${context.pain_point}. Tienen que ser sumamente atractivos, polarizantes o contraintuitivos para detener el scroll. Retorna el formato {"results": ["hook1", "hook2", ...]}`;
        break;
      case "images":
        userPrompt = `Basado en los siguientes hooks ganadores seleccionados por el director: ${JSON.stringify(context.selected_hooks)}. Genera 5 conceptos creativos de imágenes o posters publicitarios que ilustren perfectamente estas ideas. Retorna el formato {"results": ["concepto1", "concepto2", ...]}`;
        break;
      case "scripts":
        userPrompt = `Basado en la oferta base y estos conceptos aprobados: ${JSON.stringify(context.selected_images)}. Genera 3 guiones de video cortos (Short Video Scripts de 30-45s). Cada guión debe tener: Hook visual + Hook hablado + Problema + Solución (Oferta) + Call to Action. Retorna el formato {"results": ["Guion 1: ...", "Guion 2: ...", "Guion 3: ..."]}`;
        break;
      default:
        return NextResponse.json({ success: false, error: "Step no válido" }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        response_format: { type: "json_object" }, // Force JSON mode
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.statusText}`);
    }

    const data = await response.json();
    let text = data.choices[0]?.message?.content || "";
    
    // Attempt to parse JSON safely
    let results = [];
    try {
      const parsed = JSON.parse(text);
      results = parsed.results || [];
    } catch (e) {
      // Fallback if the LLM didn't return perfect JSON
      console.warn("Fallo al parsear JSON, intentando extraer líneas...", text);
      results = text.split('\n').filter((l: string) => l.trim().length > 5);
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Error generating creatives:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
