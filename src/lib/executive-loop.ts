import { prisma } from "./prisma";

/**
 * El Executive Loop es el corazón proactivo de Hermes.
 * 1. Observar (Recolectar contexto actual)
 * 2. Analizar (Detectar riesgos y oportunidades)
 * 3. Decidir (Calcular impacto)
 * 4. Actuar (Generar Queue)
 * 5. Aprender (Registrar Memoria Estratégica)
 */
export async function runExecutiveLoop(workspaceId: string) {
  // En una versión completa, aquí llamaríamos al LLM (Ingenio AI Core) para analizar.
  // Por ahora, simulamos el motor de reglas heurísticas para poblar el sistema.

  // 1. OBSERVAR
  const goals = await prisma.goal.findMany({ where: { workspaceId } });
  const dna = await prisma.dnaPrinciple.findMany({ where: { workspaceId } });
  const activeDecisions = await prisma.decisionRecord.findMany({ where: { workspaceId, status: "PENDING_REVIEW" } });

  // Inicializar Tool Registry
  const { ActionEngine } = await import('./action-engine');
  await ActionEngine.initializeRegistry(workspaceId);

  // Integración: Si no hay acciones en la Queue, inyectamos prioridades basadas en impacto y simulamos invocación de tool
  if (activeDecisions.length === 0) {
    try {
      const pendingExecutions = await prisma.toolExecution.count({ where: { workspaceId, status: "PENDING_APPROVAL" } });
      if (pendingExecutions === 0) {
        await ActionEngine.invokeTool(workspaceId, "send_email", "Executive Loop", { to: "equipo@hermes.os", subject: "Alerta de desviación del CAC" });
      }
    } catch (e) { /* ignore */ }
  }

  // 2. ANALIZAR & 3. DECIDIR & 4. ACTUAR
  // Si no hay acciones en la Queue, inyectamos prioridades basadas en impacto
  const currentQueue = await prisma.queueAction.findMany({
    where: { workspaceId, status: "PENDING" }
  });

  if (currentQueue.length === 0) {
    await prisma.queueAction.createMany({
      data: [
        {
          title: "Ajustar Presupuesto de Ads Q3",
          expectedImpact: 85,
          reason: "Desviación del CAC en 42% detectada. El flujo de caja es prioridad (DNA).",
          workspaceId
        },
        {
          title: "Aprobar Contratación Lead Developer",
          expectedImpact: 70,
          reason: "Bloqueo crítico para el objetivo anual de producto.",
          workspaceId
        },
        {
          title: "Revisión de Arquitectura Backend",
          expectedImpact: 45,
          reason: "Deuda técnica reportada por el equipo, pero no bloquea ventas.",
          workspaceId
        }
      ]
    });
  }

  // Asegurar Health Metrics
  const metrics = await prisma.healthMetric.count({ where: { workspaceId } });
  if (metrics === 0) {
    await prisma.healthMetric.createMany({
      data: [
        { category: "Ventas", status: "WARNING", value: "-15% MRR", workspaceId },
        { category: "Caja", status: "HEALTHY", value: "8 meses runway", workspaceId },
        { category: "Marketing", status: "CRITICAL", value: "CAC alto", workspaceId },
        { category: "Producto", status: "HEALTHY", value: "Estable", workspaceId },
        { category: "Riesgos", status: "HEALTHY", value: "Nominal", workspaceId }
      ]
    });
  }

  // Calcular Impact Score Diario (Mock)
  const today = new Date();
  today.setHours(0,0,0,0);

  const existingScore = await prisma.impactScore.findFirst({
    where: { workspaceId, date: today }
  });

  if (!existingScore) {
    await prisma.impactScore.create({
      data: {
        date: today,
        score: 64,
        details: { "decision_taken": 20, "goal_progress": 44 },
        workspaceId
      }
    });
  }

  return true;
}
