"use server"

import { prisma } from "@/lib/prisma"

// MOCK: Para desarrollo inicial, aseguramos que exista un contexto activo
async function ensureActiveContext() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "ceo@hermes.os",
        name: "Emprendedor",
      }
    });
  }

  let workspace = await prisma.workspace.findFirst({
    where: { userId: user.id }
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Mission Control Alpha",
        userId: user.id,
      }
    });

    await prisma.dnaPrinciple.create({
      data: {
         content: "El flujo de caja es la prioridad absoluta en la fase actual.",
         category: "Finanzas",
         workspaceId: workspace.id
      }
    });

    await prisma.decisionRecord.createMany({
      data: [
        {
          title: "Contratar Lead Developer (Startup B)",
          context: "Impacto financiero: Alto. Costo de oportunidad evaluado por IA: 15%",
          workspaceId: workspace.id
        },
        {
          title: "Pausar Campaña B2B Q3",
          context: "Desviación del objetivo de CAC en 42%.",
          workspaceId: workspace.id
        }
      ]
    });
  }

  return { user, workspace };
}

export async function getEngineData() {
  // Evitamos fallos si la DB no está sincronizada aún devolviendo mock fallbacks
  try {
    const { workspace, user } = await ensureActiveContext();

    const decisions = await prisma.decisionRecord.findMany({
      where: { workspaceId: workspace.id, status: "PENDING_REVIEW" },
      orderBy: { createdAt: 'desc' }
    });

    const dna = await prisma.dnaPrinciple.findMany({
      where: { workspaceId: workspace.id }
    });

    return {
      user,
      workspace,
      decisions,
      dna
    };
  } catch (error) {
    // Si la DB no está inicializada (ej. prisma db push no se ha corrido), devolvemos vacio
    return { user: { name: 'Emprendedor' }, workspace: { name: 'Offline Mode' }, decisions: [], dna: [] };
  }
}
