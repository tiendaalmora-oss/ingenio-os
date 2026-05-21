/**
 * CarniGestión — Manual de Usuario
 */
const sections = [
  {
    id: "inicio",
    title: "1. Inicio Rápido",
    content: `Al iniciar sesión en CarniGestión vas a ver el resumen del día:
ventas totales, kg vendidos, cortes disponibles y alertas de stock.
Desde el menú superior accedés a todos los módulos del sistema.`,
  },
  {
    id: "ventas",
    title: "2. Registro de Ventas",
    content: `Para registrar una venta:
1. Ir a "Ventas"
2. Seleccionar el corte
3. Ingresar los kg vendidos (manual o desde balanza)
4. El sistema calcula automáticamente el precio total
5. Confirmar y guardar

El stock se descuenta automáticamente.`,
  },
  {
    id: "stock",
    title: "3. Control de Stock",
    content: `Administrá el stock de cortes desde "Stock":
- Consultá el inventario actual por corte
- Actualizá precios de venta rápidamente
- Recibí alertas cuando un corte baja del stock mínimo
- Registrá merma o desperdicios

Podés configurar el stock mínimo por corte para recibir alertas automáticas.`,
  },
  {
    id: "proveedores",
    title: "4. Gestión de Proveedores",
    content: `Desde "Proveedores" gestionás las compras de mercadería:
1. Registrá el proveedor y su contacto
2. Al recibir mercadería, creá una orden de compra
3. Ingresá peso recibido, costo por kg y corte
4. El sistema actualiza el stock automáticamente y calcula el costo promedio`,
  },
  {
    id: "reportes",
    title: "5. Reportes de Rentabilidad",
    content: `Los reportes te muestran:
- Margen de rentabilidad por corte
- Comparación precio de compra vs precio de venta
- Cortes más rentables del período
- Desperdicios y merma registrada
- Cierre de caja diario con detalle por corte

Todos los reportes son exportables en PDF.`,
  },
];

export default function CarniGestionManual() {
  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center gap-3">
        <a href="/carnigestion" className="text-[#ff5c5c] font-bold hover:underline">CarniGestión</a>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">Manual de Usuario</span>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[#ff5c5c]">Manual</span> de Usuario
          </h1>
          <p className="text-zinc-400 text-lg">Guía completa para usar CarniGestión en tu carnicería.</p>
        </div>

        <nav className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Índice</h2>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#ff5c5c] hover:underline text-sm">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="text-2xl font-bold mb-4 text-[#ff5c5c]">{s.title}</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-300 leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border border-[#ff5c5c]/30 bg-[#ff5c5c]/5 rounded-2xl p-6">
          <h3 className="font-bold text-[#ff5c5c] mb-2">¿Necesitás ayuda?</h3>
          <p className="text-zinc-400 text-sm">Contactá a Ingenio OS para soporte técnico.</p>
          <a
            href="/carnigestion"
            className="inline-block mt-4 bg-[#ff5c5c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#e04a4a] transition-all text-sm"
          >
            Volver a CarniGestión
          </a>
        </div>
      </div>
    </main>
  );
}
