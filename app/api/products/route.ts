import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

// GET /api/products - Obtener todos los productos SaaS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, products: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/products - Crear un nuevo producto SaaS
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      slug, 
      name, 
      type, 
      color, 
      status, 
      mrr, 
      leads, 
      sections, 
      deployment_domain, 
      deployment_status, 
      deployment_docker, 
      deployment_ssl 
    } = body;

    if (!slug || !name || !type) {
      return NextResponse.json({ success: false, error: "Slug, Nombre y Tipo son obligatorios" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          slug,
          name,
          type,
          color: color || "#10b981",
          status: status || "building",
          mrr: mrr || 0,
          leads: leads || 0,
          sections: sections || ["landing"],
          deployment_domain: deployment_domain || "",
          deployment_status: deployment_status || "pending",
          deployment_docker: deployment_docker ?? true,
          deployment_ssl: deployment_ssl ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/products - Actualizar un producto SaaS
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      id,
      slug, 
      name, 
      type, 
      color, 
      status, 
      mrr, 
      leads, 
      sections, 
      deployment_domain, 
      deployment_status, 
      deployment_docker, 
      deployment_ssl 
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "El ID del producto es obligatorio" }, { status: 400 });
    }

    const updateFields: any = {};
    if (slug !== undefined) updateFields.slug = slug;
    if (name !== undefined) updateFields.name = name;
    if (type !== undefined) updateFields.type = type;
    if (color !== undefined) updateFields.color = color;
    if (status !== undefined) updateFields.status = status;
    if (mrr !== undefined) updateFields.mrr = mrr;
    if (leads !== undefined) updateFields.leads = leads;
    if (sections !== undefined) updateFields.sections = sections;
    if (deployment_domain !== undefined) updateFields.deployment_domain = deployment_domain;
    if (deployment_status !== undefined) updateFields.deployment_status = deployment_status;
    if (deployment_docker !== undefined) updateFields.deployment_docker = deployment_docker;
    if (deployment_ssl !== undefined) updateFields.deployment_ssl = deployment_ssl;

    const { data, error } = await supabase
      .from("products")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/products - Eliminar un producto SaaS
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "El ID del producto es obligatorio" }, { status: 400 });
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
