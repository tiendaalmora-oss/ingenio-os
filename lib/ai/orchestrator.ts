export type TaskType = 'HEAVY_CODE' | 'COPYWRITING' | 'DATA_EXTRACTION' | 'QUICK_FIX';

export type CognitivePriority = 'speed' | 'quality' | 'cost';

export interface CognitiveEngineOptions {
  taskType: TaskType;
  priority?: CognitivePriority;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  format?: 'json' | 'text' | 'html';
}

// ------------------------------------------------------------------
// Enrutamiento cognitivo: ¿Qué modelos usamos para qué?
// ------------------------------------------------------------------
const ROUTING_TABLE: Record<TaskType, string[]> = {
  // Heavy Code: Priorizamos razonamiento profundo y ventanas grandes.
  HEAVY_CODE: [
    "anthropic/claude-3.5-sonnet", // The best for heavy code
    "deepseek/deepseek-chat",      // Cheaper and highly capable fallback
    "google/gemini-1.5-pro"        // 8k output native fallback
  ],
  // Copywriting: Textos emocionales, creativos, humanos.
  COPYWRITING: [
    "openai/gpt-4o-mini",          // Excellent text nuances
    "google/gemini-1.5-flash",     // Very fast text generation
    "anthropic/claude-3-haiku"     // Fast and human-like
  ],
  // Data Extraction: Parsing, JSON structuration, categorizing.
  DATA_EXTRACTION: [
    "google/gemini-1.5-flash",     // Fast and structured
    "openai/gpt-4o-mini"           // Reliable JSON output
  ],
  // Quick Fixes: Pequeñas modificaciones, CSS, scripts rápidos.
  QUICK_FIX: [
    "deepseek/deepseek-chat",      // Coding capable but fast
    "google/gemini-1.5-flash"
  ]
};

/**
 * Limpia la respuesta en caso de que los LLMs agreguen markdown (```json o ```html)
 */
function sanitizeResponse(content: string, format: 'json' | 'text' | 'html'): string {
  let cleaned = content.trim();
  
  if (format === 'json') {
    if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "");
    else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
    return cleaned.trim();
  }
  
  if (format === 'html') {
    if (cleaned.startsWith("```html")) cleaned = cleaned.replace(/^```html/, "").replace(/```$/, "");
    else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
    return cleaned.trim();
  }

  return cleaned;
}

/**
 * Cognitive Gateway Principal
 * El resto de la app llama a este endpoint interno y se desliga del proveedor.
 */
export async function invokeCognitiveEngine(options: CognitiveEngineOptions): Promise<string> {
  // TODO: En un futuro, aquí podríamos agregar lógica para desviar a un proveedor local (Ollama)
  // si un flag process.env.USE_LOCAL_LLM está encendido.
  
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  if (!OPENROUTER_API_KEY) {
    throw new Error("El Orquestador no encontró la clave de OpenRouter (OPENROUTER_API_KEY).");
  }

  // 1. Obtener la ruta de modelos según el tipo de tarea
  let modelRoute = ROUTING_TABLE[options.taskType];

  // 2. Ajustes de seguridad por formato
  let internalSystemPrompt = options.systemPrompt;
  if (options.format === 'html' && options.taskType === 'HEAVY_CODE') {
    internalSystemPrompt += `\n\nCRÍTICO: DEBES DEVOLVER EL CÓDIGO COMPLETO SIN CORTARLO. Asegúrate de llegar hasta la etiqueta </html> final. No uses placeholders. Devuelve SOLO código, sin explicaciones.`;
  }
  if (options.format === 'json') {
    internalSystemPrompt += `\n\nCRÍTICO: Devuelve ÚNICAMENTE un JSON válido. Sin explicaciones previas ni posteriores.`;
  }

  // 3. Configurar petición al proveedor principal (Actualmente OpenRouter con Auto-Fallback)
  // OpenRouter permite enviar un array "models" y procesará la petición en cascada si el primero falla (Rate limit, Down, etc).
  const payload = {
    models: modelRoute,
    route: "fallback", // Habilita el fallback nativo inteligente
    messages: [
      { role: "system", content: internalSystemPrompt },
      { role: "user", content: options.userPrompt }
    ],
    temperature: options.temperature ?? 0.5,
    max_tokens: options.maxTokens ?? 8000,
  };

  console.log(`🧠 [Orchestrator] Lanzando tarea: ${options.taskType} | Format: ${options.format || 'text'}`);
  console.log(`🛤️ [Orchestrator] Routing: ${modelRoute.join(" -> ")}`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://os.ingeniodigital.shop",
      "X-Title": "Ingenio OS Cognitive Engine",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ [Orchestrator] Falla crítica en todos los modelos de la ruta:", errorText);
    throw new Error(`Orchestrator Exception: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "";

  // 4. Limpieza centralizada de salida
  const finalContent = sanitizeResponse(rawContent, options.format || 'text');
  
  return finalContent;
}
