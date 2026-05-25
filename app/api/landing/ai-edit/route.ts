import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://os.ingeniodigital.shop",
        "X-Title": "Ingenio OS Creative Engine",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Código HTML actual:\n\n${currentHtml}\n\nRequerimiento del usuario: ${prompt}\n\nAplica los cambios y devuelve el nuevo HTML completo.` }
        ],
        temperature: 0.4,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI generation failed: ${response.status} - ${err}`);
    }

    const data = await response.json();
    let newHtml = data.choices?.[0]?.message?.content || "";
    
    newHtml = newHtml.trim();
    if (newHtml.startsWith("```html")) {
      newHtml = newHtml.replace(/^```html/, "").replace(/```$/, "").trim();
    } else if (newHtml.startsWith("```")) {
      newHtml = newHtml.replace(/^```/, "").replace(/```$/, "").trim();
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
    const landingDir = path.join(baseLegacyDir, "landing");
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
