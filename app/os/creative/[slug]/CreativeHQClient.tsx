"use client";

import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { addConcept, addPackage, updatePackageStatus, updatePackageMetrics, duplicatePackage, archivePackage } from "./actions";

export default function CreativeHQClient({ slug, initialData }: { slug: string, initialData: any }) {
  const { product, concepts, packages, landings } = initialData;
  const [activeTab, setActiveTab] = useState<"packages" | "conceptos" | "assets">("packages");

  // Formularios
  const [newConceptName, setNewConceptName] = useState("");
  const [newConceptDesc, setNewConceptDesc] = useState("");
  
  // Package Creation
  const [newPkgConcept, setNewPkgConcept] = useState("");
  const [newPkgLanding, setNewPkgLanding] = useState("");
  const [newPkgHook, setNewPkgHook] = useState("");
  const [newPkgCopy, setNewPkgCopy] = useState("");

  const handleAddConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptName) return;
    await addConcept(slug, newConceptName, newConceptDesc);
    setNewConceptName("");
    setNewConceptDesc("");
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPackage(slug, {
      concept_id: newPkgConcept || null,
      landing_variant_id: newPkgLanding || null,
      hook_text: newPkgHook,
      copy_text: newPkgCopy
    });
    setNewPkgHook("");
    setNewPkgCopy("");
  };

  const handleSidebarSelect = (mod: string) => {
    window.location.href = `/?module=${mod}`;
  };

  // Filtrado rápido por status
  const testingPackages = packages.filter((p: any) => p.status === 'TESTING');
  const winnerPackages = packages.filter((p: any) => p.status === 'WINNER');
  const deadPackages = packages.filter((p: any) => p.status === 'DEAD');

  const assetFolders = ['videos', 'thumbnails', 'hooks', 'scripts'];

  return (
    <main className="bg-zinc-950 text-white min-h-screen flex overflow-hidden">
      <Sidebar activeModule={"creative_lab"} onSelect={handleSidebarSelect} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <TopBar title={`Creative Lab: ${product?.name || slug}`} />

        <div className="flex items-center gap-6 px-6 pt-4 border-b border-zinc-800 bg-zinc-950">
          {[
            { id: "packages", label: "📦 Packages (Performance Board)" },
            { id: "conceptos", label: "🧠 Hipótesis Creativas" },
            { id: "assets", label: "📁 Vault Físico" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id ? "border-cyan-500 text-cyan-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB: PACKAGES (BOARD OPERACIONAL) */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Crear Nuevo Package</h2>
                <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  ✨ Generar Ideas con IA (Mock)
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <form onSubmit={handleAddPackage} className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Concepto Base</label>
                    <select value={newPkgConcept} onChange={e => setNewPkgConcept(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none">
                      <option value="">-- Sin concepto --</option>
                      {concepts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Landing de Destino</label>
                    <select value={newPkgLanding} onChange={e => setNewPkgLanding(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none">
                      <option value="">-- Landing Principal --</option>
                      {landings.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 mb-1 block">Hook Rate Testing (Texto principal)</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Ej: ¿Seguís perdiendo plata con Excel?" value={newPkgHook} onChange={e => setNewPkgHook(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none" />
                      <button type="submit" className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 px-6 py-2 rounded text-sm font-bold transition-colors">
                        + Crear Package
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-8 border-t border-zinc-800 pt-8">
                <h2 className="text-xl font-bold mb-6">Performance Board</h2>
                <div className="grid grid-cols-3 gap-6">
                  
                  {/* COL: TESTING */}
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-bold text-yellow-500 mb-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div> TESTING ({testingPackages.length})
                    </div>
                    {testingPackages.map((pkg: any) => (
                      <PackageCard key={pkg.id} pkg={pkg} slug={slug} />
                    ))}
                  </div>

                  {/* COL: WINNERS */}
                  <div className="bg-zinc-900/30 border border-green-900/30 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-bold text-green-500 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> WINNERS ({winnerPackages.length})
                    </div>
                    {winnerPackages.map((pkg: any) => (
                      <PackageCard key={pkg.id} pkg={pkg} slug={slug} isWinner />
                    ))}
                  </div>

                  {/* COL: DEAD */}
                  <div className="bg-zinc-900/30 border border-red-900/20 rounded-xl p-4 flex flex-col gap-4 opacity-75">
                    <div className="flex items-center gap-2 font-bold text-red-500 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> DEAD ({deadPackages.length})
                    </div>
                    {deadPackages.map((pkg: any) => (
                      <PackageCard key={pkg.id} pkg={pkg} slug={slug} />
                    ))}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB: CONCEPTOS */}
          {activeTab === "conceptos" && (
            <div className="max-w-3xl">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl mb-6">
                <h2 className="font-bold mb-4">Nueva Hipótesis Creativa</h2>
                <form onSubmit={handleAddConcept} className="space-y-3">
                  <input type="text" placeholder="Ángulo (ej: Anti Excel, Rapidez)" value={newConceptName} onChange={e => setNewConceptName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none" />
                  <textarea placeholder="Descripción ampliada de la hipótesis..." value={newConceptDesc} onChange={e => setNewConceptDesc(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none min-h-[80px]" />
                  <button type="submit" className="bg-zinc-800 px-4 py-2 rounded text-sm font-bold">Guardar Hipótesis</button>
                </form>
              </div>

              <div className="space-y-3">
                {concepts.map((c: any) => (
                  <div key={c.id} className="bg-black border border-zinc-800 p-4 rounded-xl flex justify-between">
                    <div>
                      <div className="font-bold text-lg mb-1">{c.name}</div>
                      <div className="text-sm text-zinc-400">{c.description}</div>
                    </div>
                    <button className="text-xs bg-zinc-800 px-3 py-1.5 rounded h-fit">Crear Package desde aquí</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ASSETS VAULT */}
          {activeTab === "assets" && (
            <div>
               <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-lg font-bold mb-4">Storage Físico (Crudos)</h2>
                  <p className="text-xs text-zinc-500 mb-6">Ubicación local garantizada: <code>/public/ads/{slug}/</code></p>
                  <div className="grid grid-cols-4 gap-4">
                    {assetFolders.map(folder => (
                      <div key={folder} className="bg-black/50 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors">
                        <div className="text-2xl mb-2">📁</div>
                        <div className="font-semibold capitalize">{folder}</div>
                        <input type="file" className="text-[10px] mt-3 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-300 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

// Subcomponente interno para renderizar las tarjetas del Board Operacional
function PackageCard({ pkg, slug, isWinner = false }: { pkg: any, slug: string, isWinner?: boolean }) {
  return (
    <div className={`bg-zinc-950 border ${isWinner ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-zinc-800'} rounded-lg p-4 flex flex-col`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm text-white">{pkg.name}</h3>
        {pkg.parent_id && <span className="text-[9px] bg-cyan-900/30 text-cyan-500 px-1.5 py-0.5 rounded border border-cyan-900/50">Clon</span>}
      </div>
      
      <div className="space-y-2 mb-4 flex-1">
        <div className="text-[11px]">
          <span className="text-zinc-500 block mb-0.5">Concepto</span>
          <span className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">{pkg.concept?.name || 'Genérico'}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-zinc-500 block mb-0.5">Hook Test</span>
          <span className="text-zinc-300 italic">"{pkg.hook_text || 'Sin hook asignado'}"</span>
        </div>
        <div className="text-[11px] pt-1">
          <span className="text-zinc-500 block mb-0.5">Landing Conectada</span>
          <span className="text-cyan-400 underline decoration-cyan-400/30 cursor-pointer">{pkg.landing?.name || 'Principal'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-black/50 p-2 rounded border border-zinc-800/50">
        <div className="text-center"><div className="text-[9px] text-zinc-500">CTR</div><div className="font-mono text-xs text-white">{pkg.metrics?.ctr || 0}%</div></div>
        <div className="text-center"><div className="text-[9px] text-zinc-500">ROAS</div><div className="font-mono text-xs text-white">{pkg.metrics?.roas || 0}x</div></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {pkg.status === 'TESTING' && (
          <>
            <button onClick={() => updatePackageStatus(pkg.id, slug, 'WINNER')} className="flex-1 text-xs bg-green-900/20 text-green-400 border border-green-900/50 py-1.5 rounded hover:bg-green-900/40">⭐ Promover</button>
            <button onClick={() => updatePackageStatus(pkg.id, slug, 'DEAD')} className="flex-1 text-xs bg-red-900/20 text-red-400 border border-red-900/50 py-1.5 rounded hover:bg-red-900/40">💀 Matar</button>
          </>
        )}
        {pkg.status === 'WINNER' && (
          <>
             <button onClick={() => duplicatePackage(pkg.id, slug)} className="flex-1 text-xs bg-cyan-900/20 text-cyan-400 border border-cyan-900/50 py-1.5 rounded hover:bg-cyan-900/40">🧬 Clonar Iteración</button>
          </>
        )}
        {pkg.status === 'DEAD' && (
          <button onClick={() => archivePackage(pkg.id, slug)} className="w-full text-xs bg-zinc-800 text-zinc-400 py-1.5 rounded hover:text-white">Archivar</button>
        )}
      </div>
    </div>
  );
}
