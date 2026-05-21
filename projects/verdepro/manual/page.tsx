/**
 * VerdePro — Manual de Usuario
 * Guía completa de uso del sistema
 */
const sections = [
  {
    id: "inicio",
    title: "1. Inicio Rápido",
    content: `Para comenzar a usar VerdePro, accedé al sistema con tu usuario y contraseña. 
En el panel principal vas a ver el resumen del día: ventas, caja y alertas de stock.
Desde aquí podés navegar a cualquier módulo usando el menú superior.`,
  },
  {
    id: "ventas",
    title: "2. Registro de Ventas",
    content: `Para registrar una venta:
1. Ir a la sección "Ventas"
2. Hacer clic en "+ Nueva Venta"
3. Buscar el producto por nombre o código
4. Ingresar cantidad
5. Confirmar la venta

El sistema descuenta automáticamente el stock y registra el movimiento en caja.`,
  },
  {
    id: "inventario",
    title: "3. Gestión de Inventario",
    content: `El inventario se actualiza automáticamente con cada venta.
Para agregar mercadería nueva:
1. Ir a "Inventario"
2. Buscar el producto
3. Ingresar la cantidad recibida y el costo de compra
4. Guardar

Podés configurar alertas de stock mínimo para cada producto.`,
  },
  {
    id: "caja",
    title: "4. Control de Caja",
    content: `Al inicio del día, realizá la apertura de caja ingresando el saldo inicial.
Durante el día, todas las ventas se registran automáticamente.
Al cierre:
1. Ir a "Caja"
2. Verificar los movimientos del día
3. Ingresar el efectivo contado
4. Confirmar el cierre

El sistema genera automáticamente el reporte de cierre.`,
  },
  {
    id: "reportes",
    title: "5. Reportes",
    content: `Los reportes están disponibles en la sección "Reportes":
- Ventas por período (día, semana, mes)
- Productos más vendidos
- Movimientos de caja
- Stock actual y crítico
- Historial de compras

Todos los reportes pueden exportarse en PDF.`,
  },
];

export default function VerdePrManual() {
  return (
    <main className="bg-zinc-950 text-white min-h-screen">

      {/* HEADER */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center gap-3">
        <a href="/verdepro" className="text-[#00ff88] font-bold hover:underline">VerdePro</a>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">Manual de Usuario</span>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* TITLE */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[#00ff88]">Manual</span> de Usuario
          </h1>
          <p className="text-zinc-400 text-lg">
            Guía completa para usar VerdePro en tu verdulería.
          </p>
        </div>

        {/* INDICE */}
        <nav className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Índice de contenidos</h2>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-[#00ff88] hover:underline text-sm"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* SECCIONES */}
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="text-2xl font-bold mb-4 text-[#00ff88]">{s.title}</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-300 leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        {/* SOPORTE */}
        <div className="mt-16 border border-[#00ff88]/30 bg-[#00ff88]/5 rounded-2xl p-6">
          <h3 className="font-bold text-[#00ff88] mb-2">¿Necesitás ayuda adicional?</h3>
          <p className="text-zinc-400 text-sm">
            Contactá a nuestro equipo de soporte en Ingenio OS.
            Respondemos en menos de 24 horas hábiles.
          </p>
          <a
            href="/verdepro"
            className="inline-block mt-4 bg-[#00ff88] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#00e07a] transition-all text-sm"
          >
            Volver a VerdePro
          </a>
        </div>

      </div>
    </main>
  );
}
