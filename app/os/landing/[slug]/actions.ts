"use server";

import { supabase } from "@/lib/db/supabase";
import { logEvent } from "@/lib/events";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';

// Utilidad para crear slugs (ej: "Oferta Especial" -> "oferta-especial")
const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export async function getLandingData(slug: string) {
  const { data: product } = await supabase.from('products').select('*').eq('slug', slug).single();
  let { data: variants } = await supabase.from('landing_variants').select('*').eq('product_slug', slug).order('created_at', { ascending: false });

  if (!variants || variants.length === 0) {
    const { data: newVariant } = await supabase.from('landing_variants').insert({
      product_slug: slug,
      name: 'Landing Principal',
      type: 'direct_response',
      is_main: true,
      config: { folder: 'landing' } // Carpeta principal por defecto en proxy.ts
    }).select().single();
    if (newVariant) variants = [newVariant];
    
    // Asegurar que exista la carpeta principal
    const mainDir = path.join(process.cwd(), 'public', 'legacy', slug, 'landing');
    if (!fs.existsSync(mainDir)) {
      fs.mkdirSync(mainDir, { recursive: true });
      fs.writeFileSync(path.join(mainDir, 'index.html'), '<html><body><h1>Landing Principal</h1></body></html>');
    }
  }

  return { product, variants };
}

export async function addVariant(slug: string, name: string, type: string) {
  const folderSlug = generateSlug(name) + '-' + Math.floor(Math.random() * 1000);
  
  // 1. Guardar en Base de Datos
  await supabase.from('landing_variants').insert({
    product_slug: slug,
    name,
    type,
    config: { folder: folderSlug, hook: '', copy: '' }
  });

  // 2. Crear carpeta física para inyectar código
  const variantDir = path.join(process.cwd(), 'public', 'legacy', slug, folderSlug);
  if (!fs.existsSync(variantDir)) {
    fs.mkdirSync(variantDir, { recursive: true });
    
    // Generar un boilerplate básico de HTML
    const htmlBoilerplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <!-- Agrega aquí tus estilos -->
</head>
<body>
    <h1>${name}</h1>
    <p>Reemplaza este código desde la pestaña 'Código' del Landing HQ.</p>
</body>
</html>`;
    fs.writeFileSync(path.join(variantDir, 'index.html'), htmlBoilerplate, 'utf8');
  }

  await logEvent('landing_variant_created', slug, { name, folder: folderSlug });
  revalidatePath(`/os/landing/${slug}`);
}

export async function updateVariantConfig(id: string, slug: string, config: any) {
  // Primero obtener config actual para no pisar el 'folder'
  const { data: variant } = await supabase.from('landing_variants').select('config').eq('id', id).single();
  const existingConfig = variant?.config || {};
  const newConfig = { ...existingConfig, ...config };
  
  await supabase.from('landing_variants').update({ config: newConfig }).eq('id', id);
  await logEvent('landing_variant_updated', slug, { variant_id: id });
  revalidatePath(`/os/landing/${slug}`);
}

export async function toggleMainVariant(id: string, slug: string) {
  // 1. Obtener la variante que queremos hacer principal
  const { data: targetVariant } = await supabase.from('landing_variants').select('*').eq('id', id).single();
  
  if (targetVariant && targetVariant.config?.folder) {
    const sourceDir = path.join(process.cwd(), 'public', 'legacy', slug, targetVariant.config.folder);
    const targetDir = path.join(process.cwd(), 'public', 'legacy', slug, 'landing');

    // 2. Operación a nivel de FileSystem: Copiar el contenido de la variante a la carpeta "landing"
    if (fs.existsSync(sourceDir)) {
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      
      // Función simple para copiar archivos del directorio fuente al target
      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
      }
    }
  }

  // 3. Actualizar la base de datos
  await supabase.from('landing_variants').update({ is_main: false }).eq('product_slug', slug);
  await supabase.from('landing_variants').update({ is_main: true }).eq('id', id);
  await logEvent('landing_main_changed', slug, { variant_id: id });
  revalidatePath(`/os/landing/${slug}`);
}

export async function deleteVariant(id: string, slug: string) {
  // 1. Delete physical folder to keep server clean
  const { data: targetVariant } = await supabase.from('landing_variants').select('*').eq('id', id).single();
  if (targetVariant && targetVariant.config?.folder && targetVariant.config.folder !== 'landing') {
    const targetDir = path.join(process.cwd(), 'public', 'legacy', slug, targetVariant.config.folder);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  }

  // 2. Delete from DB
  await supabase.from('landing_variants').delete().eq('id', id);
  await logEvent('landing_variant_deleted', slug, { variant_id: id });
  revalidatePath(`/os/landing/${slug}`);
}
