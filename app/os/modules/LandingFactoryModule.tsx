"use client";

import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  slug: string;
  name: string;
  color: string;
  sections: string[];
  deployment_domain?: string;
}

export function LandingFactoryModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar productos");
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Fábrica de Landings</h2>
          <p className="text-zinc-400">Gestiona y genera páginas de aterrizaje (landings) SaaS de alta conversión.</p>
        </div>
        <button className="bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
          <span>✨</span> Generar con IA
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12 text-zinc-500">
          <div className="flex flex-col items-center gap-2">
            <span className="w-8 h-8 border-2 border-zinc-700 border-t-green-400 rounded-full animate-spin"></span>
            <span>Cargando landings...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Landings Desplegadas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {products.map((product) => {
                const hasLanding = product.sections?.includes("landing");
                
                return (
                  <div key={product.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }}></div>
                      <div>
                        <div className="font-bold text-white">{product.name}</div>
                        <div className="text-xs text-zinc-500">{product.deployment_domain || 'No desplegado'}</div>
                      </div>
                    </div>
                    {hasLanding ? (
                      <a href={`/${product.slug}`} target="_blank" className="text-sm bg-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors">
                        Ver en Vivo ↗
                      </a>
                    ) : (
                      <button className="text-sm bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg border border-dashed border-zinc-650 hover:text-white transition-colors">
                        Crear Landing
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Plantillas Disponibles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer">
                <div className="h-40 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center border-b border-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full mb-3 w-[33%]"></div>
                  <div className="w-full h-6 bg-zinc-700 rounded-full mb-4 w-[66%]"></div>
                  <div className="w-full h-12 bg-green-500/20 border border-green-500/50 rounded-lg"></div>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-white mb-1">Respuesta Directa v1</div>
                  <div className="text-xs text-zinc-500">Página única de alta conversión con llamado a la acción (CTA) para demo.</div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-zinc-850 rounded-xl flex flex-col items-center justify-center text-center p-8 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer">
                <span className="text-2xl mb-2">✨</span>
                <span className="font-medium">Plantilla Personalizada por IA</span>
                <span className="text-xs mt-2">Genera un diseño único a partir de una descripción</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
