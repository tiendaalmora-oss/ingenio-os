import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function POST(req: Request) {
  try {
    const { funnel_id, new_name } = await req.json();

    if (!funnel_id || !new_name) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 });
    }

    // 1. Obtener el embudo original
    const { data: originalFunnel, error: fErr } = await supabase
      .from("funnels")
      .select("*")
      .eq("id", funnel_id)
      .single();

    if (fErr || !originalFunnel) throw new Error("No se encontró el embudo original");

    // 2. Crear el nuevo embudo
    const { data: newFunnel, error: nfErr } = await supabase
      .from("funnels")
      .insert([{
        nombre: new_name,
        producto: originalFunnel.producto,
        descripcion: originalFunnel.descripcion,
        activo: false, // Por defecto inactivo hasta que se configure
        color: originalFunnel.color
      }])
      .select()
      .single();

    if (nfErr) throw nfErr;

    // 3. Obtener las etapas originales
    const { data: originalSteps, error: sErr } = await supabase
      .from("funnel_steps")
      .select("*")
      .eq("funnel_id", funnel_id);

    if (sErr) throw sErr;

    // 4. Clonar etapas y plantillas
    for (const step of originalSteps || []) {
      const { data: newStep, error: nsErr } = await supabase
        .from("funnel_steps")
        .insert([{
          funnel_id: newFunnel.id,
          nombre: step.nombre,
          key: step.key,
          descripcion: step.descripcion,
          orden: step.orden,
          color: step.color,
          ai_goal: step.ai_goal,
          ai_valid_intents: step.ai_valid_intents,
          ai_faq: step.ai_faq
        }])
        .select()
        .single();

      if (nsErr) continue;

      // Obtener plantilla original de esta etapa
      const { data: originalTemplate } = await supabase
        .from("bot_templates")
        .select("*")
        .eq("step_id", step.id)
        .limit(1)
        .single();

      if (originalTemplate) {
        await supabase.from("bot_templates").insert([{
          funnel_id: newFunnel.id,
          step_id: newStep.id,
          trigger_key: originalTemplate.trigger_key,
          nombre: originalTemplate.nombre,
          mensaje: originalTemplate.mensaje,
          activo: originalTemplate.activo,
          orden: originalTemplate.orden
        }]);
      }
    }

    return NextResponse.json({ success: true, funnel: newFunnel });
  } catch (err: any) {
    console.error("Error clonando embudo:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
