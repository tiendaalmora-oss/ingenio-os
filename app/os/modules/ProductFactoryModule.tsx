"use client";

import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  slug: string;
  name: string;
  type: string;
  color: string;
  status: string;
  mrr: number;
  leads: number;
  sections: string[];
  deployment_domain?: string;
  deployment_status?: string;
}

export function ProductFactoryModule() {
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
    <div className="p-8 animate-fade-in max-w-7xl mx-auto flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Centro de Control de Productos</h2>
          <p className="text-zinc-400">Gestiona todos los productos SaaS activos y sus ciclos de vida.</p>
        </div>
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
            <span>Cargando fábrica de productos...</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-black text-xl" style={{ backgroundColor: product.color }}>
                  {product.name[0]}
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border
                  ${product.status === 'launched' || product.status === 'launched' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 
                    product.status === 'scaling' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50' : 
                    'bg-orange-900/30 text-orange-400 border-orange-900/50'}`}>
                  {product.status === 'launched' ? 'Lanzado' : 
                   product.status === 'scaling' ? 'Escalando' : 
                   product.status === 'building' ? 'Construyendo' : product.status}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-2xl mb-1 text-white">{product.name}</h3>
                  <p className="text-zinc-500 text-sm capitalize">{product.type}</p>
                </div>
                <a href={`/os/product/${product.slug}`} className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-cyan-500/20">
                  Abrir HQ →
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">MRR</div>
                  <div className="font-mono font-medium text-white">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(product.mrr)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Leads</div>
                  <div className="font-mono font-medium text-white">{product.leads}</div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-800">
                <div className="text-xs font-semibold text-zinc-500 mb-3">ENLACES RÁPIDOS</div>
                <div className="flex gap-2 flex-wrap">
                  <a href={`/os/creative/${product.slug}`} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors font-semibold">
                    Creative Lab 🎨
                  </a>
                  <a href={`/os/radar/${product.slug}`} className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors font-semibold">
                    Creative Radar 📡
                  </a>
                  {product.sections?.map((section) => (
                    <a
                      key={section}
                      href={`/${product.slug}${section === "landing" ? "" : `/${section}`}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      {section === "landing" ? "Página Web" : 
                       section === "demo" ? "Demo" : 
                       section === "manual" ? "Manual" : section} ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500 italic">
              No hay productos registrados en la base de datos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
