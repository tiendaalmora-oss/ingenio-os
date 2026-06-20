"use client";

import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { 
  addConcept, 
  addPackage, 
  updatePackageStatus, 
  updatePackageMetrics, 
  duplicatePackage, 
  archivePackage,
  updatePackageTexts,
  updateAssetContent,
  addScriptAsset
} from "./actions";

export default function CreativeHQClient({ slug, initialData }: { slug: string, initialData: any }) {
  const { product, concepts, packages, landings, assets } = initialData;
  const [activeTab, setActiveTab] = useState<"packages" | "conceptos" | "guiones" | "copys" | "assets" | "modelos">("packages");

  // State: Concept creation
  const [newConceptName, setNewConceptName] = useState("");
  const [newConceptDesc, setNewConceptDesc] = useState("");
  
  // State: Package creation
  const [newPkgConcept, setNewPkgConcept] = useState("");
  const [newPkgLanding, setNewPkgLanding] = useState("");
  const [newPkgHook, setNewPkgHook] = useState("");
  const [newPkgCopy, setNewPkgCopy] = useState("");

  // State: Inline Edit Package
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [editHook, setEditHook] = useState("");
  const [editCopy, setEditCopy] = useState("");
  const [savingPkgEdit, setSavingPkgEdit] = useState(false);

  // State: Script edit/creation
  const [editingScript, setEditingScript] = useState<any>(null);
  const [scriptContent, setScriptContent] = useState("");
  const [newScriptContent, setNewScriptContent] = useState("");
  const [savingScript, setSavingScript] = useState(false);
  const [addingScript, setAddingScript] = useState(false);

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

  const handleEditPkgSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    setSavingPkgEdit(true);
    const res = await updatePackageTexts(editingPkg.id, slug, editHook, editCopy);
    setSavingPkgEdit(false);
    if (res.success) {
      setEditingPkg(null);
      alert("Anuncio guardado con éxito.");
    } else {
      alert("Error al guardar: " + res.error);
    }
  };

  const handleSaveScript = async () => {
    if (!editingScript) return;
    setSavingScript(true);
    const res = await updateAssetContent(editingScript.id, slug, scriptContent);
    setSavingScript(false);
    if (res.success) {
      setEditingScript(null);
      alert("Guión guardado con éxito.");
    }
  };

  const handleCreateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScriptContent.trim()) return;
    setSavingScript(true);
    await addScriptAsset(slug, newScriptContent);
    setNewScriptContent("");
    setAddingScript(false);
    setSavingScript(false);
  };

  const handleSidebarSelect = (mod: string) => {
    window.location.href = `/?module=${mod}`;
  };

  // Filter packages
  const testingPackages = packages.filter((p: any) => p.status === 'TESTING');
  const winnerPackages = packages.filter((p: any) => p.status === 'WINNER');
  const deadPackages = packages.filter((p: any) => p.status === 'DEAD');

  // Filter assets
  const scripts = assets.filter((a: any) => a.type === 'script');
  const mediaAssets = assets.filter((a: any) => a.type !== 'script');

  const assetFolders = ['videos', 'thumbnails', 'branding'];

  return (
    <main className="bg-zinc-950 text-white min-h-screen flex overflow-hidden">
      <Sidebar activeModule={"creative_factory"} onSelect={handleSidebarSelect} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <TopBar title={`Creative Lab: ${product?.name || slug}`} />

        {/* Tab switcher */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-zinc-800 bg-zinc-950 overflow-x-auto flex-shrink-0">
          {[
            { id: "packages", label: "📊 Performance Board" },
            { id: "guiones", label: "📁 Guiones (Video)" },
            { id: "copys", label: "📁 Copys de Anuncio" },
            { id: "conceptos", label: "🧠 Hipótesis Creativas" },
            { id: "modelos", label: "🏆 Modelos Ganadores" },
            { id: "assets", label: "📁 Vault Físico" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex-shrink-0 ${
                activeTab === tab.id ? "border-cyan-500 text-cyan-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB: PACKAGES (BOARD) */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              
              {editingPkg ? (
                <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-5 max-w-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Editar Texto de Anuncio ({editingPkg.name})</h3>
                    <button onClick={() => setEditingPkg(null)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <form onSubmit={handleEditPkgSave} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Hook Rate Testing (Texto de Gancho)</label>
                      <input 
                        type="text" 
                        value={editHook} 
                        onChange={e => setEditHook(e.target.value)} 
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">Copy Principal (Texto del Anuncio)</label>
                      <textarea 
                        value={editCopy} 
                        onChange={e => setEditCopy(e.target.value)} 
                        rows={4}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 outline-none resize-y" 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingPkg(null)} className="bg-zinc-800 px-4 py-2 rounded text-xs">Cancelar</button>
                      <button type="submit" disabled={savingPkgEdit} className="bg-cyan-500 text-black font-bold px-4 py-2 rounded text-xs">
                        {savingPkgEdit ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Crear Nuevo Package</h2>
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
                </>
              )}

              <div className="mt-8 border-t border-zinc-800 pt-8">
                <h2 className="text-xl font-bold mb-6">Performance Board</h2>
                <div className="grid grid-cols-3 gap-6">
                  
                  {/* COL: TESTING */}
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-bold text-yellow-500 mb-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div> TESTING ({testingPackages.length})
                    </div>
                    {testingPackages.map((pkg: any) => (
                      <PackageCard 
                        key={pkg.id} 
                        pkg={pkg} 
                        slug={slug} 
                        onEdit={(p) => {
                          setEditingPkg(p);
                          setEditHook(p.hook_text || "");
                          setEditCopy(p.copy_text || "");
                        }} 
                      />
                    ))}
                  </div>

                  {/* COL: WINNERS */}
                  <div className="bg-zinc-900/30 border border-green-900/30 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-bold text-green-500 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> WINNERS ({winnerPackages.length})
                    </div>
                    {winnerPackages.map((pkg: any) => (
                      <PackageCard 
                        key={pkg.id} 
                        pkg={pkg} 
                        slug={slug} 
                        isWinner 
                        onEdit={(p) => {
                          setEditingPkg(p);
                          setEditHook(p.hook_text || "");
                          setEditCopy(p.copy_text || "");
                        }} 
                      />
                    ))}
                  </div>

                  {/* COL: DEAD */}
                  <div className="bg-zinc-900/30 border border-red-900/20 rounded-xl p-4 flex flex-col gap-4 opacity-75">
                    <div className="flex items-center gap-2 font-bold text-red-500 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> DEAD ({deadPackages.length})
                    </div>
                    {deadPackages.map((pkg: any) => (
                      <PackageCard 
                        key={pkg.id} 
                        pkg={pkg} 
                        slug={slug} 
                        onEdit={(p) => {
                          setEditingPkg(p);
                          setEditHook(p.hook_text || "");
                          setEditCopy(p.copy_text || "");
                        }} 
                      />
                    ))}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB: GUIONES (VIDEO SCRIPTS) */}
          {activeTab === "guiones" && (
            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-230px)]">
              {/* Left pane: Scripts list */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-white uppercase">Guiones de Video Generados</h3>
                    <button 
                      onClick={() => {
                        setEditingScript(null);
                        setAddingScript(true);
                      }}
                      className="bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1 rounded text-xs font-semibold"
                    >
                      + Nuevo Guión
                    </button>
                  </div>
                  
                  {addingScript && (
                    <form onSubmit={handleCreateScript} className="bg-black/50 border border-zinc-800 p-4 rounded-lg mb-4 space-y-3">
                      <textarea
                        value={newScriptContent}
                        onChange={e => setNewScriptContent(e.target.value)}
                        placeholder="Escribe el nuevo guión aquí..."
                        rows={5}
                        className="w-full bg-black border border-zinc-800 rounded p-2 text-sm text-zinc-300 outline-none"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAddingScript(false)} className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded text-xs">Cancelar</button>
                        <button type="submit" className="bg-cyan-500 text-black font-bold px-3 py-1 rounded text-xs">Crear Guión</button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {scripts.map((s: any, idx: number) => (
                      <div 
                        key={s.id} 
                        onClick={() => {
                          setEditingScript(s);
                          setScriptContent(s.content);
                          setAddingScript(false);
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${editingScript?.id === s.id ? 'border-cyan-500 bg-cyan-950/10' : 'border-zinc-800 hover:border-zinc-700 bg-black/40'}`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-zinc-300">Guión #{idx + 1}</span>
                          <span className="text-[10px] text-zinc-500">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 italic">
                          {s.content}
                        </p>
                      </div>
                    ))}

                    {scripts.length === 0 && !addingScript && (
                      <p className="text-zinc-500 text-xs italic text-center py-6">No hay guiones registrados aún.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right pane: Script editor */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between h-full">
                {editingScript ? (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-sm text-white mb-2">Editar Guión</h3>
                      <textarea
                        value={scriptContent}
                        onChange={e => setScriptContent(e.target.value)}
                        className="flex-1 w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-cyan-500 resize-none min-h-[300px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
                      <button onClick={() => setEditingScript(null)} className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded text-xs">Cerrar</button>
                      <button onClick={handleSaveScript} disabled={savingScript} className="bg-cyan-500 text-black font-bold px-4 py-2 rounded text-xs">
                        {savingScript ? "Guardando..." : "Guardar Guión"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500 h-full">
                    <span>🎬</span>
                    <span className="text-xs mt-2">Selecciona un guión de la lista de la izquierda para editarlo.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COPYS DE ANUNCIO */}
          {activeTab === "copys" && (
            <div className="max-w-3xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-widest">Textos Principales para Meta Ads</h3>
              </div>
              <div className="space-y-4">
                {packages.map((pkg: any) => (
                  <div key={pkg.id} className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-extrabold text-white text-sm">{pkg.name}</div>
                      <span className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-400 border border-zinc-800 font-bold uppercase">
                        {pkg.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Copy de Anuncio</div>
                    <div className="bg-black/60 p-4 rounded-xl border border-zinc-800/80 text-sm text-zinc-300 whitespace-pre-line font-serif leading-relaxed">
                      {pkg.copy_text || "No copy text defined."}
                    </div>
                  </div>
                ))}
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

          {/* TAB: MODELOS GANADORES */}
          {activeTab === "modelos" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-4xl">
              <h3 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <span>🏆</span> Biblioteca de Ángulos Publicitarios Ganadores
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                Estos son los 10 ángulos más exitosos en la validación de productos que modela el Agente de IA para redactar tus ganchos y guiones:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "El test de la 'Caja Llena vs. Bolsillo Vacío'", emotion: "Incertidumbre / Miedo", desc: "Cuestiona si la plata de la caja es de la empresa o es solo para pagar deudas. Excelente para captar la atención." },
                  { title: "El esclavo de las 12 horas", emotion: "Frustración / Cansancio", desc: "El negocio no es negocio si no funciona sin el dueño. Ataca la falta de libertad y agotamiento mental." },
                  { title: "El 'Impuesto Silencioso' de la Merma", emotion: "Dolor por pérdida de dinero", desc: "Muestra cuánta plata se tira a la basura literalmente cada semana por no tener control estructurado." },
                  { title: "Delegar sin miedo al caos", emotion: "Alivio / Seguridad", desc: "Demuestra cómo con reglas claras y manuales sencillos, cualquier persona puede operar el local sin problemas." },
                  { title: "El Anti-Software Complicado", emotion: "Confianza / Simplicidad", desc: "Derriba el miedo a la tecnología con una promesa: 'Si sabes usar WhatsApp, sabes usar este sistema'." },
                  { title: "La 'Bolsa de la Semana' (Efecto Combo)", emotion: "Ambición / Curiosidad", desc: "Cómo aumentar las ventas del ticket promedio ofreciendo kits y ofertas agrupadas en vez de competir por precio." },
                  { title: "Separar los tantos: Casa vs. Negocio", emotion: "Culpa / Necesidad de orden", desc: "El error fatal de usar la caja del local como cajero automático personal para fletes o el colegio sin registrar." },
                  { title: "El Verdulero 'Profesional' vs. 'Aficionado'", emotion: "Ego / Supervivencia", desc: "El que mide sus números crece, el que trabaja a ciegas cierra en 6 meses. Posiciona al producto como el camino del éxito." }
                ].map((a, idx) => (
                  <div key={idx} className="p-4 bg-black/40 border border-zinc-800 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500">Ángulo #{idx + 1}</span>
                        <span className="text-[9px] bg-red-950/30 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded font-extrabold uppercase">{a.emotion}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1.5">{a.title}</h4>
                      <p className="text-xs text-zinc-400 mt-2 font-medium leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: VAULT DE ASSETS */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Vault de Media (Crudos)</h2>
                <p className="text-xs text-zinc-500 mb-6">Storage físico garantizado para creativos y videos: <code>/public/ads/{slug}/</code></p>
                <div className="grid grid-cols-3 gap-4">
                  {assetFolders.map(folder => (
                    <div key={folder} className="bg-black/50 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors">
                      <div className="text-2xl mb-2">📁</div>
                      <div className="font-semibold capitalize">{folder}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">/public/ads/{slug}/{folder}/</div>
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
function PackageCard({ pkg, slug, isWinner = false, onEdit }: { pkg: any, slug: string, isWinner?: boolean, onEdit: (pkg: any) => void }) {
  return (
    <div className={`bg-zinc-950 border ${isWinner ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-zinc-800'} rounded-lg p-4 flex flex-col`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm text-white">{pkg.name}</h3>
        {pkg.parent_id && <span className="text-[9px] bg-cyan-900/30 text-cyan-500 px-1.5 py-0.5 rounded border border-cyan-900/50">Clon</span>}
      </div>
      
      <div className="space-y-2 mb-4 flex-1">
        <div className="text-[11px]">
          <span className="text-zinc-500 block mb-0.5 font-bold uppercase">Concepto</span>
          <span className="bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">{pkg.concept?.name || 'Genérico'}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-zinc-500 block mb-0.5 font-bold uppercase">Gancho de Prueba</span>
          <span className="text-zinc-300 italic font-medium">"{pkg.hook_text || 'Sin hook asignado'}"</span>
        </div>
        <div className="text-[11px] pt-1">
          <span className="text-zinc-500 block mb-0.5 font-bold uppercase">Ruta de Destino</span>
          <span className="text-cyan-400 font-semibold">/{slug}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-black/50 p-2 rounded border border-zinc-800/50">
        <div className="text-center"><div className="text-[9px] text-zinc-500 font-bold">CTR</div><div className="font-mono text-xs text-white">{pkg.metrics?.ctr || 0}%</div></div>
        <div className="text-center"><div className="text-[9px] text-zinc-500 font-bold">ROAS</div><div className="font-mono text-xs text-white">{pkg.metrics?.roas || 0}x</div></div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {pkg.status === 'TESTING' && (
            <>
              <button onClick={() => updatePackageStatus(pkg.id, slug, 'WINNER')} className="flex-1 text-[10px] bg-green-900/20 text-green-400 border border-green-900/50 py-1.5 rounded hover:bg-green-900/40 font-bold">Promover</button>
              <button onClick={() => updatePackageStatus(pkg.id, slug, 'DEAD')} className="flex-1 text-[10px] bg-red-900/20 text-red-400 border border-red-900/50 py-1.5 rounded hover:bg-red-900/40 font-bold">Matar</button>
            </>
          )}
          {pkg.status === 'WINNER' && (
            <button onClick={() => duplicatePackage(pkg.id, slug)} className="w-full text-[10px] bg-cyan-900/20 text-cyan-400 border border-cyan-900/50 py-1.5 rounded hover:bg-cyan-900/40 font-bold">🧬 Clonar Iteración</button>
          )}
          {pkg.status === 'DEAD' && (
            <button onClick={() => archivePackage(pkg.id, slug)} className="w-full text-[10px] bg-zinc-800 text-zinc-400 py-1.5 rounded hover:text-white font-bold">Archivar</button>
          )}
        </div>
        <button 
          onClick={() => onEdit(pkg)} 
          className="text-center text-[10px] border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 py-1 rounded font-bold transition-all"
        >
          ✏️ Editar Copys de Anuncio
        </button>
      </div>
    </div>
  );
}
