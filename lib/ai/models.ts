import { TaskType } from './types';

/**
 * Model Registry Centralizado
 * Todos los IDs aquí son validados y verificados contra los proveedores.
 */
export const AI_MODELS = {
  // === OPENROUTER MODELS ===
  // Claude Family
  CLAUDE_3_5_SONNET: "anthropic/claude-3.5-sonnet",
  CLAUDE_3_HAIKU: "anthropic/claude-3-haiku",
  
  // DeepSeek Family (Excelente balance calidad/precio)
  DEEPSEEK_CHAT: "deepseek/deepseek-chat", // DeepSeek V3
  DEEPSEEK_CODER: "deepseek/deepseek-coder",
  
  // Google Gemini Family
  GEMINI_1_5_FLASH: "google/gemini-1.5-flash",
  GEMINI_1_5_PRO: "google/gemini-1.5-pro-latest", // ID Corregido
  
  // OpenAI Family
  GPT_4O_MINI: "openai/gpt-4o-mini",
  GPT_4O: "openai/gpt-4o",

  // === LOCAL OLLAMA MODELS ===
  OLLAMA_LLAMA_3: "llama3",
  OLLAMA_CODE_LLAMA: "codellama",
  OLLAMA_MISTRAL: "mistral"
} as const;

export type ValidModelId = typeof AI_MODELS[keyof typeof AI_MODELS];

/**
 * Tablas de Enrutamiento (Routing Tables)
 * Define qué modelos intentar en cascada según el tipo de tarea.
 */
export const ROUTING_TABLE: Record<TaskType, ValidModelId[]> = {
  HEAVY_CODE: [
    AI_MODELS.DEEPSEEK_CHAT,
    AI_MODELS.GPT_4O_MINI,
    AI_MODELS.GEMINI_1_5_FLASH
  ],
  COPYWRITING: [
    AI_MODELS.GPT_4O_MINI,
    AI_MODELS.DEEPSEEK_CHAT
  ],
  DATA_EXTRACTION: [
    AI_MODELS.GEMINI_1_5_FLASH,
    AI_MODELS.GPT_4O_MINI
  ],
  QUICK_FIX: [
    AI_MODELS.DEEPSEEK_CHAT,
    AI_MODELS.GEMINI_1_5_FLASH
  ],
  
  // Creative Lab Stubs (Future-proofing)
  CREATIVE_RENDER: [AI_MODELS.GPT_4O],
  IMAGE_VARIATION: [AI_MODELS.GPT_4O],
  VIDEO_SCRIPTING: [AI_MODELS.GPT_4O_MINI, AI_MODELS.DEEPSEEK_CHAT],
  HOOK_GENERATION: [AI_MODELS.CLAUDE_3_HAIKU, AI_MODELS.GEMINI_1_5_FLASH],
  AD_ANALYSIS: [AI_MODELS.GPT_4O_MINI, AI_MODELS.DEEPSEEK_CHAT],
  VISUAL_STYLE_TRANSFER: [AI_MODELS.GPT_4O]
};
