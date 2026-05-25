import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { slug, html } = await req.json();

    if (!slug || !html) {
      return NextResponse.json(
        { success: false, error: "Slug y HTML son requeridos." },
        { status: 400 }
      );
    }

    // 1. Limpiar slug para estar seguros
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    // 2. Comprobar si existe el producto
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", cleanSlug)
      .single();

    let productId = product?.id;

    if (!productId) {
      // Upsert: Si no existe, lo creamos
      const { data: newProduct, error: prodErr } = await supabase
        .from("products")
        .insert({
          slug: cleanSlug,
          name: `Landing Manual: ${cleanSlug}`,
          color: "#0ea5e9", // cyan
          sections: ["landing"],
          status: "published",
          type: "Landing Manual",
          niche: "Manual",
          price: 0,
          checkout_url: "",
          delivery_manual: ""
        })
        .select("id")
        .single();
        
      if (prodErr) throw new Error(`Error al crear producto: ${prodErr.message}`);
      productId = newProduct.id;
    }

    // 3. Crear variante de backup para la UI
    const { error: varErr } = await supabase
      .from("landing_variants")
      .insert({
        product_slug: cleanSlug,
        name: `Manual Canvas ${new Date().toISOString().split("T")[0]}`,
        published_html: html,
        draft_html: html,
        status: "PUBLISHED"
      });

    if (varErr) {
      console.warn("No se pudo crear el backup en DB, pero procederemos a publicar el físico.", varErr.message);
    }

    // 4. Escribir en el File System Legacy
    const baseLegacyDir = path.join(process.cwd(), "public", "legacy", cleanSlug);
    const landingDir = path.join(baseLegacyDir, "landing");

    if (!fs.existsSync(landingDir)) {
      fs.mkdirSync(landingDir, { recursive: true });
    }

    fs.writeFileSync(path.join(landingDir, "index.html"), html, "utf8");

    return NextResponse.json({ success: true, url: `/${cleanSlug}` });
  } catch (err: unknown) {
    console.error("Error en publicación manual:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno al publicar." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug requerido" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const filePath = path.join(process.cwd(), "public", "legacy", cleanSlug, "landing", "index.html");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: "No se encontró el HTML" }, { status: 404 });
    }

    const html = fs.readFileSync(filePath, "utf8");
    return NextResponse.json({ success: true, html });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error al cargar HTML." },
      { status: 500 }
    );
  }
}
