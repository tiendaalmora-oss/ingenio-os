import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, key, descripcion, orden, color, ai_goal, ai_valid_intents, ai_faq } = body;

    const updateFields: any = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (key !== undefined) updateFields.key = key;
    if (descripcion !== undefined) updateFields.descripcion = descripcion;
    if (orden !== undefined) updateFields.orden = orden;
    if (color !== undefined) updateFields.color = color;
    if (ai_goal !== undefined) updateFields.ai_goal = ai_goal;
    if (ai_valid_intents !== undefined) updateFields.ai_valid_intents = ai_valid_intents;
    if (ai_faq !== undefined) updateFields.ai_faq = ai_faq;

    const { data, error } = await supabase
      .from("funnel_steps")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, step: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("funnel_steps")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Etapa eliminada" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
