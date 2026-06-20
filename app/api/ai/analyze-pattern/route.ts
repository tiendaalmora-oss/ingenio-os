import { NextResponse } from 'next/server';
import { invokeCognitiveEngine } from '@/lib/ai/orchestrator';

const SYSTEM_PROMPT = `Eres el Analista de Inteligencia de Marketing de Ingenio OS.
Tu tarea es tomar el texto de un anuncio publicitario (ad copy) e identificar de forma quirúrgica los patrones que lo hacen funcionar.

Debes extraer y devolver estrictamente un objeto JSON con el siguiente formato:
{
  "primary_pain": "El dolor de cabeza o problema principal que aborda el anuncio (ej: Frustración por tirar mercadería fresca, No saber si el negocio es rentable, Dependencia total del dueño, etc.). Debe ser una frase corta y directa.",
  "secondary_pain": "Un dolor secundario que se menciona de fondo (ej: Pérdida de tiempo en Excel, Falta de orden en mostrador, Desconfianza del cliente, etc.) o null si no hay ninguno.",
  "promise": "La promesa central o propuesta de valor que hace el anuncio (ej: Automatizar el stock de verduras en 10 minutos, Tener control de tu caja diaria de forma transparente, etc.).",
  "emotion": "La emoción dominante que despierta el texto (ej: Alivio, Control, Miedo a perder dinero, Orgullo de profesionalización, Libertad). Una sola palabra.",
  "awareness_level": "Nivel de conciencia del cliente según la escala de Eugene Schwartz (Problem Aware, Solution Aware, Product Aware, Most Aware, Unaware)."
}

Responde únicamente con el objeto JSON válido. No agregues explicaciones antes o después del JSON.`;

export async function POST(request: Request) {
  try {
    const { adText } = await request.json();

    if (!adText || adText.trim() === '') {
      return NextResponse.json({ success: false, error: 'El texto del anuncio es obligatorio' }, { status: 400 });
    }

    const content = await invokeCognitiveEngine({
      taskType: 'DATA_EXTRACTION',
      format: 'json',
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Analiza este texto de anuncio:\n\n"${adText}"`,
      maxTokens: 1000,
      temperature: 0.2
    });

    const pattern = JSON.parse(content);
    return NextResponse.json({ success: true, pattern });
  } catch (error: any) {
    console.error('API /api/ai/analyze-pattern Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
