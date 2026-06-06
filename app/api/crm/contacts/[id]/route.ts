import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Obtener contacto
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select(`
        *,
        funnels (nombre),
        funnel_steps!current_step_id (nombre, key, color)
      `)
      .eq("id", id)
      .single();

    if (contactError) throw contactError;

    // Obtener historial
    const { data: events, error: eventsError } = await supabase
      .from("contact_events")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false });

    // Obtener conversaciones
    const { data: conversations, error: conversationsError } = await supabase
      .from("crm_conversations")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: true });

    if (eventsError) throw eventsError;
    if (conversationsError) throw conversationsError;

    return NextResponse.json({ success: true, contact, events, conversations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { current_step_id, notas, name, is_test, status } = body;

    // Obtener el estado actual para ver qué cambió
    const { data: oldContact } = await supabase.from("crm_contacts").select("current_step_id, notas, name, status").eq("id", id).single();

    const updateFields: any = { updated_at: new Date().toISOString() };
    if (current_step_id !== undefined) updateFields.current_step_id = current_step_id;
    if (notas !== undefined) updateFields.notas = notas;
    if (name !== undefined) updateFields.name = name;
    if (is_test !== undefined) updateFields.is_test = is_test;
    if (status !== undefined) updateFields.status = status;

    const { data, error } = await supabase
      .from("crm_contacts")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Registrar eventos según los cambios
    if (oldContact && current_step_id !== undefined && oldContact.current_step_id !== current_step_id) {
      await supabase.from("contact_events").insert([{
        contact_id: id,
        tipo: "etapa_cambiada",
        descripcion: "Contacto movido a nueva etapa"
      }]);
    }
    
    if (oldContact && notas !== undefined && oldContact.notas !== notas) {
      await supabase.from("contact_events").insert([{
        contact_id: id,
        tipo: "nota_agregada",
        descripcion: "Notas actualizadas"
      }]);
    }

    if (oldContact && status !== undefined && oldContact.status !== status) {
      await supabase.from("contact_events").insert([{
        contact_id: id,
        tipo: status === 'humano' ? "escalado_humano" : "devuelto_bot",
        descripcion: status === 'humano' ? "Escalado manualmente a atención humana" : "Devuelto al flujo automático del bot"
      }]);
    }

    return NextResponse.json({ success: true, contact: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("crm_contacts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Contacto eliminado" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
