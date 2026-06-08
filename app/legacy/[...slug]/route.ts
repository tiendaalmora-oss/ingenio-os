import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = path.join(process.cwd(), "public", "legacy", ...resolvedParams.slug);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, "utf8");
        return new NextResponse(content, {
          headers: { "Content-Type": "text/html" },
        });
      }
      
      // Si el archivo físico no existe, intentamos buscarlo en Supabase (por si el servidor se reinició)
      // resolvedParams.slug es ["cita", "landing"] o similar
      if (resolvedParams.slug.length >= 2 && resolvedParams.slug[1] === "landing") {
        const projectSlug = resolvedParams.slug[0];
        const { supabase } = await import("@/lib/db/supabase");
        const { data: variant } = await supabase
          .from("landing_variants")
          .select("published_html")
          .eq("product_slug", projectSlug)
          .eq("status", "PUBLISHED")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();
          
        if (variant && variant.published_html) {
          // Re-crear el archivo para futuros requests
          try {
            if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });
            fs.writeFileSync(indexPath, variant.published_html, "utf8");
          } catch(e) {}
          
          return new NextResponse(variant.published_html, {
            headers: { "Content-Type": "text/html" },
          });
        }
      }

      return new NextResponse("Directory index not found", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "text/plain";
    if (ext === ".html") contentType = "text/html";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".js") contentType = "application/javascript";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".json") contentType = "application/json";

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Error serving legacy file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
