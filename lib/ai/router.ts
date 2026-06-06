export async function classifyGlobalIntent(
  funnels: any[],
  userMessage: string
): Promise<string | null> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  const rawModel = process.env.OPENROUTER_MODEL || "";
  const DEFAULT_MODEL = rawModel.trim().replace(/\.+$/, "") || "openai/gpt-4o-mini";

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY no configurada");
  }

  // Preparamos la lista de embudos disponibles para la IA
  const funnelsList = funnels.map(f => `- ID: "${f.id}" | Nombre: "${f.nombre}" | Producto/Servicio: "${f.producto || f.descripcion}"`).join("\n");

  const systemPrompt = `Eres un Enrutador Inteligente (Router AI) de atención al cliente.
Tu trabajo es leer el primer mensaje de un cliente nuevo y decidir a cuál de nuestros embudos (funnels) de venta o soporte corresponde, devolviendo únicamente el ID del embudo en formato JSON.

EMBUDOS DISPONIBLES:
${funnelsList}

REGLAS ESTRICTAS:
1. Analiza el mensaje del usuario.
2. Si el mensaje menciona explícitamente algún producto, servicio o intención que coincide con alguno de los embudos disponibles, devuelve su ID.
3. Si el usuario solo dice "Hola", "Buen día" o manda un mensaje genérico sin especificar qué quiere, devuelve null.
4. Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido, sin formato markdown (\`\`\`json).

Formato de Respuesta JSON esperado:
{
  "funnel_id": "ID-DEL-EMBUDO" // o null si no se entiende la intención
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
    return result.funnel_id || null;
  } catch (e) {
    console.error("Error parseando respuesta JSON del Router:", rawContent);
    return null;
  }
}
