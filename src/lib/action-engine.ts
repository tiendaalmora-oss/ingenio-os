import { prisma } from "./prisma";

export class ActionEngine {
  /**
   * Inicializa el Tool Registry base con los Executive Skills fundacionales
   */
  static async initializeRegistry(workspaceId: string) {
    const existingTools = await prisma.executiveTool.count({ where: { workspaceId } });
    
    if (existingTools === 0) {
      const coreSkills = [
        { name: "create_goal", description: "Crear un nuevo objetivo estratégico", category: "Goals", permissions: "WRITE", parameters: {}, expectedResult: "Objetivo creado en DB" },
        { name: "create_task", description: "Crear una tarea en el backlog", category: "Tasks", permissions: "WRITE", parameters: {}, expectedResult: "Tarea encolada" },
        { name: "start_focus_mode", description: "Iniciar modo de enfoque para trabajo profundo", category: "Focus Mode", permissions: "READ", parameters: {}, expectedResult: "UI cambia a Focus Mode" },
        { name: "send_email", description: "Enviar correo a clientes o equipo", category: "Communication", permissions: "CRITICAL", parameters: {}, expectedResult: "Email enviado" },
      ];

      for (const skill of coreSkills) {
        await prisma.executiveTool.create({
          data: {
            ...skill,
            workspaceId
          }
        });
      }
    }
  }

  /**
   * Un agente invoca una herramienta.
   * Pasa por la capa de aprobación humana (Human Approval Layer) si es CRÍTICA.
   */
  static async invokeTool(workspaceId: string, toolName: string, agent: string, payload: any = {}) {
    const tool = await prisma.executiveTool.findFirst({
      where: { name: toolName, workspaceId }
    });

    if (!tool) throw new Error(`Tool ${toolName} not found in registry`);

    const requiresApproval = tool.permissions === "CRITICAL";

    const execution = await prisma.toolExecution.create({
      data: {
        toolId: tool.id,
        agent,
        payload,
        status: requiresApproval ? "PENDING_APPROVAL" : "AUTO_EXECUTED",
        workspaceId
      }
    });

    if (!requiresApproval) {
      // Execute immediately (mock)
      return this.executeAction(execution.id);
    }

    return execution;
  }

  static async executeAction(executionId: string) {
    const execution = await prisma.toolExecution.findUnique({ where: { id: executionId }, include: { tool: true } });
    if (!execution) return;

    // Lógica de ejecución simulada
    await prisma.toolExecution.update({
      where: { id: executionId },
      data: { status: "EXECUTED", executedAt: new Date(), result: { success: true } }
    });

    // Aprender en Strategic Memory y Timeline
    await prisma.timelineEvent.create({
      data: {
        eventType: "ACTION",
        description: `Agente ${execution.agent} ejecutó ${execution.tool.name}`,
        workspaceId: execution.workspaceId
      }
    });

    await prisma.strategicMemory.create({
      data: {
        recommendation: `Ejecutar ${execution.tool.name}`,
        userDecision: "APPROVED_OR_AUTO",
        actualResult: "Success",
        workspaceId: execution.workspaceId
      }
    });

    return { success: true };
  }
}
