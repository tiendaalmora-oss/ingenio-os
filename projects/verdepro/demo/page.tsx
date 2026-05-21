/**
 * VerdePro — Demo Page
 * Vista interactiva del sistema de gestión
 */
export default function VerdePrDemo() {
  const mockVentas = [
    { id: 1, producto: "Tomate x kg", cantidad: 3, precio: 1500, total: 4500 },
    { id: 2, producto: "Lechuga", cantidad: 5, precio: 700, total: 3500 },
    { id: 3, producto: "Zanahoria x kg", cantidad: 2, precio: 900, total: 1800 },
    { id: 4, producto: "Papa x kg", cantidad: 4, precio: 600, total: 2400 },
  ];

  const totalDia = mockVentas.reduce((acc, v) => acc + v.total, 0);

  return (
    <main className="bg-zinc-950 text-white min-h-screen">

      {/* HEADER */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00ff88] flex items-center justify-center">
            <span className="text-black font-bold text-sm">V</span>
          </div>
          <h1 className="text-xl font-bold text-[#00ff88]">VerdePro</h1>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Demo</span>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400">
          <span className="text-[#00ff88] font-semibold">Ventas</span>
          <span className="hover:text-white cursor-pointer">Inventario</span>
          <span className="hover:text-white cursor-pointer">Caja</span>
          <span className="hover:text-white cursor-pointer">Reportes</span>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* RESUMEN DEL DÍA */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Ventas hoy", value: `$${totalDia.toLocaleString()}`, icon: "💰" },
            { label: "Productos vendidos", value: "14", icon: "📦" },
            { label: "Clientes atendidos", value: "8", icon: "👥" },
            { label: "Stock crítico", value: "2 items", icon: "⚠️" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TABLA DE VENTAS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-bold text-lg">Ventas del día</h2>
            <button className="bg-[#00ff88] text-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#00e07a] transition-all">
              + Nueva venta
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left bg-zinc-950">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Producto</th>
                <th className="px-6 py-3 font-medium">Cantidad</th>
                <th className="px-6 py-3 font-medium">Precio unit.</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockVentas.map((v, i) => (
                <tr key={v.id} className={`border-t border-zinc-800 ${i % 2 === 0 ? "" : "bg-zinc-950/50"}`}>
                  <td className="px-6 py-4 text-zinc-500">{v.id}</td>
                  <td className="px-6 py-4 font-medium">{v.producto}</td>
                  <td className="px-6 py-4 text-zinc-300">{v.cantidad}</td>
                  <td className="px-6 py-4 text-zinc-300">${v.precio.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[#00ff88] font-bold">${v.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-700 bg-zinc-950">
                <td colSpan={4} className="px-6 py-4 text-right font-bold text-zinc-300">Total del día:</td>
                <td className="px-6 py-4 text-2xl font-bold text-[#00ff88]">
                  ${totalDia.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* NOTA DEMO */}
        <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 rounded-2xl px-6 py-4 text-sm text-zinc-400">
          <strong className="text-[#00ff88]">Modo Demo:</strong> Esta es una vista interactiva de VerdePro.
          Los datos mostrados son de ejemplo. Contactanos para activar tu cuenta real.
        </div>

      </div>
    </main>
  );
}
