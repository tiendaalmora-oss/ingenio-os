import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;
    const folder = formData.get('folder') as string; // 'hero', 'logos', 'zip_deploy', etc.

    if (!file || !slug) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Lógica operacional de carpetas
    let targetDir = path.join(process.cwd(), 'public', 'assets', slug, folder || '');
    
    if (folder === 'zip_deploy') {
      // Reemplazo de build completo en la carpeta legacy
      targetDir = path.join(process.cwd(), 'public', 'legacy', slug);
    }

    // Asegurar que exista el directorio
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, file.name);
    fs.writeFileSync(filePath, buffer);

    // NOTA OPERACIONAL: Si es un ZIP, en producción aquí se ejecutaría un script 
    // de extracción (ej. adm-zip) para desempaquetar la landing.

    return NextResponse.json({ 
      success: true, 
      message: 'Archivo subido con éxito',
      url: `/assets/${slug}/${folder}/${file.name}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
