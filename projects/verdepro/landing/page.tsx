/**
 * VerdePro — Landing Page
 * Gestión profesional para verdulerías
 */
export default function VerdePrLanding() {
  return (
    <main className="bg-black text-white min-h-screen">

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <span className="inline-block mb-6 px-4 py-1 rounded-full border border-[#00ff88]/40 text-[#00ff88] text-sm font-semibold tracking-widest uppercase">
          Software para Verdulerías
        </span>
        <h1 className="text-6xl font-bold text-[#00ff88] mb-6 leading-tight">
          TODO LO QUE NECESITÁS<br />PARA ORDENAR TU VERDULERÍA
        </h1>
        <p className="text-2xl max-w-3xl text-zinc-300 mb-10">
          Controlá ventas, caja, stock y productos desde un solo lugar.
          Sin planillas. Sin desorden. Sin perder plata.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="/verdepro/demo"
            className="bg-[#00ff88] hover:bg-[#00e07a] text-black font-bold text-xl px-10 py-5 rounded-2xl transition-all"
          >
            Ver Demo
          </a>
          <a
            href="/verdepro/manual"
            className="border border-[#00ff88]/50 hover:border-[#00ff88] text-[#00ff88] font-bold text-xl px-10 py-5 rounded-2xl transition-all"
          >
            Ver Manual
          </a>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="grid md:grid-cols-3 gap-6 px-10 pb-20 max-w-6xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#00ff88]/40 transition-all">
          <div className="text-3xl mb-4">🧾</div>
          <h3 className="text-2xl font-bold mb-4">Control de Caja</h3>
          <p className="text-zinc-400">
            Sabé exactamente cuánto entra y cuánto sale todos los días.
            Cierre de caja diario con reportes automáticos.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#00ff88]/40 transition-all">
          <div className="text-3xl mb-4">📦</div>
          <h3 className="text-2xl font-bold mb-4">Inventario Fácil</h3>
          <p className="text-zinc-400">
            Controlá stock y evitá pérdidas de mercadería.
            Alertas automáticas de stock bajo.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#00ff88]/40 transition-all">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-2xl font-bold mb-4">Gestión Profesional</h3>
          <p className="text-zinc-400">
            Hacé crecer tu negocio con herramientas simples y rápidas.
            Reportes claros, sin complicaciones.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-6">¿Listo para profesionalizar tu verdulería?</h2>
        <p className="text-zinc-400 mb-10 text-xl max-w-xl mx-auto">
          Probá VerdePro sin compromiso. Empezá hoy.
        </p>
        <a
          href="/verdepro/demo"
          className="bg-[#00ff88] hover:bg-[#00e07a] text-black font-bold text-xl px-10 py-5 rounded-2xl transition-all"
        >
          Empezar Ahora
        </a>
      </section>

    </main>
  );
}
