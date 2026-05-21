/**
 * LavaPro — Manual de Usuario
 */
const sections = [
  {
    id: "inicio",
    title: "1. Inicio Rápido",
    content: `Iniciá sesión con tus credenciales para acceder al panel principal de LavaPro.
En el dashboard vas a ver un resumen de pedidos activos, entregas pendientes y facturación del día.`,
  },
  {
    id: "pedidos",
    title: "2. Gestión de Pedidos",
    content: `Para registrar un nuevo pedido:
1. Ir a "Pedidos"
2. Hacer clic en "+ Nuevo Pedido"
3. Seleccionar o crear el cliente
4. Ingresar cantidad de prendas y tipo de lavado
5. Establecer fecha de entrega
6. Confirmar y guardar

El sistema genera automáticamente un número de ticket para el cliente.`,
  },
  {
    id: "clientes",
    title: "3. Clientes",
    content: `Administrá tu cartera de clientes desde la sección "Clientes":
- Registrá nuevos clientes con datos de contacto
- Consultá el historial de pedidos por cliente
- Verificá deudas o créditos pendientes
- Enviá notificaciones de pedidos listos`,
  },
  {
    id: "facturacion",
    title: "4. Facturación",
    content: `Desde la sección "Facturación" podés:
- Emitir presupuestos automáticamente al crear el pedido
- Generar facturas al entregar la ropa
- Registrar pagos (efectivo, transferencia, tarjeta)
- Consultar deudas de clientes
- Exportar reportes de facturación en PDF`,
  },
  {
    id: "turnos",
    title: "5. Turnos y Entregas",
    content: `Organizá el flujo de retiros y entregas:
1. Desde "Turnos", visualizá el calendario de entregas
2. Asigná horarios de retiro para cada pedido
3. Marcá pedidos como entregados desde el listado
4. El sistema calcula automáticamente los tiempos de procesamiento`,
  },
];

export default function LavaProManual() {
  return (
    <main className="bg-zinc-950 text-white min-h-screen">
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center gap-3">
        <a href="/lavapro" className="text-[#00c8ff] font-bold hover:underline">LavaPro</a>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">Manual de Usuario</span>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[#00c8ff]">Manual</span> de Usuario
          </h1>
          <p className="text-zinc-400 text-lg">Guía completa para usar LavaPro en tu lavandería.</p>
        </div>

        <nav className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Índice</h2>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#00c8ff] hover:underline text-sm">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="text-2xl font-bold mb-4 text-[#00c8ff]">{s.title}</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-300 leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border border-[#00c8ff]/30 bg-[#00c8ff]/5 rounded-2xl p-6">
          <h3 className="font-bold text-[#00c8ff] mb-2">¿Necesitás ayuda?</h3>
          <p className="text-zinc-400 text-sm">Contactá a Ingenio OS para soporte técnico.</p>
          <a
            href="/lavapro"
            className="inline-block mt-4 bg-[#00c8ff] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#00b0e0] transition-all text-sm"
          >
            Volver a LavaPro
          </a>
        </div>
      </div>
    </main>
  );
}
