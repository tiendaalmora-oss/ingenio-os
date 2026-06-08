import { invokeCognitiveEngine } from './orchestrator';

export interface ExpertBotOptions {
  userMessage: string;
  chatHistory: { role: 'user' | 'bot' | 'human', content: string }[];
  funnelName: string;
  knowledgeBase: string;
  botPrompt: string;
}

export async function generateExpertResponse(options: ExpertBotOptions): Promise<string> {
  const { userMessage, chatHistory, funnelName, knowledgeBase, botPrompt } = options;

  // Construir el historial para darle contexto al LLM
  // Limitamos a los últimos 6 mensajes para no exceder tokens y mantener el foco
  const recentHistory = chatHistory.slice(-6).map(msg => 
    `${msg.role.toUpperCase()}: ${msg.content}`
  ).join('\n');

  const systemPrompt = `Eres un Agente Experto de Ventas y Soporte Técnico especializado en el producto/embudo: "${funnelName}".

=== PERSONALIDAD Y REGLAS DE FORMATO ===
${botPrompt || "Eres un asesor empático, resolutivo y directo. Usa párrafos cortos, viñetas y emojis para estructurar tu respuesta. No saludes repetidamente."}

=== BASE DE CONOCIMIENTO (KNOWLEDGE BASE) ===
Utiliza ÚNICAMENTE la información de esta base de conocimiento para responder preguntas técnicas, de precios o características. Si el cliente pregunta algo que no está aquí, dile amablemente que vas a derivar su consulta con un humano. No inventes información.
${knowledgeBase || "No hay base de conocimiento configurada."}

=== HISTORIAL RECIENTE ===
${recentHistory}`;

  try {
    // Usamos el Orquestador para enviar la tarea al LLM
    const response = await invokeCognitiveEngine({
      taskType: 'COPYWRITING',
      systemPrompt: systemPrompt,
      userPrompt: `Mensaje actual del cliente: ${userMessage}`,
      format: 'text',
      temperature: 0.4, // Baja temperatura para mantener fidelidad a la Base de Conocimiento
      maxTokens: 500
    });

    return response;
  } catch (error) {
    console.error("Error en Expert Bot:", error);
    // Fallback amigable
    return "¡Hola! Estoy experimentando una demora técnica. En un momento te responderá un asesor humano.";
  }
}
