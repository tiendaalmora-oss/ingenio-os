import { prisma } from "./prisma";

export async function buildExecutiveContext(workspaceId: string, cognitiveMode: string = "CEO") {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [
          { id: workspaceId },
          { name: "Mission Control" }
        ]
      },
      include: {
        dnaPrinciples: true,
        healthMetrics: true,
        queueActions: { where: { status: "PENDING" }, orderBy: { expectedImpact: "desc" }, take: 5 },
        timelineEvents: { orderBy: { createdAt: "desc" }, take: 5 },
        goals: true,
      }
    });

    if (!workspace) {
      return {
        dna: "El flujo de caja y la conversión son la prioridad absoluta en la fase actual.",
        health: "Estado nominal. Atención en CAC.",
        queue: ["Ajustar Presupuesto de Ads Q3 (Impact 85)", "Aprobar Lead Developer (Impact 70)"],
        mode: cognitiveMode,
        systemPrompt: `Eres Hermes, el Chief of Staff y Sistema Operativo Ejecutivo del usuario.
Tu misión no es responder dudas genéricas, sino optimizar la atención, decisiones y ejecución estratégica del emprendedor.
Modo Activo: ${cognitiveMode}.
Principio Rector: El flujo de caja y la conversión son la prioridad absoluta.
Sé directo, ejecutivo, conciso y estratégico. Prioriza siempre la acción sobre la deliberación.`
      };
    }

    const dnaSummary = workspace.dnaPrinciples.map(p => `[${p.category}] ${p.content}`).join("\n");
    const healthSummary = workspace.healthMetrics.map(h => `${h.category}: ${h.value} (${h.status})`).join(", ");
    const queueSummary = workspace.queueActions.map(q => `- ${q.title} (Impacto: ${q.expectedImpact}): ${q.reason}`).join("\n");

    const systemPrompt = `Eres Hermes, el Chief of Staff impulsado por IA y Sistema Operativo Ejecutivo de la empresa "${workspace.name}".
Tu rol es actuar como un Director Ejecutivo de élite que ayuda al fundador a tomar mejores decisiones, proteger su atención y ejecutar su misión.

MODO COGNITIVO ACTIVO: ${cognitiveMode} Mode
${cognitiveMode === 'CEO' ? 'Enfócate en rentabilidad, caja, estrategia general y liderazgo.' : ''}
${cognitiveMode === 'CTO' ? 'Enfócate en arquitectura, deuda técnica, estabilidad y roadmap técnico.' : ''}
${cognitiveMode === 'CMO' ? 'Enfócate en adquisición, CAC, embudos, conversión y crecimiento.' : ''}

EXECUTIVE DNA (Principios inquebrantables del usuario):
${dnaSummary || 'Flujo de caja y ejecución comercial primero.'}

EXECUTIVE HEALTH ACTUAL:
${healthSummary || 'Nominal'}

EXECUTIVE QUEUE (Acciones priorizadas por impacto):
${queueSummary || 'Ninguna acción crítica pendiente.'}

REGLAS DE CONDUCTA:
1. Sé conciso, directo y contundente. Sin relleno ni saludos innecesarios.
2. Si el usuario propone algo que contradice su Executive DNA o desvía el foco de su misión, adviértele inmediatamente.
3. Propón siempre la siguiente acción de más alto apalancamiento.`;

    return {
      workspace,
      dnaSummary,
      healthSummary,
      queueSummary,
      systemPrompt
    };
  } catch (error) {
    return {
      systemPrompt: `Eres Hermes, Chief of Staff Ejecutivo. Modo: ${cognitiveMode}.`
    };
  }
}
