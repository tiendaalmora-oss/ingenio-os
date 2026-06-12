import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Extraemos los campos permitidos para actualización
    const { nombre, descripcion, color, ai_goal, ai_valid_intents, ai_faq, followup_delay_minutes, followup_template, followup_condition, drips_config } = body;

    const updates: any = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (color !== undefined) updates.color = color;
    if (ai_goal !== undefined) updates.ai_goal = ai_goal;
    if (ai_valid_intents !== undefined) updates.ai_valid_intents = ai_valid_intents;
    if (ai_faq !== undefined) updates.ai_faq = ai_faq;
    
    // Mantenemos retrocompatibilidad si envían los campos viejos
    if (followup_delay_minutes !== undefined) updates.followup_delay_minutes = followup_delay_minutes;
    if (followup_template !== undefined) updates.followup_template = followup_template;
    if (followup_condition !== undefined) updates.followup_condition = followup_condition;
    
    // El nuevo array de drips (seguimientos múltiples)
    if (drips_config !== undefined) updates.drips_config = drips_config;

    const { data, error } = await supabase
      .from("funnel_steps")
      .update(updates)
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

    // Opcion B: Los contactos en esta etapa quedan en el limbo ("sin etapa")
    const { error: contactsError } = await supabase
      .from("crm_contacts")
      .update({ current_step_id: null })
      .eq("current_step_id", id);
      
    if (contactsError) throw contactsError;

    // Borrar la etapa
    const { error: deleteError } = await supabase
      .from("funnel_steps")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
