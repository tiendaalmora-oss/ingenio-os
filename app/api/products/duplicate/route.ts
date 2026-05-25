import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

function copyFolderSync(from: string, to: string) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, slug } = body;

    if (!id || !slug) {
      return NextResponse.json({ success: false, error: "Faltan parámetros id o slug" }, { status: 400 });
    }

    // 1. Obtener producto original
    const { data: originalProduct, error: getErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (getErr || !originalProduct) throw new Error("Producto no encontrado");

    // 2. Generar nuevo slug (ej: lavadero-copy, o lavadero-copy-2 si ya existe)
    let newSlug = `${slug}-copy`;
    let { data: existing } = await supabase.from("products").select("id").eq("slug", newSlug).single();
    let counter = 2;
    while (existing) {
      newSlug = `${slug}-copy-${counter}`;
      const res = await supabase.from("products").select("id").eq("slug", newSlug).single();
      existing = res.data;
      counter++;
    }

    // 3. Insertar nuevo producto
    const { id: _, created_at: __, ...productDataToCopy } = originalProduct;
    productDataToCopy.slug = newSlug;
    productDataToCopy.name = `${originalProduct.name} (Copia)`;

    const { data: newProduct, error: insertErr } = await supabase
      .from("products")
      .insert([productDataToCopy])
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 4. Copiar variantes
    const { data: originalVariants } = await supabase
      .from("landing_variants")
      .select("*")
      .eq("product_slug", slug);

    if (originalVariants && originalVariants.length > 0) {
      const variantsToInsert = originalVariants.map(v => {
        const { id, created_at, ...vData } = v;
        vData.product_slug = newSlug;
        return vData;
      });
      await supabase.from("landing_variants").insert(variantsToInsert);
    }

    // 5. Copiar carpetas físicas (legacy y assets)
    const originalLegacyDir = path.join(process.cwd(), "public", "legacy", slug);
    const newLegacyDir = path.join(process.cwd(), "public", "legacy", newSlug);
    copyFolderSync(originalLegacyDir, newLegacyDir);

    const originalAssetsDir = path.join(process.cwd(), "public", "assets", slug);
    const newAssetsDir = path.join(process.cwd(), "public", "assets", newSlug);
    copyFolderSync(originalAssetsDir, newAssetsDir);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
