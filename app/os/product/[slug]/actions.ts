"use server";

import { supabase } from "@/lib/db/supabase";
import { logEvent } from "@/lib/events";
import { revalidatePath } from "next/cache";

export async function getProductData(slug: string) {
  // If the product doesn't exist yet, we create it (auto-provisioning for speed)
  let { data: product } = await supabase.from('products').select('*').eq('slug', slug).single();
  
  if (!product) {
    const { data: newProduct } = await supabase.from('products').insert({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      type: 'Producto Digital', // Campo obligatorio en BD
      color: '#10b981',         // Color por defecto
      status: 'IDEA'
    }).select().single();
    product = newProduct;
    await logEvent('product_created', slug, { source: 'auto_provision' });
  }

  const { data: notes } = await supabase.from('product_notes').select('*').eq('product_slug', slug).single();
  const { data: links } = await supabase.from('product_links').select('*').eq('product_slug', slug);
  const { data: decisions } = await supabase.from('product_decisions').select('*').eq('product_slug', slug).order('created_at', { ascending: false });
  const { data: tasks } = await supabase.from('product_tasks').select('*').eq('product_slug', slug).order('created_at', { ascending: true });

  return { product, notes: notes?.content || "", links: links || [], decisions: decisions || [], tasks: tasks || [] };
}

export async function updateNotes(slug: string, content: string) {
  await supabase.from('product_notes').upsert({ product_slug: slug, content }, { onConflict: 'product_slug' });
}

export async function addDecision(slug: string, decision: string) {
  await supabase.from('product_decisions').insert({ product_slug: slug, decision });
  await logEvent('decision_added', slug, { decision });
  revalidatePath(`/os/product/${slug}`);
}

export async function toggleTask(id: string, completed: boolean, slug: string) {
  await supabase.from('product_tasks').update({ completed }).eq('id', id);
  revalidatePath(`/os/product/${slug}`);
}

export async function addTask(slug: string, title: string) {
  await supabase.from('product_tasks').insert({ product_slug: slug, title });
  revalidatePath(`/os/product/${slug}`);
}

export async function updateStatus(slug: string, status: string) {
  await supabase.from('products').update({ status }).eq('slug', slug);
  await logEvent('status_changed', slug, { status });
  revalidatePath(`/os/product/${slug}`);
}
