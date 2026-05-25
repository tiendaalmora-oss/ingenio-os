/**
 * Cognitive Infrastructure Layer
 * Tipos e Interfaces principales
 */

export type TaskType = 
  // Base Web OS
  | 'HEAVY_CODE' 
  | 'COPYWRITING' 
  | 'DATA_EXTRACTION' 
  | 'QUICK_FIX'
  
  // Creative Lab & Multimedia (Local/Hybrid)
  | 'CREATIVE_RENDER'
  | 'IMAGE_VARIATION'
  | 'VIDEO_SCRIPTING'
  | 'HOOK_GENERATION'
  | 'AD_ANALYSIS'
  | 'VISUAL_STYLE_TRANSFER';

export type CognitivePriority = 'speed' | 'quality' | 'cost';
export type ProviderType = 'openrouter' | 'ollama' | 'antigravity' | 'codex' | 'local_worker';

export interface CognitiveEngineOptions {
  taskType: TaskType;
  priority?: CognitivePriority;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  format?: 'json' | 'text' | 'html';
  maxCost?: number; // Límite de costo en USD
}

export interface StructuredLog {
  taskId: string;
  taskType: TaskType;
  provider: ProviderType;
  modelUsed: string;
  latencyMs: number;
  tokensUsed?: number;
  fallbackCount: number;
  status: 'SUCCESS' | 'PARTIAL_FAILURE' | 'CRITICAL_FAILURE';
  errorDetail?: string;
  timestamp: string;
}

export interface CognitiveTelemetry {
  log: StructuredLog;
  rawResponse?: any;
}
