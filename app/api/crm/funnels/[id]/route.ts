import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, producto, descripcion, activo, color, knowledge_base, bot_prompt } = body;

    const updateFields: any = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (producto !== undefined) updateFields.producto = producto;
    if (descripcion !== undefined) updateFields.descripcion = descripcion;
    if (activo !== undefined) updateFields.activo = activo;
    if (color !== undefined) updateFields.color = color;
    if (knowledge_base !== undefined) updateFields.knowledge_base = knowledge_base;
    if (bot_prompt !== undefined) updateFields.bot_prompt = bot_prompt;

    const { data, error } = await supabase
      .from("funnels")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, funnel: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("funnels")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Funnel eliminado" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
