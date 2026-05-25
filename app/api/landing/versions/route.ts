import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

// GET /api/landing/versions?variantId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json({ success: false, error: "Falta variantId" }, { status: 400 });
    }

    const { data: versions, error } = await supabase
      .from("landing_versions")
      .select("id, created_at, prompt_used")
      .eq("variant_id", variantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, versions });
  } catch (err: any) {
    console.error("Error fetching versions:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/landing/versions (Rollback)
export async function POST(req: Request) {
  try {
    const { versionId } = await req.json();

    if (!versionId) {
      return NextResponse.json({ success: false, error: "Falta versionId" }, { status: 400 });
    }

    // 1. Fetch the requested version
    const { data: version, error: verErr } = await supabase
      .from("landing_versions")
      .select("*, landing_variants(product_slug)")
      .eq("id", versionId)
      .single();

    if (verErr || !version) {
      return NextResponse.json({ success: false, error: "Versión no encontrada" }, { status: 404 });
    }

    const variantId = version.variant_id;
    const productSlug = version.landing_variants?.product_slug;
    const htmlToRestore = version.content_html;

    // 2. Update variant with the restored HTML as draft
    await supabase
      .from("landing_variants")
      .update({ draft_html: htmlToRestore })
      .eq("id", variantId);

    // 3. Insert a new version record to track the rollback
    await supabase.from("landing_versions").insert({
      variant_id: variantId,
      content_html: htmlToRestore,
      prompt_used: `Restaurado a versión anterior (ID: ${versionId})`
    });

    // 4. Update the draft.html file
    if (productSlug) {
      const baseLegacyDir = path.join(process.cwd(), "public", "legacy", productSlug);
      const landingDir = path.join(baseLegacyDir, "landing");
      if (!fs.existsSync(landingDir)) {
        fs.mkdirSync(landingDir, { recursive: true });
      }
      fs.writeFileSync(path.join(landingDir, "draft.html"), htmlToRestore, "utf8");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error rolling back version:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
