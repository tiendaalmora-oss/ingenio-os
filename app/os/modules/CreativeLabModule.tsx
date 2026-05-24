"use client";

import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  slug: string;
  name: string;
  color: string;
  status: string;
}

export function CreativeLabModule() {
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
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 bg-clip-text text-transparent">
            Laboratorio Creativo
          </h2>
          <p className="text-zinc-400 mt-1 text-sm">
            Diseña ganchos (hooks), copys persuasivos y guiones estructurados organizados por producto.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-500">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-2 border-zinc-800 border-t-purple-400 rounded-full animate-spin"></span>
            <span className="text-sm">Abriendo el laboratorio creativo...</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => window.location.href = `/os/creative/${product.slug}`}
              className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between hover:border-purple-500/30 hover:bg-zinc-900 transition-all cursor-pointer relative group overflow-hidden"
              style={{
                boxShadow: "0 10px 30px -15px rgba(0,0,0,0.7)"
              }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: product.color }}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-200">📁</div>
                <span className="text-[10px] font-extrabold uppercase bg-purple-950/20 border border-purple-900/30 text-purple-400 px-2 py-0.5 rounded">
                  {product.status || 'Active'}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-white group-hover:text-purple-400 transition-colors">
                  {product.name}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  /public/ads/{product.slug}/
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-400 group-hover:text-zinc-300">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Abrir Laboratorio
                </span>
                <span>🎨 ↗</span>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center py-20 text-zinc-500 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl italic">
              No hay productos registrados. ¡Crea una idea en la Fábrica de Productos!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
