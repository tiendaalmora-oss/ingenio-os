"use server";

import { supabase } from "@/lib/db/supabase";
import { logEvent } from "@/lib/events";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';

export async function getCreativeData(slug: string) {
  const { data: product } = await supabase.from('products').select('*').eq('slug', slug).single();
  
  const { data: concepts } = await supabase.from('creative_concepts').select('*').eq('product_slug', slug).order('created_at', { ascending: false });
  const { data: assets } = await supabase.from('creative_assets').select('*').eq('product_slug', slug).order('created_at', { ascending: false });
  
  // Obtenemos los packages con los nombres de sus conceptos cruzados
  const { data: packages } = await supabase.from('creative_packages')
    .select(`*, concept:creative_concepts(name), landing:landing_variants(name)`)
    .eq('product_slug', slug)
    .order('created_at', { ascending: false });

  // Obtenemos las variantes de landings disponibles para poder linkearlas a los packages
  const { data: landings } = await supabase.from('landing_variants').select('id, name').eq('product_slug', slug);

  // Garantizar la estructura física de assets para ads
  const assetFolders = ['videos', 'thumbnails', 'hooks', 'scripts'];
  try {
    const basePath = path.join(process.cwd(), 'public', 'ads', slug);
    assetFolders.forEach(folder => {
      fs.mkdirSync(path.join(basePath, folder), { recursive: true });
    });
  } catch (err) {
    console.error("[CreativeLab] Error creating asset folders:", err);
  }

  return { product, concepts: concepts || [], assets: assets || [], packages: packages || [], landings: landings || [] };
}

// ==========================================
// CONCEPTS
// ==========================================
export async function addConcept(slug: string, name: string, description: string) {
  await supabase.from('creative_concepts').insert({ product_slug: slug, name, description });
  await logEvent('creative_concept_added', slug, { name });
  revalidatePath(`/os/creative/${slug}`);
}

// ==========================================
// PACKAGES (NÚCLEO)
// ==========================================
export async function addPackage(slug: string, data: any) {
  // Autogenerar nombre secuencial simple
  const { count } = await supabase.from('creative_packages').select('*', { count: 'exact', head: true }).eq('product_slug', slug);
  const name = `Package #${(count || 0) + 1}`;

  await supabase.from('creative_packages').insert({
    product_slug: slug,
    name,
    concept_id: data.concept_id || null,
    landing_variant_id: data.landing_variant_id || null,
    hook_text: data.hook_text || '',
    copy_text: data.copy_text || '',
    status: 'TESTING'
  });
  
  await logEvent('creative_package_created', slug, { name });
  revalidatePath(`/os/creative/${slug}`);
}

export async function updatePackageStatus(id: string, slug: string, status: string) {
  await supabase.from('creative_packages').update({ status }).eq('id', id);
  await logEvent('creative_package_status_updated', slug, { package_id: id, status });
  revalidatePath(`/os/creative/${slug}`);
}

export async function updatePackageMetrics(id: string, slug: string, metrics: any) {
  // Update the JSONB metrics field safely
  const { data: pkg } = await supabase.from('creative_packages').select('metrics').eq('id', id).single();
  const newMetrics = { ...(pkg?.metrics || {}), ...metrics };
  
  await supabase.from('creative_packages').update({ metrics: newMetrics }).eq('id', id);
  await logEvent('creative_package_metrics_updated', slug, { package_id: id });
  revalidatePath(`/os/creative/${slug}`);
}

export async function duplicatePackage(id: string, slug: string) {
  const { data: pkg } = await supabase.from('creative_packages').select('*').eq('id', id).single();
  if (pkg) {
    const { count } = await supabase.from('creative_packages').select('*', { count: 'exact', head: true }).eq('product_slug', slug);
    const newName = `Package #${(count || 0) + 1} (Clon)`;
    
    // Create new package with parent_id for genealogy
    await supabase.from('creative_packages').insert({
      product_slug: slug,
      name: newName,
      concept_id: pkg.concept_id,
      hook_text: pkg.hook_text,
      copy_text: pkg.copy_text,
      landing_variant_id: pkg.landing_variant_id,
      status: 'TESTING',
      parent_id: id // Genealogía
    });
    
    await logEvent('creative_package_cloned', slug, { parent_id: id, new_name: newName });
    revalidatePath(`/os/creative/${slug}`);
  }
}

export async function archivePackage(id: string, slug: string) {
  await supabase.from('creative_packages').update({ status: 'ARCHIVED' }).eq('id', id);
  revalidatePath(`/os/creative/${slug}`);
}

export async function updatePackageTexts(id: string, slug: string, hookText: string, copyText: string) {
  try {
    await supabase.from('creative_packages').update({ hook_text: hookText, copy_text: copyText }).eq('id', id);
    revalidatePath(`/os/creative/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error updating package texts:", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateAssetContent(id: string, slug: string, content: string) {
  try {
    await supabase.from('creative_assets').update({ content }).eq('id', id);
    revalidatePath(`/os/creative/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error updating asset content:", err.message);
    return { success: false, error: err.message };
  }
}

export async function addScriptAsset(slug: string, content: string) {
  try {
    await supabase.from('creative_assets').insert({
      product_slug: slug,
      type: 'script',
      content
    });
    revalidatePath(`/os/creative/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error("Error adding script asset:", err.message);
    return { success: false, error: err.message };
  }
}
