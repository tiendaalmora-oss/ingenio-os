export async function classifyGlobalIntent(
  funnels: any[],
  userMessage: string
): Promise<{ action: string, funnel_id: string | null }> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  const rawModel = process.env.OPENROUTER_MODEL || "";
  let DEFAULT_MODEL = rawModel.trim().replace(/\.+$/, "") || "anthropic/claude-3-haiku";
  if (DEFAULT_MODEL.includes("claude-3.5-sonnet") || DEFAULT_MODEL.includes("gemini")) {
    DEFAULT_MODEL = "anthropic/claude-3-haiku";
  }

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY no configurada");
  }

  // Preparamos la lista de embudos disponibles para la IA
  const funnelsList = funnels.map(f => `- ID: "${f.id}" | Nombre: "${f.nombre}" | Producto/Servicio: "${f.producto || f.descripcion}"`).join("\n");

  const systemPrompt = `Eres un Enrutador Inteligente (Router AI) de atención al cliente.
Tu trabajo es leer el primer mensaje de un cliente nuevo y decidir cuál es la acción correcta, devolviendo ÚNICAMENTE un JSON válido.

EMBUDOS DISPONIBLES:
${funnelsList}

REGLAS ESTRICTAS:
1. ENRUTAMIENTO INTELIGENTE: Si el mensaje menciona interés, hace una pregunta de ventas, o usa palabras relacionadas a los embudos (ej. "quiero la demo", "verdes", "pollo", "verdulería", "balanza"), o tiene errores de tipeo, deduce el embudo correcto y devuelve action="funnel" y su funnel_id.
2. Si el usuario SOLO saluda ("Hola", "Buen día") sin especificar NADA, devuelve action="generic" y funnel_id=null.
3. SOLO deriva a humano (action="human") si es claramente un cliente existente con un problema técnico, reclamo, falla, o una queja explícita. No uses "human" para consultas de ventas mal escritas.
4. Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido, sin markdown.

Formato de Respuesta JSON esperado:
{
  "action": "funnel" | "generic" | "human",
  "funnel_id": "ID-DEL-EMBUDO" // O null
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://os.ingeniodigital.shop",
      "X-Title": "Ingenio OS Router",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1, // Baja temperatura para decisiones de enrutamiento estrictas
      max_tokens: 150,
      response_format: { type: "json_object" } 
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Error OpenRouter Router:", errText);
    throw new Error("Fallo en la conexión con la IA de enrutamiento");
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
      action: result.action || "generic",
      funnel_id: result.funnel_id || null
    };
  } catch (e) {
    console.error("Error parseando respuesta JSON del Router:", rawContent);
    return { action: "generic", funnel_id: null };
  }
}
