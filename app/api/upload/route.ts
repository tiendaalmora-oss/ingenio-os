import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/mov'];

const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;
    const folderOverride = formData.get('folder') as string; // 'hero', 'logos', 'zip_deploy', 'videos', etc.

    if (!file || !slug) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // Validar tamaño máximo
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `El archivo supera el tamaño máximo permitido (200 MB). Tamaño recibido: ${(file.size / 1024 / 1024).toFixed(1)} MB` },
        { status: 413 }
      );
    }

    // Determinar tipo y carpeta automáticamente
    const isVideo = VIDEO_TYPES.includes(file.type);
    const isImage = IMAGE_TYPES.includes(file.type);

    if (!ALLOWED_TYPES.includes(file.type) && file.type !== 'application/zip') {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}. Permitidos: imágenes y videos mp4/webm/mov.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Lógica operacional de carpetas
    let folder = folderOverride;
    if (!folder) {
      // Auto-detectar carpeta si no se especifica
      folder = isVideo ? 'videos' : 'images';
    }

    let targetDir = path.join(process.cwd(), 'public', 'assets', slug, folder);

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

    return NextResponse.json({
      success: true,
      message: 'Archivo subido con éxito',
      url: `/api/media/${slug}/${folder}/${file.name}`,
      type: isVideo ? 'video' : 'image',
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'manual_uploads';
    const folder = searchParams.get('folder') || 'images';

    // Las imágenes y videos se sirven desde Supabase Storage (persistente entre deploys)
    if (folder === 'images' || folder === 'videos') {
      const bucketName = folder; // 'images' o 'videos'
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

      const folderPrefix = slug === 'manual_uploads' ? 'manual_uploads' : slug;

      // Listar la carpeta del slug dentro del bucket correspondiente
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list(folderPrefix, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

      const urls: string[] = [];

      if (!error && files && files.length > 0) {
        files
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .forEach(f => {
            urls.push(`${supabaseUrl}/storage/v1/object/public/${bucketName}/${folderPrefix}/${f.name}`);
          });
      }

      // También chequear raíz si es manual_uploads o no encontró en subcarpeta
      const { data: rootFiles } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

      if (rootFiles && rootFiles.length > 0) {
        rootFiles
          .filter(f => f.name !== '.emptyFolderPlaceholder' && f.id)
          .forEach(f => {
            const url = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${f.name}`;
            if (!urls.includes(url)) {
              urls.push(url);
            }
          });
      }

      return NextResponse.json({ success: true, files: urls });
    }

    // Para otros folders (zip_deploy, etc.) se mantiene el filesystem local
    const targetDir = path.join(process.cwd(), 'public', 'assets', slug, folder);

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ success: true, files: [] });
    }

    const files = fs.readdirSync(targetDir);
    const urls = files.map(file => `/api/media/${slug}/${folder}/${file}`);

    return NextResponse.json({ success: true, files: urls });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
