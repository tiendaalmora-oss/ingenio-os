/**
 * LavaPro — Demo Page
 */
const mockPedidos = [
  { id: 1, cliente: "María González", prendas: 8, estado: "Listo", fecha: "21/05", total: 4800 },
  { id: 2, cliente: "Carlos Rodríguez", prendas: 12, estado: "En proceso", fecha: "22/05", total: 7200 },
  { id: 3, cliente: "Ana Martínez", prendas: 5, estado: "Pendiente", fecha: "23/05", total: 3000 },
  { id: 4, cliente: "Luis Fernández", prendas: 20, estado: "Listo", fecha: "21/05", total: 12000 },
];

const estadoColor: Record<string, string> = {
  "Listo": "text-[#00c8ff] bg-[#00c8ff]/10",
  "En proceso": "text-yellow-400 bg-yellow-400/10",
  "Pendiente": "text-zinc-400 bg-zinc-800",
};

export default function LavaProDemo() {
  const totalHoy = mockPedidos.reduce((acc, p) => acc + p.total, 0);

  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00c8ff] flex items-center justify-center">
            <span className="text-black font-bold text-sm">L</span>
          </div>
          <h1 className="text-xl font-bold text-[#00c8ff]">LavaPro</h1>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Demo</span>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400">
          <span className="text-[#00c8ff] font-semibold">Pedidos</span>
          <span className="hover:text-white cursor-pointer">Clientes</span>
          <span className="hover:text-white cursor-pointer">Facturación</span>
          <span className="hover:text-white cursor-pointer">Turnos</span>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Pedidos activos", value: "4", icon: "📋" },
            { label: "Listos para retirar", value: "2", icon: "✅" },
            { label: "Total del día", value: `$${totalHoy.toLocaleString()}`, icon: "💰" },
            { label: "Clientes nuevos", value: "3", icon: "👥" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-lg">Pedidos del día</h2>
            <button className="bg-[#00c8ff] text-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#00b0e0] transition-all">
              + Nuevo pedido
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left bg-zinc-950">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Prendas</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Entrega</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockPedidos.map((p, i) => (
                <tr key={p.id} className={`border-t border-zinc-800 ${i % 2 === 0 ? "" : "bg-zinc-950/50"}`}>
                  <td className="px-6 py-4 text-zinc-500">{p.id}</td>
                  <td className="px-6 py-4 font-medium">{p.cliente}</td>
                  <td className="px-6 py-4 text-zinc-300">{p.prendas}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColor[p.estado]}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{p.fecha}</td>
                  <td className="px-6 py-4 text-[#00c8ff] font-bold">${p.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-[#00c8ff]/30 bg-[#00c8ff]/5 rounded-2xl px-6 py-4 text-sm text-zinc-400">
          <strong className="text-[#00c8ff]">Modo Demo:</strong> Esta es una vista interactiva de LavaPro con datos de ejemplo.
        </div>
      </div>
    </main>
  );
}
