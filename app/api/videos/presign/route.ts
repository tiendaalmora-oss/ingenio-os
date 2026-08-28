import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { filename, contentType, slug } = await request.json();

    if (!filename) {
      return NextResponse.json({ success: false, error: "Filename is required" }, { status: 400 });
    }

    // Limpiar el nombre de archivo y añadir un hash para evitar colisiones
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const hash = crypto.randomBytes(4).toString('hex');
    const folderPrefix = slug ? `${slug}/` : 'manual_uploads/';
    const path = `${folderPrefix}${Date.now()}-${hash}-${cleanName}`;

    // Generar una URL firmada de subida (válida por 60 minutos)
    const { data, error } = await supabase
      .storage
      .from('videos')
      .createSignedUploadUrl(path);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Construir la URL pública que tendrá el video una vez subido
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/videos/${path}`;

    return NextResponse.json({ 
      success: true, 
      signedUrl: data.signedUrl,
      path: data.path,
      publicUrl: publicUrl
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
