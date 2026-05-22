import React from "react";
import { mockCreatives } from "../data/ads.data";

export function CreativeLabModule() {
  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Laboratorio Creativo</h2>
          <p className="text-zinc-400">Diseña, prueba y gestiona ganchos (hooks) y recursos creativos.</p>
        </div>
        <button className="bg-[#0668E1] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#0556bd] transition-colors">
          Nuevo Creativo
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {mockCreatives.map(cr => (
          <div key={cr.id} className={`bg-zinc-900 border p-5 rounded-xl relative ${cr.winner ? 'border-green-500/50' : 'border-zinc-800'}`}>
            {cr.winner && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                GANADOR 🏆
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-wider">{cr.format}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                cr.status === 'winning' ? 'text-green-400 bg-green-900/30' : 
                cr.status === 'killed' ? 'text-red-400 bg-red-900/30' : 
                'text-yellow-400 bg-yellow-900/30'
              }`}>
                {cr.status === 'winning' ? 'Ganador' : cr.status === 'killed' ? 'Apagado' : 'En Prueba'}
              </span>
            </div>
            <div className="font-bold text-lg mb-2 text-white">"{cr.hook}"</div>
            <div className="text-sm text-zinc-400 mb-4 line-clamp-3">{cr.copy}</div>
            <div className="flex gap-2">
              <button className="flex-1 bg-zinc-800 text-zinc-300 text-xs py-2 rounded hover:bg-zinc-700 transition-colors">Probar en Meta</button>
              <button className="flex-1 bg-zinc-800 text-zinc-300 text-xs py-2 rounded hover:bg-zinc-700 transition-colors">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
