import React from "react";

export type ModuleId =
  | "operations"
  | "crm"
  | "product_factory"
  | "landing_factory"
  | "creative_lab"
  | "meta_ops"
  | "metrics"
  | "ai_agents"
  | "deployment_center"
  | "integrations"
  | "workflows";

interface SidebarProps {
  activeModule: ModuleId;
  onSelect: (mod: ModuleId) => void;
}

export function Sidebar({ activeModule, onSelect }: SidebarProps) {
  const coreModules: { id: ModuleId; label: string; icon: string }[] = [
    { id: "operations", label: "Operaciones", icon: "🌐" },
    { id: "crm", label: "CRM & Embudos", icon: "💬" },
    { id: "product_factory", label: "Fábrica de Productos", icon: "🏭" },
    { id: "landing_factory", label: "Fábrica de Landings", icon: "🎨" },
    { id: "creative_lab", label: "Laboratorio Creativo", icon: "✨" },
    { id: "meta_ops", label: "Meta Ops", icon: "📢" },
    { id: "metrics", label: "Métricas", icon: "📈" },
    { id: "ai_agents", label: "Agentes IA", icon: "🤖" },
  ];

  const sistemaModules: { id: ModuleId; label: string; icon: string }[] = [
    { id: "workflows", label: "Flujos (n8n)", icon: "⚡" },
    { id: "integrations", label: "Integraciones", icon: "🔌" },
    { id: "deployment_center", label: "Despliegue", icon: "🚀" },
  ];

  const productosActivos = [
    {
      key: "verdepro",
      nombre: "VerdePro",
      color: "#00ff88",
      url: "https://verdepro.ingeniodigital.shop",
      estado: "Lanzado ✓",
      isTemplate: true,
    },
    {
      key: "lavapro",
      nombre: "LavaPro",
      color: "#00c8ff",
      url: "#",
      estado: "Escalando",
      isTemplate: false,
    },
    {
      key: "carnigestion",
      nombre: "CarniGestión",
      color: "#ff5c5c",
      url: "#",
      estado: "Construyendo",
      isTemplate: false,
    },
  ];

  const NavButton = ({ id, label, icon }: { id: ModuleId; label: string; icon: string }) => (
    <button
      key={id}
      onClick={() => onSelect(id)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full ${
        activeModule === id
          ? "bg-zinc-800 text-white font-medium"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-sm">IO</span>
        </div>
        <div>
          <span className="font-bold text-base text-white block leading-tight">Ingenio OS</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Product OS</span>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto flex flex-col gap-5">
        {/* Motor operativo */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2 px-2">
            Motor operativo
          </div>
          <div className="flex flex-col gap-0.5">
            {coreModules.map((m) => (
              <NavButton key={m.id} {...m} />
            ))}
          </div>
        </div>

        {/* Sistema */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2 px-2">
            Sistema
          </div>
          <div className="flex flex-col gap-0.5">
            {sistemaModules.map((m) => (
              <NavButton key={m.id} {...m} />
            ))}
          </div>
        </div>

        {/* Productos activos */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2 px-2">
            Productos activos
          </div>
          <div className="flex flex-col gap-1">
            {productosActivos.map((p) => (
              <a
                key={p.key}
                href={p.url}
                target={p.url !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors flex-1 truncate">
                  {p.nombre}
                </span>
                {p.isTemplate && (
                  <span className="text-[9px] bg-green-900/40 text-green-400 border border-green-900/50 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                    TEMPLATE
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 text-xs text-zinc-600 flex justify-between items-center">
        <span className="font-mono">v3.0</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Activo</span>
        </div>
      </div>
    </aside>
  );
}
