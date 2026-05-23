const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

export interface AIResponse {
  status: 'ESCALAR' | 'OBSERVAR' | 'APAGAR' | 'FATIGA' | 'SIN_DATA';
  diagnosis: string;
  risk: string;
  action: string;
  confidence: number;
}

export async function askMetricsAgent(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY no configurada.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://ingenio-os.com", 
      "X-Title": "Ingenio OS", 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2, // Low temperature for deterministic, operational reasoning
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("Respuesta vacía de OpenRouter.");
  }

  try {
    const parsed = JSON.parse(content);
    
    // Helper to ensure we always get a string for React rendering to avoid crashes
    const safeString = (val: any, fallback: string) => {
      if (!val) return fallback;
      if (typeof val === 'string') return val;
      return JSON.stringify(val);
    };

    return {
      status: parsed.status || 'OBSERVAR',
      diagnosis: safeString(parsed.diagnosis || parsed.diagnostico, 'No diagnosis provided'),
      risk: safeString(parsed.risk || parsed.riesgo, 'No risk provided'),
      action: safeString(parsed.action || parsed.accion, 'No action provided'),
      confidence: typeof (parsed.confidence || parsed.confianza) === 'number' ? (parsed.confidence || parsed.confianza) : parseInt(parsed.confidence || parsed.confianza || '0') || 0,
    };
  } catch (e) {
    console.error("Error parsing AI JSON:", content);
    throw new Error("La IA no devolvió un JSON válido.");
  }
}
