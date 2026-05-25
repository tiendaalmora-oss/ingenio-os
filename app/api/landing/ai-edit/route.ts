import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

import { invokeCognitiveEngine } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  try {
    const { variantId, prompt } = await req.json();

    if (!variantId || !prompt) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos (variantId, prompt)" },
        { status: 400 }
      );
    }

    // 1. Obtener el draft_html actual
    const { data: variant, error: varErr } = await supabase
      .from("landing_variants")
      .select("*")
      .eq("id", variantId)
      .single();

    if (varErr || !variant) {
      return NextResponse.json(
        { success: false, error: "Variante no encontrada" },
        { status: 404 }
      );
    }

    const currentHtml = variant.draft_html || variant.published_html;
    if (!currentHtml) {
      return NextResponse.json(
        { success: false, error: "No hay HTML base para editar" },
        { status: 400 }
      );
    }

    // 2. Llamar a la IA
    const systemPrompt = `Eres un Desarrollador Frontend Senior y Director Creativo.
Tu tarea es modificar una Landing Page HTML existente basándote en la petición del usuario.

REGLAS DE EDICIÓN:
1. DEBES MANTENER LA ESTRUCTURA PRINCIPAL (ADN). No elimines secciones completas a menos que el usuario lo pida explícitamente.
2. Aplica los cambios estéticos (colores, sombras, bordes, tipografías) modificando el bloque <style> o las variables CSS.
3. Si el usuario pide cambios de contenido ("hacerlo más agresivo", "cambiar el hero"), reescribe el texto (copywriting) manteniendo la persuasión y conversión.
4. Devuelve ÚNICAMENTE el nuevo código HTML completo, desde <!DOCTYPE html> hasta </html>. NO agregues explicaciones.`;

    console.log(`🤖 Iniciando edición IA para variante ${variantId} con prompt: "${prompt}"`);

    let newHtml = await invokeCognitiveEngine({
      taskType: 'HEAVY_CODE',
      format: 'html',
      systemPrompt,
      userPrompt: `Código HTML actual:\n\n${currentHtml}\n\nRequerimiento del usuario: ${prompt}\n\nAplica los cambios y devuelve el nuevo HTML completo.`,
      maxTokens: 8000,
      temperature: 0.4
    });

    // Limpiar artefactos de la IA (markdown, bash tags, etc.)
    const htmlMatch = newHtml.match(/(<!DOCTYPE html>[\s\S]*<\/html>)/i);
    if (htmlMatch) {
      newHtml = htmlMatch[1];
    } else {
      // Fallback básico de limpieza de markdown por si no tiene doctype
      newHtml = newHtml.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
    }

    // 3. Guardar el nuevo Draft
    await supabase
      .from("landing_variants")
      .update({ draft_html: newHtml })
      .eq("id", variantId);

    // 4. Crear registro en el historial (Versions)
    await supabase.from("landing_versions").insert({
      variant_id: variantId,
      content_html: newHtml,
      prompt_used: prompt
    });

    // 5. Escribir draft.html físico para preview
    const baseLegacyDir = path.join(process.cwd(), "public", "legacy", variant.product_slug);
    const folderName = variant.config?.folder || "landing";
    const landingDir = path.join(baseLegacyDir, folderName);
    if (!fs.existsSync(landingDir)) {
      fs.mkdirSync(landingDir, { recursive: true });
    }
    fs.writeFileSync(path.join(landingDir, "draft.html"), newHtml, "utf8");

    return NextResponse.json({ success: true, message: "Cambios aplicados correctamente" });
  } catch (err: any) {
    console.error("Error en AI Edit:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar la edición IA" },
      { status: 500 }
    );
  }
}
