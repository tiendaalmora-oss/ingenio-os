import { supabase } from "@/lib/db/supabase";
import { evaluateGatekeeper } from "@/lib/ai/gatekeeper";
import { classifyGlobalIntent } from "@/lib/ai/router";
import { sendWahaMessage, interpolateTemplate, hasAdvanceIntent } from "@/lib/utils/whatsapp";

export async function executeAIForContact(contactId: string, phone: string, from: string) {
  try {
    // 1. Obtener el contacto actualizado
    const { data: contact } = await supabase
      .from("crm_contacts")
      .select("*, funnels(*)")
      .eq("id", contactId)
      .single();

    if (!contact) {
      console.error(`[AI Processor] Contacto ${contactId} no encontrado.`);
      return;
    }

    if (contact.status === 'humano') {
      console.log(`[AI Processor] Contacto ${contactId} está asignado a un humano. Ignorando IA.`);
      return;
    }

    // 2. Obtener el historial completo (ahora incluye TODOS los mensajes agrupados)
    const { data: chatHistory } = await supabase
      .from("crm_conversations")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: true })
      .limit(20);

    const inboundCount = (chatHistory || []).filter(m => m.direction === "inbound").length;
    
    // Concatenar todos los mensajes entrantes recientes (de los últimos 2 minutos) para el router
    const recentInbounds = (chatHistory || [])
      .filter(m => m.direction === "inbound" && new Date(m.created_at).getTime() > Date.now() - 120000)
      .map(m => m.content)
      .join(" ");
      
    // El último mensaje individual (para logs o validaciones simples)
    const lastContent = contact.ultimo_mensaje || "";

    // ==============================================================
    // FLUJO A: Contacto sin embudo asignado (limbo)
    // ==============================================================
    if (!contact.current_step_id) {
      const { data: activeFunnels } = await supabase.from("funnels").select("*").eq("activo", true);
      let routerResult: { action: string, funnel_id: string | null } = { action: "generic", funnel_id: null };

      if (activeFunnels && activeFunnels.length > 0) {
        try {
          // Usamos el contexto agrupado en lugar de solo el último mensaje
          routerResult = await classifyGlobalIntent(activeFunnels, recentInbounds || lastContent);
        } catch (routerErr) {
          console.error("Error en router IA:", routerErr);
        }
      }

      if (routerResult.action === "human") {
        await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
        const humanMsg = "Entendido. Un asesor se pondrá en contacto contigo a la brevedad para ayudarte con esto.";
        const sendResult = await sendWahaMessage(from, humanMsg);
        await supabase.from("crm_conversations").insert([{
          contact_id: contact.id, direction: "outbound", type: "text",
          content: humanMsg, metadata: { escalated_to_human: true, reason: "router_decision", sendResult }
        }]);
        await supabase.from("contact_events").insert([{
          contact_id: contact.id, tipo: "escalado_humano", descripcion: "Enviado a soporte/humano por decisión del Router IA."
        }]);
        return;
      }

      if (routerResult.action === "funnel" && routerResult.funnel_id) {
        const assignedFunnelId = routerResult.funnel_id;
        let stepId = null;

        const { data: firstStep } = await supabase.from("funnel_steps").select("id").eq("funnel_id", assignedFunnelId).order("orden", { ascending: true }).limit(1).single();
        if (firstStep) stepId = firstStep.id;
        
        const assignedFunnel = activeFunnels?.find(f => f.id === assignedFunnelId);
        const newTag = assignedFunnel ? `Interesado ${assignedFunnel.producto}` : "Nuevo Lead";
        
        const currentTags = Array.isArray(contact.tags) ? contact.tags : [];
        const updatedTags = currentTags.includes(newTag) ? currentTags : [...currentTags, newTag];

        await supabase.from("crm_contacts").update({ 
          funnel_id: assignedFunnelId, 
          current_step_id: stepId,
          tags: updatedTags 
        }).eq("id", contact.id);
        
        if (stepId) {
          const { data: template } = await supabase.from("bot_templates").select("*").eq("step_id", stepId).order("created_at", { ascending: true }).limit(1).single();
          if (template && template.mensaje) {
            const msg = interpolateTemplate(template.mensaje, contact);
            const sendResult = await sendWahaMessage(from, msg);
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id, direction: "outbound", type: "text",
              content: sendResult.success ? msg : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
              metadata: { template_id: template.id, sendResult }
            }]);
          }
        }
      } else {
        // Router genérico
        const isNewContact = inboundCount <= 1; // Simplificado
        
        if (isNewContact) {
          const fallbackMsg = "¡Hola! Gracias por escribir.\n\nContanos brevemente: ¿Qué producto o sistema te interesa? ¿O ya sos cliente nuestro?";
          await sendWahaMessage(from, fallbackMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id, direction: "outbound", type: "text",
            content: fallbackMsg, metadata: { router_fallback: true }
          }]);
        } else if (inboundCount === 2 || inboundCount === 3) {
          const nudgeMsg = "Hola de nuevo 👋 Para poder derivarte rápido, por favor contanos: ¿Qué producto estás buscando? (Ej: *\"Demo AviOS\"*, *\"Balanza\"*, *\"Renovar licencia\"*).";
          await sendWahaMessage(from, nudgeMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id, direction: "outbound", type: "text",
            content: nudgeMsg, metadata: { router_fallback: true }
          }]);
        } else {
          await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
          const humanMsg = "Gracias por tu paciencia 🙏 Uno de nuestros asesores te va a contactar en breve para ayudarte personalmente.";
          await sendWahaMessage(from, humanMsg);
          await supabase.from("crm_conversations").insert([{
            contact_id: contact.id, direction: "outbound", type: "text",
            content: humanMsg, metadata: { escalated_to_human: true, reason: "limbo_timeout" }
          }]);
        }
      }

    // ==============================================================
    // FLUJO B: Contacto con embudo asignado
    // ==============================================================
    } else {
      const { data: currentStep } = await supabase
        .from("funnel_steps")
        .select("*, funnels(*)")
        .eq("id", contact.current_step_id)
        .single();

      if (currentStep) {
        if (!currentStep.ai_goal) {
          // Usamos el contenido concatenado reciente para buscar palabras clave
          const advanceIntent = hasAdvanceIntent(recentInbounds || lastContent);
          if (advanceIntent) {
            const { data: nextStep } = await supabase
              .from("funnel_steps")
              .select("*")
              .eq("funnel_id", currentStep.funnel_id)
              .gt("orden", currentStep.orden)
              .order("orden", { ascending: true })
              .limit(1)
              .single();

              if (nextStep) {
                await supabase.from("crm_contacts").update({ current_step_id: nextStep.id }).eq("id", contact.id);
                const { data: nextTemplate } = await supabase.from("bot_templates").select("*").eq("step_id", nextStep.id).order("created_at", { ascending: true }).limit(1).single();
                
                if (nextTemplate && nextTemplate.mensaje && nextTemplate.mensaje.trim() !== "") {
                  const msg = interpolateTemplate(nextTemplate.mensaje, contact);
                  const sendResult = await sendWahaMessage(from, msg);
                  await supabase.from("crm_conversations").insert([{
                    contact_id: contact.id, direction: "outbound", type: "text",
                    content: sendResult.success ? msg : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                    metadata: { template_id: nextTemplate.id, ai_action: "keyword_advance" }
                  }]);
                } else if (nextStep.ai_goal) {
                  // Flujo 100% conversacional: Evaluamos la nueva etapa inmediatamente con el mismo mensaje del usuario
                  try {
                    const aiResultNew = await evaluateGatekeeper(chatHistory || [], nextStep, lastContent);
                    if (aiResultNew.accion === "responder" && aiResultNew.respuesta_ia) {
                      const sendResult = await sendWahaMessage(from, aiResultNew.respuesta_ia);
                      await supabase.from("crm_conversations").insert([{
                        contact_id: contact.id, direction: "outbound", type: "text",
                        content: sendResult.success ? aiResultNew.respuesta_ia : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                        metadata: { ai_action: "responder_avance_keyword", sendResult }
                      }]);
                    }
                  } catch (err) {
                    console.error("Error evaluando nueva etapa conversacional (keyword):", err);
                  }
                }
              } else {
              const endMsg = "¡Genial! 🎉 Hemos registrado tu interés. Un asesor se va a poner en contacto contigo muy pronto para cerrar los detalles.";
              await sendWahaMessage(from, endMsg);
              await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
              await supabase.from("crm_conversations").insert([{
                contact_id: contact.id, direction: "outbound", type: "text",
                content: endMsg, metadata: { funnel_completed: true }
              }]);
            }
          }
        } else {
          try {
            // Pasamos todo el historial al Gatekeeper (que ya incluye los mensajes agrupados)
            const aiResult = await evaluateGatekeeper(chatHistory || [], currentStep, lastContent);

            if (aiResult.accion === "avanzar") {
              const { data: nextStep } = await supabase
                .from("funnel_steps")
                .select("*")
                .eq("funnel_id", currentStep.funnel_id)
                .gt("orden", currentStep.orden)
                .order("orden", { ascending: true })
                .limit(1)
                .single();

              if (nextStep) {
                await supabase.from("crm_contacts").update({ current_step_id: nextStep.id }).eq("id", contact.id);
                const { data: nextTemplate } = await supabase.from("bot_templates").select("*").eq("step_id", nextStep.id).order("created_at", { ascending: true }).limit(1).single();
                
                if (nextTemplate && nextTemplate.mensaje && nextTemplate.mensaje.trim() !== "") {
                  const msg = interpolateTemplate(nextTemplate.mensaje, contact);
                  const sendResult = await sendWahaMessage(from, msg);
                  await supabase.from("crm_conversations").insert([{
                    contact_id: contact.id, direction: "outbound", type: "text",
                    content: sendResult.success ? msg : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                    metadata: { template_id: nextTemplate.id, ai_action: "avanzar", sendResult }
                  }]);
                } else if (nextStep.ai_goal) {
                  // Flujo 100% conversacional: Evaluamos la nueva etapa inmediatamente con el mismo mensaje del usuario
                  try {
                    const aiResultNew = await evaluateGatekeeper(chatHistory || [], nextStep, lastContent);
                    if (aiResultNew.accion === "responder" && aiResultNew.respuesta_ia) {
                      const sendResult = await sendWahaMessage(from, aiResultNew.respuesta_ia);
                      await supabase.from("crm_conversations").insert([{
                        contact_id: contact.id, direction: "outbound", type: "text",
                        content: sendResult.success ? aiResultNew.respuesta_ia : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                        metadata: { ai_action: "responder_avance", sendResult }
                      }]);
                    }
                  } catch (err) {
                    console.error("Error evaluando nueva etapa conversacional:", err);
                  }
                }
              } else {
                const endMsg = "¡Excelente! 🎉 Ya tenemos toda la información que necesitamos. Un asesor te va a contactar pronto para los detalles finales.";
                await sendWahaMessage(from, endMsg);
                await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
                await supabase.from("crm_conversations").insert([{
                  contact_id: contact.id, direction: "outbound", type: "text",
                  content: endMsg, metadata: { funnel_completed: true }
                }]);
              }
            } else if (aiResult.accion === "responder" && aiResult.respuesta_ia) {
              const sendResult = await sendWahaMessage(from, aiResult.respuesta_ia);
              await supabase.from("crm_conversations").insert([{
                contact_id: contact.id, direction: "outbound", type: "text",
                content: sendResult.success ? aiResult.respuesta_ia : `[ERROR WAHA] Falló el envío: ${sendResult.error}`,
                metadata: { ai_action: "responder", sendResult }
              }]);
            } else if (aiResult.accion === "humano") {
              await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
              await supabase.from("contact_events").insert([{
                contact_id: contact.id, tipo: "escalado_humano", descripcion: "IA detectó necesidad de atención humana"
              }]);
              const humanMsg = "Entendido 👍 Voy a conectarte con uno de nuestros asesores para que pueda ayudarte mejor. ¡En breve te contactan!";
              await sendWahaMessage(from, humanMsg);
              await supabase.from("crm_conversations").insert([{
                contact_id: contact.id, direction: "outbound", type: "text",
                content: humanMsg, metadata: { ai_action: "humano" }
              }]);
            }
          } catch (aiErr: any) {
            console.error("Error en evaluación de IA:", aiErr);
            const errorFallbackMsg = "Gracias por tu mensaje 🙏 En breve uno de nuestros asesores te va a ayudar personalmente.";
            await sendWahaMessage(from, errorFallbackMsg);
            await supabase.from("crm_contacts").update({ status: "humano" }).eq("id", contact.id);
            await supabase.from("crm_conversations").insert([{
              contact_id: contact.id, direction: "outbound", type: "text",
              content: errorFallbackMsg, metadata: { ai_error: aiErr.message, fallback_to_human: true }
            }]);
          }
        }
      }
    }

  } catch (error) {
    console.error("[AI Processor] Error general ejecutando IA:", error);
  }
}
