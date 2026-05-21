export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        
        <h1 className="text-6xl font-bold text-green-400 mb-6">
          TODO LO QUE NECESITÁS
          <br />
          PARA ORDENAR TU VERDULERÍA
        </h1>

        <p className="text-2xl max-w-3xl text-zinc-300 mb-10">
          Controlá ventas, caja, stock y productos desde un solo lugar.
          Sin planillas. Sin desorden. Sin perder plata.
        </p>

        <button className="bg-green-500 hover:bg-green-400 text-black font-bold text-xl px-10 py-5 rounded-2xl transition-all">
          Comprar Ahora
        </button>

      </section>

      {/* BENEFICIOS */}
      <section className="grid md:grid-cols-3 gap-6 px-10 pb-32">

        <div className="bg-zinc-900 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            Control de Caja
          </h3>

          <p className="text-zinc-400">
            Sabé exactamente cuánto entra y cuánto sale todos los días.
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            Inventario Fácil
          </h3>

          <p className="text-zinc-400">
            Controlá stock y evitá pérdidas de mercadería.
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            Gestión Profesional
          </h3>

          <p className="text-zinc-400">
            Hacé crecer tu negocio con herramientas simples y rápidas.
          </p>
        </div>

      </section>

    </main>
  );
}