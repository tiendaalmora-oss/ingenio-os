export async function classifyGlobalIntent(
  funnels: any[],
  userMessage: string
): Promise<{ action: string, funnel_id: string | null }> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  const rawModel = process.env.OPENROUTER_MODEL || "";
  const DEFAULT_MODEL = rawModel.trim().replace(/\.+$/, "") || "openai/gpt-4o-mini";

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
1. Si el mensaje menciona explícitamente interés en algún producto o servicio de los embudos disponibles (ej. "quiero la demo", "info de avios"), devuelve action="funnel" y el funnel_id correspondiente.
2. Si el usuario solo dice "Hola", "Buen día" o manda un mensaje genérico sin especificar NADA, devuelve action="generic" y funnel_id=null.
3. Si el cliente plantea un problema técnico, soporte, pagos, "necesito licencia", o cualquier consulta puntual QUE NO SEA UN EMBUDO DE VENTA, devuelve action="human" y funnel_id=null.
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
