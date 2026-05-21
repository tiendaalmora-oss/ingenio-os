/**
 * LavaPro — Landing Page
 * Gestión profesional para lavanderías
 */
export default function LavaProLanding() {
  return (
    <main className="bg-black text-white min-h-screen">

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <span className="inline-block mb-6 px-4 py-1 rounded-full border border-[#00c8ff]/40 text-[#00c8ff] text-sm font-semibold tracking-widest uppercase">
          Software para Lavanderías
        </span>
        <h1 className="text-6xl font-bold text-[#00c8ff] mb-6 leading-tight">
          CONTROLÁ TU LAVANDERÍA<br />DESDE CUALQUIER LUGAR
        </h1>
        <p className="text-2xl max-w-3xl text-zinc-300 mb-10">
          Gestioná pedidos, turnos, clientes y facturación.
          Sin papeles. Sin confusión. Sin perder ropa.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/lavapro/demo"
            className="bg-[#00c8ff] hover:bg-[#00b0e0] text-black font-bold text-xl px-10 py-5 rounded-2xl transition-all"
          >
            Ver Demo
          </a>
          <a
            href="/lavapro/manual"
            className="border border-[#00c8ff]/50 hover:border-[#00c8ff] text-[#00c8ff] font-bold text-xl px-10 py-5 rounded-2xl transition-all"
          >
            Ver Manual
          </a>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="grid md:grid-cols-3 gap-6 px-10 pb-20 max-w-6xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#00c8ff]/40 transition-all">
          <div className="text-3xl mb-4">📋</div>
          <h3 className="text-2xl font-bold mb-4">Gestión de Pedidos</h3>
          <p className="text-zinc-400">
            Registrá cada pedido con cliente, fecha de entrega y estado.
            Nunca más un pedido perdido.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#00c8ff]/40 transition-all">
          <div className="text-3xl mb-4">📅</div>
          <h3 className="text-2xl font-bold mb-4">Turnos y Entregas</h3>
          <p className="text-zinc-400">
            Organizá retiros y entregas automáticamente.
            Notificaciones para tus clientes incluidas.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#00c8ff]/40 transition-all">
          <div className="text-3xl mb-4">💳</div>
          <h3 className="text-2xl font-bold mb-4">Facturación Sencilla</h3>
          <p className="text-zinc-400">
            Emití presupuestos y facturas en segundos.
            Control de cobros y deudas de clientes.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-6">¿Listo para profesionalizar tu lavandería?</h2>
        <p className="text-zinc-400 mb-10 text-xl max-w-xl mx-auto">
          Probá LavaPro sin compromiso. Empezá hoy.
        </p>
        <a
          href="/lavapro/demo"
          className="bg-[#00c8ff] hover:bg-[#00b0e0] text-black font-bold text-xl px-10 py-5 rounded-2xl transition-all"
        >
          Empezar Ahora
        </a>
      </section>

    </main>
  );
}
