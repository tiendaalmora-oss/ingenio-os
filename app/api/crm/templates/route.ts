import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const funnel_id = searchParams.get("funnel_id");

    let query = supabase
      .from("bot_templates")
      .select(`
        *,
        funnel_steps (nombre, key, color)
      `)
      .order("orden", { ascending: true });

    if (funnel_id) {
      query = query.eq("funnel_id", funnel_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, templates: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funnel_id, step_id, trigger_key, nombre, mensaje, orden } = body;

    if (!funnel_id || !trigger_key || !nombre || !mensaje) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bot_templates")
      .insert([{ funnel_id, step_id, trigger_key, nombre, mensaje, orden }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, template: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, mensaje, activo, nombre, trigger_key, orden } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "El ID es obligatorio" }, { status: 400 });
    }

    const updateFields: any = { updated_at: new Date().toISOString() };
    if (mensaje !== undefined) updateFields.mensaje = mensaje;
    if (activo !== undefined) updateFields.activo = activo;
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (trigger_key !== undefined) updateFields.trigger_key = trigger_key;
    if (orden !== undefined) updateFields.orden = orden;

    const { data, error } = await supabase
      .from("bot_templates")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, template: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "El ID es obligatorio" }, { status: 400 });
    }

    const { error } = await supabase
      .from("bot_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Plantilla eliminada" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
