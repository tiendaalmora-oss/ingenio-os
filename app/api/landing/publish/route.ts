import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { variantId } = await req.json();

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: "El ID de la variante es obligatorio" },
        { status: 400 }
      );
    }

    // Obtener la variante
    const { data: variant, error: varErr } = await supabase
      .from("landing_variants")
      .select("*")
      .eq("id", variantId)
      .single();

    if (varErr || !variant) {
      return NextResponse.json(
        { success: false, error: "No se encontró la variante especificada" },
        { status: 404 }
      );
    }

    if (!variant.draft_html) {
      return NextResponse.json(
        { success: false, error: "No hay un borrador (draft) para publicar" },
        { status: 400 }
      );
    }

    // Escribir en el file system (producción real en la URL pública)
    const baseLegacyDir = path.join(process.cwd(), "public", "legacy", variant.product_slug);
    const folderName = variant.config?.folder || "landing";
    const landingDir = path.join(baseLegacyDir, folderName);

    if (!fs.existsSync(landingDir)) {
      fs.mkdirSync(landingDir, { recursive: true });
    }

    fs.writeFileSync(path.join(landingDir, "index.html"), variant.draft_html, "utf8");

    // Actualizar base de datos
    const { error: updateErr } = await supabase
      .from("landing_variants")
      .update({
        published_html: variant.draft_html,
        status: "PUBLISHED"
      })
      .eq("id", variantId);

    if (updateErr) {
      throw new Error(`Error al actualizar estado en DB: ${updateErr.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error publishing landing:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al publicar la landing" },
      { status: 500 }
    );
  }
}
