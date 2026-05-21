/**
 * CarniGestión — Landing Page
 * Gestión profesional para carnicerías
 */
export default function CarniGestionLanding() {
  return (
    <main className="bg-black text-white min-h-screen">

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <span className="inline-block mb-6 px-4 py-1 rounded-full border border-[#ff5c5c]/40 text-[#ff5c5c] text-sm font-semibold tracking-widest uppercase">
          Software para Carnicerías
        </span>
        <h1 className="text-6xl font-bold text-[#ff5c5c] mb-6 leading-tight">
          GESTIONÁ TU CARNICERÍA<br />COMO UN PROFESIONAL
        </h1>
        <p className="text-2xl max-w-3xl text-zinc-300 mb-10">
          Control de stock por kg, ventas, precios y proveedores.
          Sin pérdidas de mercadería. Sin confusiones de precios.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/carnigestion/demo"
            className="bg-[#ff5c5c] hover:bg-[#e04a4a] text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all"
          >
            Ver Demo
          </a>
          <a
            href="/carnigestion/manual"
            className="border border-[#ff5c5c]/50 hover:border-[#ff5c5c] text-[#ff5c5c] font-bold text-xl px-10 py-5 rounded-2xl transition-all"
          >
            Ver Manual
          </a>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="grid md:grid-cols-3 gap-6 px-10 pb-20 max-w-6xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#ff5c5c]/40 transition-all">
          <div className="text-3xl mb-4">⚖️</div>
          <h3 className="text-2xl font-bold mb-4">Control por Kg</h3>
          <p className="text-zinc-400">
            Registrá ventas por peso con precio por kg actualizable.
            Balanza integrada y control de desperdicios.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#ff5c5c]/40 transition-all">
          <div className="text-3xl mb-4">🥩</div>
          <h3 className="text-2xl font-bold mb-4">Gestión de Cortes</h3>
          <p className="text-zinc-400">
            Administrá cada corte con precio, stock y rentabilidad.
            Alertas de stock crítico automáticas.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#ff5c5c]/40 transition-all">
          <div className="text-3xl mb-4">🚚</div>
          <h3 className="text-2xl font-bold mb-4">Control de Proveedores</h3>
          <p className="text-zinc-400">
            Registrá compras, proveedores y costos.
            Calculá rentabilidad por producto automáticamente.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-6">¿Listo para profesionalizar tu carnicería?</h2>
        <p className="text-zinc-400 mb-10 text-xl max-w-xl mx-auto">
          Probá CarniGestión sin compromiso. Empezá hoy.
        </p>
        <a
          href="/carnigestion/demo"
          className="bg-[#ff5c5c] hover:bg-[#e04a4a] text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all"
        >
          Empezar Ahora
        </a>
      </section>

    </main>
  );
}
