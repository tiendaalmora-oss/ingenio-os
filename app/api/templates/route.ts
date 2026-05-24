import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), "pantillas");
    
    // Si no existe el directorio, devolvemos arrays vacíos
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({
        success: true,
        templates: {
          landing: [],
          producto: [],
          manual: []
        }
      });
    }

    const getHtmlFiles = (subfolder: string) => {
      const folderPath = path.join(templatesDir, subfolder);
      if (!fs.existsSync(folderPath)) return [];
      try {
        const files = fs.readdirSync(folderPath);
        return files.filter(f => f.endsWith(".html") || f.endsWith(".txt") || f.endsWith(".md"));
      } catch (e) {
        return [];
      }
    };

    const landingFiles = getHtmlFiles("landing");
    const productFiles = getHtmlFiles("producto");
    const manualFiles = getHtmlFiles("entrega de producto");

    return NextResponse.json({
      success: true,
      templates: {
        landing: landingFiles,
        producto: productFiles,
        manual: manualFiles
      }
    });
  } catch (error: any) {
    console.error("Error reading templates:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
