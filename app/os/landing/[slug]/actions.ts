"use server";

import { supabase } from "@/lib/db/supabase";
import { logEvent } from "@/lib/events";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';
import { generateLandingHTML } from "@/lib/templates/baseTemplate";

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
    
    // Generar la landing con el template nativo
    const htmlBoilerplate = generateLandingHTML({ hook: '', copy: '', ctaText: '', checkoutUrl: '', primaryColor: '#0ea5e9' }, name);
    fs.writeFileSync(path.join(variantDir, 'index.html'), htmlBoilerplate, 'utf8');
  }

  await logEvent('landing_variant_created', slug, { name, folder: folderSlug });
  revalidatePath(`/os/landing/${slug}`);
}

export async function updateVariantConfig(id: string, slug: string, config: any) {
  // Primero obtener config actual para no pisar el 'folder'
  const { data: variant } = await supabase.from('landing_variants').select('name, config').eq('id', id).single();
  const existingConfig = variant?.config || {};
  const newConfig = { ...existingConfig, ...config };
  
  await supabase.from('landing_variants').update({ config: newConfig }).eq('id', id);

  // Regenerar el código estático usando la plantilla
  if (newConfig.folder) {
    const variantDir = path.join(process.cwd(), 'public', 'legacy', slug, newConfig.folder);
    if (fs.existsSync(variantDir)) {
      const htmlContent = generateLandingHTML(newConfig, variant?.name || 'Variante');
      fs.writeFileSync(path.join(variantDir, 'index.html'), htmlContent, 'utf8');
      
      // Si la variante es la principal, actualizamos también la carpeta principal
      const { data: isMainCheck } = await supabase.from('landing_variants').select('is_main').eq('id', id).single();
      if (isMainCheck?.is_main) {
         const mainDir = path.join(process.cwd(), 'public', 'legacy', slug, 'landing');
         if (fs.existsSync(mainDir)) {
            fs.writeFileSync(path.join(mainDir, 'index.html'), htmlContent, 'utf8');
         }
      }
    }
  }

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

export async function updateProductDetails(slug: string, price: number, checkoutUrl: string, status: string) {
  try {
    await supabase.from('products').update({ price, checkout_url: checkoutUrl, status }).eq('slug', slug);
    revalidatePath(`/os/landing/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error updating product details:", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateProductManual(slug: string, title: string, manualMarkdown: string) {
  try {
    // 1. Guardar en Base de Datos
    await supabase.from('products').update({ delivery_manual: manualMarkdown }).eq('slug', slug);

    // 2. Convertir Markdown simple a HTML
    const renderMarkdownToHtml = (md: string) => {
      let html = md;
      // Headers
      html = html.replace(/^### (.*$)/gim, '<h4 className="text-white font-bold text-lg mt-4 mb-2 flex items-center gap-2">🔹 $1</h4>');
      html = html.replace(/^## (.*$)/gim, '<h3 className="text-emerald-400 font-bold text-xl border-b border-zinc-800 pb-2 mt-6 mb-4">$1</h3>');
      html = html.replace(/^# (.*$)/gim, '<h2 className="text-2xl font-black text-lime mt-8 mb-4">$1</h2>');
      // Bold / Italic
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Lists
      html = html.replace(/^\s*-\s+(.*$)/gim, '<li className="text-zinc-400 text-sm ml-4 list-disc mb-1">$1</li>');
      // Paragraphs
      html = html.replace(/^\s*\n/gm, '<p className="text-zinc-400 text-sm mb-4"></p>');
      // Badges
      html = html.replace(/\[badge\](.*?)\[\/badge\]/g, '<span className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs px-2 py-0.5 rounded font-bold mr-2">$1</span>');
      return html;
    };

    const renderedHtml = renderMarkdownToHtml(manualMarkdown);

    // 3. Leer la plantilla entregadeproducto.html y reemplazar su contenido
    const manualDir = path.join(process.cwd(), 'public', 'legacy', slug, 'manual');
    const templateSource = path.join(process.cwd(), 'pantillas');
    const manualTemplatePath = path.join(templateSource, 'entrega de producto', 'entregadeproducto.html');

    if (fs.existsSync(manualTemplatePath)) {
      let html = fs.readFileSync(manualTemplatePath, 'utf8');

      // Dividir logo
      const nameParts = title.split(" ");
      const firstWord = nameParts[0] || "";
      const remainingWords = nameParts.slice(1).join(" ") || "";

      html = html.replace(/<title>.*?<\/title>/i, `<title>Manual de Entrega - ${title}</title>`);
      html = html.replace(
        /<div class="brand"><span class="v">Verde<\/span><span class="p">Pro<\/span><\/div>/g,
        `<div class="brand"><span class="v">${firstWord}</span><span class="p">${remainingWords}</span></div>`
      );
      html = html.replace(/VerdePro/g, title);

      // Reemplazar la sección del manual de usuario completo con el contenido editado
      const startMarker = '<!-- MANUAL DE USUARIO -->';
      const endMarker = '</div>\n\n</body>';
      const startIndex = html.indexOf(startMarker);
      const endIndex = html.indexOf(endMarker);

      if (startIndex !== -1 && endIndex !== -1) {
        const headerAndLinks = html.substring(0, startIndex);
        const footer = html.substring(endIndex);
        
        const newManualSection = `
  <!-- MANUAL DE USUARIO -->
  <div class="manual-header">
    <h2>📖 Manual de Usuario</h2>
    <p style="color: var(--txt2);">Guía práctica y manual de instrucciones de tu producto.</p>
  </div>
  
  <div class="manual-section" style="text-align: left;">
    ${renderedHtml.replace(/className=/g, 'class=')}
  </div>
`;
        html = headerAndLinks + newManualSection + footer;
      }

      if (!fs.existsSync(manualDir)) {
        fs.mkdirSync(manualDir, { recursive: true });
      }
      fs.writeFileSync(path.join(manualDir, 'index.html'), html, 'utf8');
    }

    revalidatePath(`/os/landing/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error updating manual:", err.message);
    return { success: false, error: err.message };
  }
}
