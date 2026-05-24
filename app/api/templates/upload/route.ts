import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string; // 'landing', 'producto', o 'manual'

    if (!file || !category) {
      return NextResponse.json(
        { success: false, error: "Archivo o categoría no proporcionados." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Mapear categoría al nombre de la subcarpeta real
    let subfolder = category;
    if (category === "manual") {
      subfolder = "entrega de producto";
    }

    const targetDir = path.join(process.cwd(), "pantillas", subfolder);

    // Asegurar que exista la carpeta
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, file.name);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, message: "Plantilla subida con éxito" });
  } catch (error: any) {
    console.error("Error uploading template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al subir la plantilla" },
      { status: 500 }
    );
  }
}
