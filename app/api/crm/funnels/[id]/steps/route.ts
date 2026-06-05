import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from("funnel_steps")
      .select("*")
      .eq("funnel_id", id)
      .order("orden", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, steps: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, key, descripcion, orden, color } = body;

    if (!nombre || !key || orden === undefined) {
      return NextResponse.json({ success: false, error: "Nombre, key y orden son obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("funnel_steps")
      .insert([{ funnel_id: id, nombre, key, descripcion, orden, color }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, step: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
