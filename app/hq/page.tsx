"use client";

import React, { useState } from "react";
import { Sidebar, ModuleId } from "../os/components/Sidebar";
import { TopBar } from "../os/components/TopBar";
import { OperationsModule } from "../os/modules/OperationsModule";
import { ProductFactoryModule } from "../os/modules/ProductFactoryModule";
import { LandingFactoryModule } from "../os/modules/LandingFactoryModule";
import { CreativeLabModule } from "../os/modules/CreativeLabModule";
import { MetaOpsModule } from "../os/modules/MetaOpsModule";
import { MetricsModule } from "../os/modules/MetricsModule";
import { AIAgentsModule } from "../os/modules/AIAgentsModule";
import { DeploymentCenterModule } from "../os/modules/DeploymentCenterModule";
import { IntegrationsModule } from "../os/modules/IntegrationsModule";
import { WorkflowsModule } from "../os/modules/WorkflowsModule";

export default function IngenioOSDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleId>("operations");

  const moduleTitles: Record<ModuleId, string> = {
    operations: "Operaciones Globales",
    product_factory: "Fábrica de Productos",
    landing_factory: "Fábrica de Landings",
    creative_lab: "Laboratorio Creativo",
    meta_ops: "Control Meta Ops",
    metrics: "Motor de Decisiones — Métricas",
    ai_agents: "Agentes IA",
    deployment_center: "Centro de Despliegue",
    integrations: "Centro de Integraciones",
    workflows: "Flujos de Automatización",
  };

  return (
    <main className="bg-zinc-950 text-white min-h-screen flex overflow-hidden">
      <Sidebar activeModule={activeModule} onSelect={setActiveModule} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <TopBar title={moduleTitles[activeModule]} />

        <div className="flex-1 overflow-y-auto">
          {activeModule === "operations" && <OperationsModule />}
          {activeModule === "product_factory" && <ProductFactoryModule />}
          {activeModule === "landing_factory" && <LandingFactoryModule />}
          {activeModule === "creative_lab" && <CreativeLabModule />}
          {activeModule === "meta_ops" && <MetaOpsModule />}
          {activeModule === "metrics" && <MetricsModule />}
          {activeModule === "ai_agents" && <AIAgentsModule />}
          {activeModule === "deployment_center" && <DeploymentCenterModule />}
          {activeModule === "integrations" && <IntegrationsModule />}
          {activeModule === "workflows" && <WorkflowsModule />}
        </div>
      </div>
    </main>
  );
}
