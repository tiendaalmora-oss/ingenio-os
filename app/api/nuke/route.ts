import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  try {
    const dummyUUID = "00000000-0000-0000-0000-000000000000";

    // Borrar todo
    await supabase.from("landing_variants").delete().neq("id", dummyUUID);
    await supabase.from("variants").delete().neq("id", dummyUUID);
    await supabase.from("creative_packages").delete().neq("id", dummyUUID);
    await supabase.from("creative_assets").delete().neq("id", dummyUUID);
    await supabase.from("creative_concepts").delete().neq("id", dummyUUID);
    await supabase.from("product_tasks").delete().neq("id", dummyUUID);
    
    await supabase.from("ideas").delete().neq("id", dummyUUID);
    await supabase.from("products").delete().neq("id", dummyUUID);

    return NextResponse.json({ success: true, message: "🔥 BASE DE DATOS REAL ELIMINADA POR COMPLETO 🔥" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
