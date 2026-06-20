import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { promptType, context } = await req.json();

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3-haiku";

    let systemPrompt = "Eres un experto copywriter de respuesta directa y creador de ofertas SaaS.";
    let userPrompt = "";

    switch (promptType) {
      case "pain_points":
        userPrompt = `Genera los 3 dolores (pain points) principales y más dolorosos para el nicho: ${context.niche}. Sé extremadamente específico, no uses lenguaje genérico. Entrégalo en 3 viñetas cortas.`;
        break;
      case "offer":
        userPrompt = `Basado en este nicho: ${context.niche} y estos dolores: ${context.painPoints}. Crea una OFERTA IRRESISTIBLE para un software micro-SaaS. Debe tener un nombre, una promesa contundente en 1 línea, y un precio sugerido (Ej: pago único).`;
        break;
      case "promise":
        userPrompt = `Basado en esta oferta: ${context.offer}. Escribe 3 promesas secundarias o beneficios clave que el usuario obtendrá inmediatamente al instalar el software.`;
        break;
      case "hooks":
        userPrompt = `Crea 3 "Hooks" (Ganchos) para anuncios de Meta Ads enfocados en el nicho ${context.niche} y la oferta: ${context.offer}. Deben ser preguntas disruptivas o afirmaciones polémicas que detengan el scroll.`;
        break;
      case "whatsapp":
        userPrompt = `Escribe el primer mensaje (Apertura) que enviará un bot de WhatsApp cuando un lead pregunte por esta oferta: ${context.offer}. Debe ser corto, empático y terminar con una pregunta de calificación. Usa el "vos" argentino.`;
        break;
      case "landing":
        userPrompt = `Redacta el copy de la Landing Page para esta oferta: ${context.offer}. Estructura: Titular (H1), Subtítulo, 3 Beneficios, Garantía. Breve y directo al grano.`;
        break;
      case "ad_script":
        userPrompt = `Escribe un guión de Video Sales Letter (VSL) de 30 segundos basado en estos hooks: ${context.hooks} y esta oferta: ${context.offer}. Estructura: Gancho (0-5s), Problema (5-15s), Solución (15-25s), Llamado a la acción (25-30s).`;
        break;
      default:
        userPrompt = "Genera un texto persuasivo.";
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
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
    const text = data.choices[0]?.message?.content || "";

    return NextResponse.json({ success: true, text });

  } catch (error: any) {
    console.error("Error generating copy:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
