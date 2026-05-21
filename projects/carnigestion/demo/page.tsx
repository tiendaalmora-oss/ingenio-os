/**
 * CarniGestión — Demo Page
 */
const mockCortes = [
  { id: 1, corte: "Asado", stock: 12.5, precio: 8500, ventas: 4.2, total: 35700 },
  { id: 2, corte: "Vacío", stock: 8.0, precio: 9200, ventas: 2.8, total: 25760 },
  { id: 3, corte: "Cuadril", stock: 5.5, precio: 11000, ventas: 1.5, total: 16500 },
  { id: 4, corte: "Picada especial", stock: 20.0, precio: 6500, ventas: 7.0, total: 45500 },
];

export default function CarniGestionDemo() {
  const totalDia = mockCortes.reduce((acc, c) => acc + c.total, 0);

  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff5c5c] flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <h1 className="text-xl font-bold text-[#ff5c5c]">CarniGestión</h1>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Demo</span>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400">
          <span className="text-[#ff5c5c] font-semibold">Ventas</span>
          <span className="hover:text-white cursor-pointer">Stock</span>
          <span className="hover:text-white cursor-pointer">Proveedores</span>
          <span className="hover:text-white cursor-pointer">Reportes</span>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total del día", value: `$${totalDia.toLocaleString()}`, icon: "💰" },
            { label: "Kg vendidos", value: "15.5 kg", icon: "⚖️" },
            { label: "Cortes activos", value: "4", icon: "🥩" },
            { label: "Stock crítico", value: "1 corte", icon: "⚠️" },
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
            <h2 className="font-bold text-lg">Stock y Ventas del día</h2>
            <button className="bg-[#ff5c5c] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#e04a4a] transition-all">
              + Registrar venta
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left bg-zinc-950">
                <th className="px-6 py-3 font-medium">Corte</th>
                <th className="px-6 py-3 font-medium">Stock (kg)</th>
                <th className="px-6 py-3 font-medium">Precio/kg</th>
                <th className="px-6 py-3 font-medium">Ventas (kg)</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockCortes.map((c, i) => (
                <tr key={c.id} className={`border-t border-zinc-800 ${i % 2 === 0 ? "" : "bg-zinc-950/50"}`}>
                  <td className="px-6 py-4 font-medium">{c.corte}</td>
                  <td className="px-6 py-4 text-zinc-300">{c.stock} kg</td>
                  <td className="px-6 py-4 text-zinc-300">${c.precio.toLocaleString()}</td>
                  <td className="px-6 py-4 text-zinc-300">{c.ventas} kg</td>
                  <td className="px-6 py-4 text-[#ff5c5c] font-bold">${c.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-700 bg-zinc-950">
                <td colSpan={4} className="px-6 py-4 text-right font-bold text-zinc-300">Total del día:</td>
                <td className="px-6 py-4 text-2xl font-bold text-[#ff5c5c]">
                  ${totalDia.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="border border-[#ff5c5c]/30 bg-[#ff5c5c]/5 rounded-2xl px-6 py-4 text-sm text-zinc-400">
          <strong className="text-[#ff5c5c]">Modo Demo:</strong> Vista interactiva de CarniGestión con datos de ejemplo.
        </div>
      </div>
    </main>
  );
}
