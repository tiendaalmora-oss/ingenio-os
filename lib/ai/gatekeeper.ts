export async function evaluateGatekeeper(
  chatHistory: any[],
  currentStep: any,
  userMessage: string
): Promise<{ accion: "avanzar" | "responder" | "humano"; respuesta_ia: string }> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  const rawModel = process.env.OPENROUTER_MODEL || "";
  let DEFAULT_MODEL = rawModel.trim().replace(/\.+$/, "") || "anthropic/claude-3.5-sonnet";
  if (DEFAULT_MODEL.includes("gemini")) {
    DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";
  }

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY no configurada");
  }

  // Preparamos el historial reciente (últimos 10 mensajes) para no exceder tokens
  const recentHistory = chatHistory.slice(-10).map((msg) => ({
    role: msg.direction === "inbound" ? "user" : "assistant",
    content: msg.content,
  }));

  const funnel = currentStep.funnels || {};
  const kbSection = funnel.knowledge_base ? `\n\nBASE DE CONOCIMIENTO EXPERTO (USA ESTO PARA RESPONDER DUDAS TÉCNICAS):\n${funnel.knowledge_base}` : "";
  const promptSection = funnel.bot_prompt ? `\n\nPERSONALIDAD DEL BOT:\n${funnel.bot_prompt}` : "";

  const systemPrompt = `Eres un "Guardián de Embudo" (Gatekeeper IA) de ventas y Experto de Producto.
Tu trabajo principal es interpretar la intención del cliente, responder sus dudas con precisión, y guiarlo hacia el OBJETIVO de la etapa actual.
${promptSection}

ESTÁS EN LA ETAPA: ${currentStep.name}
OBJETIVO DE ESTA ETAPA PARA AVANZAR: ${currentStep.ai_goal || "El cliente debe mostrar interés genuino para avanzar."}
INTENCIONES VÁLIDAS PARA AVANZAR: ${currentStep.ai_valid_intents || "Ninguna especificada."}
PREGUNTAS FRECUENTES (FAQ de Etapa): ${currentStep.ai_faq || "Ninguna especificada."}${kbSection}

REGLAS ESTRICTAS:
1. Analiza el último mensaje del usuario.
2. ¿Cumple el OBJETIVO de esta etapa? 
   - SI CUMPLE: Responde ÚNICAMENTE con accion="avanzar" y respuesta_ia="". NO agregues texto extra.
   - NO CUMPLE (ej. hizo una pregunta válida): Responde usando la Base de Conocimiento Experto o FAQ. Resuelve su duda, sé empático y estructurado, y vuelve a anclar al usuario hacia el OBJETIVO. Usa accion="responder".
   - REQUIERE HUMANO INEVITABLE (ej. algo que NO está en la Base de Conocimiento, reclamo, insultos): Responde con accion="humano" y respuesta_ia="".
3. NO inventes información, precios, ni promociones. Usa SOLO la Base de Conocimiento o la FAQ.
4. Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido, sin formato markdown (\`\`\`json).

Formato de Respuesta JSON esperado:
{
  "accion": "avanzar" | "responder" | "humano",
  "respuesta_ia": "Texto de tu respuesta (vacío si es avanzar o humano)"
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://os.ingeniodigital.shop",
      "X-Title": "Ingenio OS Gatekeeper",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: userMessage }
      ],
      temperature: 0.1, // Baja temperatura para decisiones lógicas estrictas
      max_tokens: 500,
      response_format: { type: "json_object" } // Fuerza a que la respuesta sea un JSON válido (soportado por gpt-4o-mini y claude)
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Error OpenRouter Gatekeeper:", errText);
    throw new Error("Fallo en la conexión con la IA");
  }

  const data = await response.json();
  let rawContent = data.choices?.[0]?.message?.content || "{}";

  // Limpiar posible markdown
  rawContent = rawContent.trim();
  if (rawContent.startsWith("\`\`\`json")) {
    rawContent = rawContent.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
  } else if (rawContent.startsWith("\`\`\`")) {
    rawContent = rawContent.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
  }

  try {
    const result = JSON.parse(rawContent);
    return {
      accion: result.accion || "responder",
      respuesta_ia: result.respuesta_ia || ""
    };
  } catch (e) {
    console.error("Error parseando respuesta JSON del Gatekeeper:", rawContent);
    return { accion: "responder", respuesta_ia: "Por favor, aguardá un momento. ¿En qué más puedo ayudarte?" };
  }
}
