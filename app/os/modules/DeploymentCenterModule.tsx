"use client";

import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  slug: string;
  name: string;
  color: string;
  deployment_domain?: string;
  deployment_status?: "live" | "down" | "deploying" | "pending";
  deployment_docker?: boolean;
  deployment_ssl?: boolean;
}

export function DeploymentCenterModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar despliegues");
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

  const deployedProducts = products.filter((p) => p.deployment_domain);
  const total = deployedProducts.length;
  const live = deployedProducts.filter((p) => p.deployment_status === "live").length;
  const deploying = deployedProducts.filter((p) => p.deployment_status === "deploying" || p.deployment_status === "pending").length;

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Centro de Despliegue</h2>
          <p className="text-zinc-400">Estado de infraestructura y enrutamiento en todos los productos.</p>
        </div>
        <button className="bg-zinc-100 text-black font-bold px-4 py-2 rounded-lg hover:bg-white transition-colors">
          Desplegar Actualizaciones
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
            <span>Cargando servicios de infraestructura...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-3xl font-bold text-white mb-1">{total}</div>
              <div className="text-sm text-zinc-500">Dominios Totales</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-3xl font-bold text-green-400 mb-1">{live}</div>
              <div className="text-sm text-zinc-500">Servicios Activos</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{deploying}</div>
              <div className="text-sm text-zinc-500">Desplegando</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white mb-1">Docker</div>
                <div className="text-sm text-zinc-500">Estado del Motor</div>
              </div>
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Proyecto</th>
                  <th className="px-6 py-4 font-semibold">Dominio</th>
                  <th className="px-6 py-4 font-semibold">Contenedor Docker</th>
                  <th className="px-6 py-4 font-semibold">SSL</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {deployedProducts.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      <a href={`https://${p.deployment_domain}`} target="_blank" className="hover:text-[#00c8ff] transition-colors">
                        {p.deployment_domain} ↗
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {p.deployment_docker ? (
                        <span className="text-green-400 flex items-center gap-1"><span className="text-xs">✓</span> Listo</span>
                      ) : (
                        <span className="text-red-400">Fallido</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.deployment_ssl ? (
                        <span className="text-green-400 flex items-center gap-1"><span className="text-xs">🔒</span> Activo</span>
                      ) : (
                        <span className="text-yellow-400 flex items-center gap-1"><span className="text-xs">⏳</span> Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.deployment_status === "live" ? (
                        <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-green-900/50">Activo</span>
                      ) : p.deployment_status === "deploying" || p.deployment_status === "pending" ? (
                        <span className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-yellow-900/50 animate-pulse">Desplegando</span>
                      ) : (
                        <span className="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-red-900/50">Caído</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium">
                        Redesplegar
                      </button>
                    </td>
                  </tr>
                ))}

                {deployedProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 italic">
                      No hay proyectos desplegados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
