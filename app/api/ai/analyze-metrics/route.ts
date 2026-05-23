import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { askMetricsAgent } from '@/lib/ai/openrouter';

const SYSTEM_PROMPT = `Eres un Media Buyer y Analista de Performance senior experto en escalar productos digitales.
Tu objetivo es leer las métricas de un anuncio individual y decidir rápidamente si se debe ESCALAR, OBSERVAR, APAGAR o si hay FATIGA.

Actúas como un "Copiloto Operacional". NO escribas respuestas largas. Eres directo y quirúrgico.
Debes devolver un objeto JSON estrictamente con este formato:
{
  "status": "ESCALAR" | "OBSERVAR" | "APAGAR" | "FATIGA" | "SIN_DATA",
  "diagnosis": "Diagnóstico corto (ej: Buen CTR y ROAS creciente. Early signal positivo.)",
  "risk": "Riesgo actual (ej: Frecuencia aún saludable. o Cuidado con el CPA.)",
  "action": "Acción recomendada (ej: Duplicar variante y aumentar 20% presupuesto.)",
  "confidence": 87 // Entero entre 0 y 100
}

Reglas generales:
- Si el anuncio gasta poco (<$10) y tiene mal CTR, igual OBSERVAR (SIN_DATA real). Si gasta >$10 con CTR <1% sin compras -> APAGAR.
- Si el CTR es muy alto (>2.5%) pero no hay conversiones -> Problema de LANDING. (status OBSERVAR).
- Si el ROAS es > 2.5x y tiene volumen de compras -> ESCALAR.
- Si la frecuencia > 2.5 y el CTR y ROAS vienen cayendo -> FATIGA.
- Si no hay conversiones y el gasto supera el CPA target -> APAGAR.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad, slug } = body;

    if (!ad || !ad.ad_id) {
      return NextResponse.json({ error: "Faltan datos del anuncio" }, { status: 400 });
    }

    const spend = parseFloat(ad.spend || '0');
    const ctr = parseFloat(ad.ctr || '0');
    const roas = ad.purchase_roas?.[0]?.value ? parseFloat(ad.purchase_roas[0].value) : 0;
    const purchases = ad.actions?.find((a:any) => a.action_type === 'purchase')?.value || 0;
    const frequency = parseFloat(ad.frequency || '0');
    const cpc = parseFloat(ad.cpc || '0');
    
    // Construct the context to feed the AI
    const userContext = `
Anuncio: ${ad.ad_name}
Campaña: ${ad.campaign_name}
Contexto Creativo (si existe):
- Hook: ${ad.creative_package?.hook || 'Desconocido'}
- Landing: ${ad.creative_package?.landing || 'Desconocida'}

Métricas:
- Gasto: $${spend.toFixed(2)}
- Compras: ${purchases}
- ROAS: ${roas > 0 ? roas.toFixed(2) + 'x' : '0x'}
- CTR: ${ctr.toFixed(2)}%
- CPC: $${cpc.toFixed(2)}
- Frecuencia: ${frequency.toFixed(2)}
`;

    // 1. Ask OpenRouter
    const aiResult = await askMetricsAgent(SYSTEM_PROMPT, userContext);

    // 2. Save snapshot and result to Supabase ai_analysis
    const { error: dbError } = await supabase.from('ai_analysis').insert({
      product_slug: slug || 'unknown',
      ad_id: ad.ad_id,
      ad_name: ad.ad_name,
      hook_used: ad.creative_package?.hook || null,
      landing_used: ad.creative_package?.landing || null,
      metrics_snapshot: {
        spend, ctr, roas, purchases, frequency, cpc
      },
      ai_status: aiResult.status,
      ai_diagnosis: aiResult.diagnosis,
      ai_risk: aiResult.risk,
      ai_action: aiResult.action,
      ai_confidence: aiResult.confidence
    });

    if (dbError) {
      console.error("Error guardando ai_analysis:", dbError);
    }

    return NextResponse.json({ success: true, analysis: aiResult });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
