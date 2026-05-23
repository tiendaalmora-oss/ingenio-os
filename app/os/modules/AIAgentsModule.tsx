import React from "react";

export function AIAgentsModule() {
  const agents = [
    {
      id: "metrics-analyst",
      name: "Analista de Métricas (Copiloto)",
      role: "Media Buying & Performance",
      status: "ready",
      description: "Agente especializado en analizar métricas de anuncios (CTR, ROAS, Frecuencia) y recomendar acciones operativas inmediatas para escalar o apagar.",
      capabilities: ["Análisis de ROAS", "Detección de Fatiga", "Recomendación de Escalamiento", "Conexión a Meta Graph API"],
      location: "Creative Radar 📡"
    },
    {
      id: "creative-researcher",
      name: "Creative Researcher",
      role: "Estrategia Creativa",
      status: "building",
      description: "Analiza el mercado y sugiere nuevos ángulos de venta y hooks basados en las tendencias de la competencia.",
      capabilities: ["Scraping de Meta Library", "Análisis de Ángulos", "Generación de Hipótesis"],
      location: "Creative Lab 🎨"
    },
    {
      id: "copy-generator",
      name: "Copy & Landing IA",
      role: "Generación de Contenido",
      status: "building",
      description: "Genera variantes de copys y estructuras de landing pages basados en el ángulo ganador del anuncio.",
      capabilities: ["Generación de Copy", "Estructura VSL", "Sincronización con Landing HQ"],
      location: "Landing HQ 🌐"
    }
  ];

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Orquestación de Agentes IA</h2>
          <p className="text-zinc-400">Gestiona trabajadores de IA especializados que automatizan el ciclo de vida del producto.</p>
        </div>
        <div className="flex items-center gap-3 bg-green-900/20 border border-green-500/30 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Motor Nativo OpenRouter Conectado</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-800 to-transparent opacity-20 group-hover:opacity-40 transition-opacity rounded-bl-full"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="font-bold text-xl text-white">{agent.name}</h3>
                  <div className="text-sm text-zinc-500">{agent.role}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                agent.status === 'ready' ? 'bg-green-900/30 text-green-400 border border-green-900' :
                agent.status === 'building' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900' :
                'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {agent.status === 'ready' ? 'Activo (Nativo)' : agent.status === 'building' ? 'En Desarrollo' : agent.status}
              </span>
            </div>

            <p className="text-zinc-400 text-sm mb-6 relative z-10 min-h-[60px]">
              {agent.description}
            </p>

            <div className="mb-6 relative z-10">
              <div className="text-xs font-semibold text-zinc-500 uppercase mb-2">Capacidades</div>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map(cap => (
                  <span key={cap} className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center relative z-10">
              <span className="text-xs text-zinc-500 font-mono">Ubicación operativa</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-900/20 px-3 py-1.5 rounded-lg border border-cyan-900/30">
                {agent.location}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
