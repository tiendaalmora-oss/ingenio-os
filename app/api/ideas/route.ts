import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

// GET /api/ideas - Obtener todas las ideas
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, ideas: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/ideas - Crear una nueva idea
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      title, niche, notes, pain_points, competitors, status,
      avatar, desires, offer, product_description, branding, creative_brief 
    } = body;

    if (!title || !niche) {
      return NextResponse.json({ success: false, error: "Título y Nicho son obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ideas")
      .insert([
        {
          title,
          niche,
          notes: notes || "",
          pain_points: pain_points || [],
          competitors: competitors || [],
          status: status || "idea",
          avatar: avatar || "",
          desires: desires || [],
          offer: offer || "",
          product_description: product_description || "",
          branding: branding || {},
          creative_brief: creative_brief || {}
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, idea: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/ideas - Actualizar una idea (por ejemplo, cambiar su status al arrastrar en el Kanban)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      id, title, niche, notes, pain_points, competitors, status,
      avatar, desires, offer, product_description, branding, creative_brief 
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "El ID de la idea es obligatorio" }, { status: 400 });
    }

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (niche !== undefined) updateFields.niche = niche;
    if (notes !== undefined) updateFields.notes = notes;
    if (pain_points !== undefined) updateFields.pain_points = pain_points;
    if (competitors !== undefined) updateFields.competitors = competitors;
    if (status !== undefined) updateFields.status = status;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (desires !== undefined) updateFields.desires = desires;
    if (offer !== undefined) updateFields.offer = offer;
    if (product_description !== undefined) updateFields.product_description = product_description;
    if (branding !== undefined) updateFields.branding = branding;
    if (creative_brief !== undefined) updateFields.creative_brief = creative_brief;
    updateFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("ideas")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, idea: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/ideas - Eliminar una idea
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "El ID de la idea es obligatorio" }, { status: 400 });
    }

    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Idea eliminada correctamente" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
