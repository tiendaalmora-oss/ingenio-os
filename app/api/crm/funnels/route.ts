import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("funnels")
      .select("*, funnel_steps(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Sort steps by 'orden'
    const funnels = data.map((f: any) => {
      if (f.funnel_steps) {
        f.funnel_steps.sort((a: any, b: any) => a.orden - b.orden);
      }
      return f;
    });

    return NextResponse.json({ success: true, funnels });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, producto, descripcion, color } = body;

    if (!nombre || !producto) {
      return NextResponse.json({ success: false, error: "Nombre y producto son obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("funnels")
      .insert([{ nombre, producto, descripcion, color }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, funnel: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
