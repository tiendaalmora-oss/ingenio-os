"use server"

import { prisma } from "@/lib/prisma"

export async function getActiveContext() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  if (!user) return null;

  const workspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  if (!workspace) return null;

  return { user, workspace };
}

export async function getEngineData() {
  try {
    const context = await getActiveContext();
    if (!context) {
      return null; // Signals the UI to redirect to onboarding
    }

    const { workspace, user } = context;

    // 1. Ejecutar Executive Loop para mantener la proactividad del sistema
    const { runExecutiveLoop } = await import('@/lib/executive-loop');
    await runExecutiveLoop(workspace.id);

    const decisions = await prisma.decisionRecord.findMany({
      where: { workspaceId: workspace.id, status: "PENDING_REVIEW" },
      orderBy: { createdAt: 'desc' }
    });

    const dna = await prisma.dnaPrinciple.findMany({
      where: { workspaceId: workspace.id }
    });

    const timeline = await prisma.timelineEvent.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const queue = await prisma.queueAction.findMany({
      where: { workspaceId: workspace.id, status: "PENDING" },
      orderBy: { expectedImpact: 'desc' }
    });

    const health = await prisma.healthMetric.findMany({
      where: { workspaceId: workspace.id }
    });

    const today = new Date();
    today.setHours(0,0,0,0);
    const impactScore = await prisma.impactScore.findFirst({
      where: { workspaceId: workspace.id, date: today }
    });

    const pendingExecutions = await prisma.toolExecution.findMany({
      where: { workspaceId: workspace.id, status: "PENDING_APPROVAL" },
      include: { tool: true },
      orderBy: { createdAt: 'desc' }
    });

    return {
      user,
      workspace,
      decisions,
      dna,
      timeline,
      queue,
      health,
      impactScore,
      pendingExecutions
    };
  } catch (error) {
    return { user: { name: 'Emprendedor' }, workspace: { name: 'Offline Mode' }, decisions: [], dna: [], timeline: [], queue: [], health: [], impactScore: null, pendingExecutions: [] };
  }
}

export async function completeOnboarding(answers: Record<string, string>) {
  const rawIntro = answers["intro"] || "";
  const rawGoals = answers["goals"] || "";
  const rawPrinciples = answers["principles"] || "";
  const rawProjects = answers["projects"] || "";

  const name = rawIntro.split(' ')[0] || "Emprendedor";

  const user = await prisma.user.create({
    data: {
      email: `user_${Date.now()}@hermes.os`,
      name: name,
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Mission Control",
      description: answers["industry"] || "Industria Estratégica",
      userId: user.id,
    }
  });

  await prisma.dnaPrinciple.createMany({
    data: [
      {
        content: `Misión Estratégica: ${rawGoals}`,
        category: "Estrategia",
        workspaceId: workspace.id
      },
      {
         content: `Principios Rectores: ${rawPrinciples}`,
         category: "Liderazgo",
         workspaceId: workspace.id
      },
      {
         content: `Métricas Clave (KPIs): ${answers["kpis"] || ""}`,
         category: "Operaciones",
         workspaceId: workspace.id
      }
    ]
  });

  if (rawProjects) {
    await prisma.decisionRecord.create({
      data: {
        title: "Definir viabilidad de proyectos actuales",
        context: `Proyectos mencionados en onboarding: ${rawProjects}`,
        workspaceId: workspace.id
      }
    });
  }

  await prisma.timelineEvent.create({
    data: {
      eventType: "MILESTONE",
      description: "Entrevista de Onboarding completada. Executive DNA generado y motor inicializado.",
      workspaceId: workspace.id
    }
  });

  return { success: true };
}
