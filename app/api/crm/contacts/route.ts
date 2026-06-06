import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const funnel_id = searchParams.get("funnel_id");
    const step_id = searchParams.get("step_id");
    const is_test = searchParams.get("is_test");
    const search = searchParams.get("search");

    let query = supabase
      .from("crm_contacts")
      .select(`
        *,
        funnels (nombre),
        funnel_steps (nombre, key, color)
      `)
      .order("updated_at", { ascending: false });

    if (funnel_id === "limbo") {
      query = query.is("funnel_id", null);
    } else if (funnel_id && funnel_id !== "all") {
      query = query.eq("funnel_id", funnel_id);
    }
    if (step_id) query = query.eq("current_step_id", step_id);
    if (is_test !== null) query = query.eq("is_test", is_test === "true");
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, contacts: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name, funnel_id, current_step_id, is_test } = body;

    if (!phone || !funnel_id) {
      return NextResponse.json({ success: false, error: "Teléfono y embudo son obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("crm_contacts")
      .insert([{ phone, name, funnel_id, current_step_id, is_test }])
      .select()
      .single();

    if (error) throw error;

    // Registrar evento inicial
    await supabase.from("contact_events").insert([{
      contact_id: data.id,
      tipo: "contacto_creado",
      descripcion: "Contacto ingresado al embudo"
    }]);

    return NextResponse.json({ success: true, contact: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const is_test = searchParams.get("is_test");
    const funnel_id = searchParams.get("funnel_id");

    if (is_test !== "true") {
      return NextResponse.json({ success: false, error: "Solo se puede hacer borrado masivo de números de prueba" }, { status: 400 });
    }

    let query = supabase.from("crm_contacts").delete().eq("is_test", true);
    
    if (funnel_id) {
      query = query.eq("funnel_id", funnel_id);
    }

    const { error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Contactos de prueba eliminados" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
