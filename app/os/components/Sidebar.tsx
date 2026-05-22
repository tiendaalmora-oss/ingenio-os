import React from "react";

export type ModuleId = "operations" | "product_factory" | "landing_factory" | "creative_lab" | "meta_ops" | "metrics" | "ai_agents" | "deployment_center";

interface SidebarProps {
  activeModule: ModuleId;
  onSelect: (mod: ModuleId) => void;
}

export function Sidebar({ activeModule, onSelect }: SidebarProps) {
  const modules: { id: ModuleId; label: string; icon: string }[] = [
    { id: "operations", label: "Operaciones", icon: "🌐" },
    { id: "product_factory", label: "Fábrica de Productos", icon: "🏭" },
    { id: "landing_factory", label: "Fábrica de Landings", icon: "🎨" },
    { id: "creative_lab", label: "Laboratorio Creativo", icon: "✨" },
    { id: "meta_ops", label: "Meta Ops", icon: "📢" },
    { id: "metrics", label: "Métricas", icon: "📈" },
    { id: "ai_agents", label: "Agentes IA", icon: "🤖" },
    { id: "deployment_center", label: "Centro de Despliegue", icon: "🚀" },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
          <span className="text-black font-black text-sm">IO</span>
        </div>
        <span className="font-bold text-lg text-white">Ingenio OS</span>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 px-2">
          Motor de Decisiones
        </div>
        <div className="flex flex-col gap-1">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                activeModule === m.id
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 flex justify-between items-center">
        <span>v2.1 (Engine)</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Sistema Activo</span>
        </div>
      </div>
    </aside>
  );
}
