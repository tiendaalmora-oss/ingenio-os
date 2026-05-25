import { 
  CognitiveEngineOptions, 
  TaskType, 
  StructuredLog, 
  CognitiveTelemetry, 
  ProviderType 
} from './types';
import { ROUTING_TABLE, ValidModelId } from './models';

/**
 * Genera un ID único para la telemetría de cada tarea
 */
const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
 * Sistema de Logging Estructurado (Base para futura BD de telemetría)
 */
function logTelemetry(telemetry: CognitiveTelemetry) {
  const { log } = telemetry;
  const icon = log.status === 'SUCCESS' ? '✅' : (log.status === 'PARTIAL_FAILURE' ? '⚠️' : '❌');
  console.log(`${icon} [Orchestrator] Task ${log.taskId} | ${log.taskType} | ${log.modelUsed} | ${log.latencyMs.toFixed(0)}ms | Fallbacks: ${log.fallbackCount}`);
  if (log.errorDetail) {
    console.warn(`   ↳ Info: ${log.errorDetail}`);
  }
  // TODO: Insertar log en base de datos (Ej: tabla 'ai_telemetry' en Supabase) para el Health Scoring
}

/**
 * Cognitive Gateway Principal con Smart Retry Loop
 * Abstrae a los Providers y maneja el fallback programáticamente.
 */
export async function invokeCognitiveEngine(options: CognitiveEngineOptions): Promise<string> {
  const taskId = generateTaskId();
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  
  if (!OPENROUTER_API_KEY) {
    throw new Error("El Orquestador no encontró la clave de OpenRouter (OPENROUTER_API_KEY).");
  }

  // 1. Obtener la ruta de modelos según el tipo de tarea
  const modelRoute: ValidModelId[] = ROUTING_TABLE[options.taskType];
  
  if (!modelRoute || modelRoute.length === 0) {
    throw new Error(`[Orchestrator] No hay modelos configurados para la tarea ${options.taskType}`);
  }

  // 2. Ajustes de seguridad por formato
  let internalSystemPrompt = options.systemPrompt;
  if (options.format === 'html' && options.taskType === 'HEAVY_CODE') {
    internalSystemPrompt += `\n\nCRÍTICO: DEBES DEVOLVER EL CÓDIGO COMPLETO SIN CORTARLO. Asegúrate de llegar hasta la etiqueta </html> final. No uses placeholders. Devuelve SOLO código, sin explicaciones.`;
  }
  if (options.format === 'json') {
    internalSystemPrompt += `\n\nCRÍTICO: Devuelve ÚNICAMENTE un JSON válido. Sin explicaciones previas ni posteriores.`;
  }

  let fallbackCount = 0;
  let lastError = "";

  // 3. Smart Retry Loop (Fallback Programático)
  for (let i = 0; i < modelRoute.length; i++) {
    const currentModel = modelRoute[i];
    const startTime = performance.now();
    
    try {
      console.log(`🧠 [Orchestrator] Lanzando tarea: ${options.taskType} | Intentando modelo: ${currentModel} (Intento ${i + 1}/${modelRoute.length})`);
      
      const payload = {
        model: currentModel,
        messages: [
          { role: "system", content: internalSystemPrompt },
          { role: "user", content: options.userPrompt }
        ],
        temperature: options.temperature ?? 0.5,
        max_tokens: options.maxTokens ?? 8000,
      };

      // TODO: En el futuro, si currentModel es de Ollama (ej. "ollama/llama3"), 
      // hacer fetch a http://localhost:11434 en su lugar mediante un Provider Abstraction.
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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || "";
      const latency = performance.now() - startTime;
      const tokens = data.usage?.total_tokens || 0;

      const telemetry: CognitiveTelemetry = {
        log: {
          taskId,
          taskType: options.taskType,
          provider: 'openrouter',
          modelUsed: data.model || currentModel,
          latencyMs: latency,
          tokensUsed: tokens,
          fallbackCount,
          status: fallbackCount > 0 ? 'PARTIAL_FAILURE' : 'SUCCESS',
          timestamp: new Date().toISOString()
        },
        rawResponse: data
      };
      logTelemetry(telemetry);

      // 4. Limpieza centralizada de salida
      return sanitizeResponse(rawContent, options.format || 'text');

    } catch (error: any) {
      const latency = performance.now() - startTime;
      lastError = error.message;
      fallbackCount++;
      
      console.warn(`⚠️ [Orchestrator] Falló modelo '${currentModel}' tras ${latency.toFixed(0)}ms: ${lastError}`);
      
      // Si quedan más modelos en la lista, el loop continuará con el siguiente.
      if (i < modelRoute.length - 1) {
        console.log(`🔄 [Orchestrator] Activando fallback programático -> Intentando con: ${modelRoute[i + 1]}`);
      }
    }
  }

  // 5. Si el bucle termina y todos fallaron, lanzamos Critical Failure
  const finalTelemetry: CognitiveTelemetry = {
    log: {
      taskId,
      taskType: options.taskType,
      provider: 'openrouter',
      modelUsed: 'ALL_FAILED',
      latencyMs: 0,
      fallbackCount,
      status: 'CRITICAL_FAILURE',
      errorDetail: lastError,
      timestamp: new Date().toISOString()
    }
  };
  logTelemetry(finalTelemetry);
  
  throw new Error(`[Orchestrator] Todos los modelos en la ruta fallaron. Último error: ${lastError}`);
}
