import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

/**
 * POST /api/images/confirm
 * 
 * Llamado DESPUÉS de que el browser sube la imagen a Supabase Storage.
 * Recibe el nombre original del archivo y la nueva URL pública, y 
 * reemplaza automáticamente todas las URLs viejas (/api/media/slug/images/filename)
 * en los HTMLs de las landing_variants de ese slug.
 */
export async function POST(request: Request) {
  try {
    const { originalFilename, publicUrl, slug } = await request.json();

    if (!originalFilename || !publicUrl || !slug) {
      return NextResponse.json(
        { success: false, error: "originalFilename, publicUrl y slug son requeridos" },
        { status: 400 }
      );
    }

    // Construir los patrones de URL vieja que pueden estar en el HTML
    // El nombre puede tener espacios codificados o no
    const encodedName = encodeURIComponent(originalFilename);
    const patterns = [
      `/api/media/${slug}/images/${originalFilename}`,
      `/api/media/${slug}/images/${encodedName}`,
      `/assets/${slug}/images/${originalFilename}`,
      `/assets/${slug}/images/${encodedName}`,
    ];

    // Buscar todas las variantes del slug
    const { data: variants, error: fetchErr } = await supabase
      .from("landing_variants")
      .select("id, published_html, draft_html")
      .eq("product_slug", slug);

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
    }

    let updatedCount = 0;

    for (const variant of variants || []) {
      let html = variant.published_html || "";
      let draft = variant.draft_html || "";
      let changed = false;

      for (const oldPattern of patterns) {
        if (html.includes(oldPattern) || draft.includes(oldPattern)) {
          html = html.split(oldPattern).join(publicUrl);
          draft = draft.split(oldPattern).join(publicUrl);
          changed = true;
        }
      }

      if (changed) {
        const { error: updateErr } = await supabase
          .from("landing_variants")
          .update({ published_html: html, draft_html: draft })
          .eq("id", variant.id);

        if (!updateErr) updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imagen registrada. ${updatedCount} landing(s) actualizadas automáticamente.`,
      updatedVariants: updatedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
