"use server";

import { supabase } from "./db/supabase";

export async function logEvent(type: string, productSlug: string | null, payload: any = {}) {
  const { error } = await supabase.from('events').insert({
    type,
    product_slug: productSlug,
    payload
  });
  
  if (error) {
    console.error("[Event System] Error logging event:", error);
  } else {
    console.log(`[Event System] Logged: ${type} for ${productSlug}`);
  }
}
