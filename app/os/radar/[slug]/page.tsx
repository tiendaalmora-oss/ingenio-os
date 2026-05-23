import React from "react";
import CreativeRadarClient from "./CreativeRadarClient";
import { supabase } from "@/lib/db/supabase";

export default async function CreativeRadarPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // Just fetch the basic product info for the header
  const { data: product } = await supabase.from('products').select('*').eq('slug', resolvedParams.slug).single();

  return <CreativeRadarClient slug={resolvedParams.slug} product={product} />;
}
