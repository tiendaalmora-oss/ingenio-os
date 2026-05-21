import { projects } from "@/projects/projects.config";

export default function IngenioOSDashboard() {
  const projectList = Object.entries(projects);

  return (
    <main className="bg-zinc-950 text-white min-h-screen">

      {/* HEADER */}
      <header className="border-b border-zinc-800 px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
            <span className="text-black font-black text-sm">IO</span>
          </div>
          <span className="font-bold text-lg">Ingenio OS</span>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">v2.0</span>
        </div>
        <span className="text-xs text-zinc-500">os.ingeniodigital.shop</span>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-14">

        {/* HERO */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Software Factory
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl">
            Plataforma centralizada de gestión para SaaS de proximidad.
            Desplegá, gestioná y escalá múltiples productos desde un solo lugar.
          </p>
        </div>

        {/* PROJECTS GRID */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
            Productos activos
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {projectList.map(([key, config]) => (
              <div
                key={key}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all group"
              >
                {/* Color dot */}
                <div
                  className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center font-black text-black text-lg"
                  style={{ backgroundColor: config.color }}
                >
                  {config.name[0]}
                </div>

                <h3 className="font-bold text-xl mb-1" style={{ color: config.color }}>
                  {config.name}
                </h3>
                <p className="text-zinc-500 text-sm mb-1 capitalize">{config.type}</p>
                <p className="text-zinc-400 text-sm mb-5">{config.tagline}</p>

                {/* Quick links */}
                <div className="flex gap-2 flex-wrap">
                  {config.sections.map((section) => (
                    <a
                      key={section}
                      href={`/${key}${section === "landing" ? "" : `/${section}`}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all capitalize"
                    >
                      {section === "landing" ? "Landing" : section}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ARCHITECTURE STATUS */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
            Estado de la arquitectura
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Proyectos", value: projectList.length.toString(), icon: "🗂️", status: "active" },
              { label: "Rutas dinámicas", value: "✓", icon: "⚡", status: "active" },
              { label: "Subdomain Middleware", value: "✓", icon: "🌐", status: "active" },
              { label: "Docker deployment", value: "✓", icon: "🐳", status: "active" },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xl mb-2">{item.icon}</div>
                <div className="text-lg font-bold mb-1 text-green-400">{item.value}</div>
                <div className="text-zinc-500 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ROADMAP */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
            Próximas funcionalidades
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "AI Landing Generator", desc: "Generación automática de landings desde configuración", icon: "🤖" },
              { label: "Deploy automático", desc: "Pipeline CI/CD con deploy en un click desde el dashboard", icon: "🚀" },
              { label: "Multi-cliente SaaS", desc: "Gestión de clientes finales por proyecto", icon: "👥" },
              { label: "Integración n8n", desc: "Automatización de workflows entre proyectos", icon: "⚙️" },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-5 flex gap-4 items-start">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-zinc-300 mb-1">{item.label}</div>
                  <div className="text-zinc-500 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}