"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { 
  addVariant, 
  updateVariantConfig, 
  toggleMainVariant, 
  deleteVariant,
  updateProductDetails,
  updateProductManual 
} from "./actions";
import { getFileTree, readFileContent, saveFileContent } from "./codeActions";

export default function LandingHQClient({ slug, initialData }: { slug: string, initialData: any }) {
  const { product: initialProduct, variants } = initialData;
  
  const [activeTab, setActiveTab] = useState<"variantes" | "assets" | "codigo" | "ficha" | "manual" | "plantilla">("variantes");
  
  // Product state
  const [product, setProduct] = useState(initialProduct);
  const [prodPrice, setProdPrice] = useState(initialProduct?.price || 0);
  const [prodCheckout, setProdCheckout] = useState(initialProduct?.checkout_url || "");
  const [prodStatus, setProdStatus] = useState(initialProduct?.status || "CONSTRUYENDO");
  const [savingDetails, setSavingDetails] = useState(false);

  // Manual state
  const [manualMarkdown, setManualMarkdown] = useState(initialProduct?.delivery_manual || "");
  const [savingManual, setSavingManual] = useState(false);

  // State: Variants
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantType, setNewVariantType] = useState("direct_response");

  // State: Editor Rápido
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEditor, setSavingEditor] = useState(false);

  // State: Code Explorer
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [activeFile, setActiveFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState("");
  const [savingCode, setSavingCode] = useState(false);

  // Load File Tree function
  const refreshFileTree = async () => {
    const tree = await getFileTree(slug);
    setFileTree(tree);
  };

  // Load File Tree on Mount
  useEffect(() => {
    refreshFileTree();
  }, [slug]);

  const handleEditorSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;
    setSavingEditor(true);
    await updateVariantConfig(editingVariant.id, slug, editForm);
    setSavingEditor(false);
    setEditingVariant(null);
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantName.trim()) return;
    await addVariant(slug, newVariantName, newVariantType);
    setNewVariantName("");
    await refreshFileTree(); // Auto-refresh tree
  };

  const handleSidebarSelect = (mod: string) => {
    window.location.href = `/?module=${mod}`;
  };

  const handleFileClick = async (file: any) => {
    if (file.type === 'file') {
      setActiveFile(file);
      const content = await readFileContent(slug, file.category, file.path);
      setFileContent(content);
    }
  };

  const handleSaveCode = async () => {
    if (!activeFile) return;
    setSavingCode(true);
    await saveFileContent(slug, activeFile.category, activeFile.path, fileContent);
    setSavingCode(false);
  };

  // Save product details (Ficha)
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    const res = await updateProductDetails(slug, prodPrice, prodCheckout, prodStatus);
    setSavingDetails(false);
    if (res.success) {
      alert("Ficha del Producto guardada con éxito.");
      setProduct({ ...product, price: prodPrice, checkout_url: prodCheckout, status: prodStatus });
    } else {
      alert("Error al guardar: " + res.error);
    }
  };

  // Save User Manual
  const handleSaveManual = async () => {
    setSavingManual(true);
    const res = await updateProductManual(slug, product.name, manualMarkdown);
    setSavingManual(false);
    if (res.success) {
      alert("Manual del usuario guardado y publicado en HTML.");
    } else {
      alert("Error al guardar: " + res.error);
    }
  };

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node, i) => (
      <div key={i} className="font-mono text-xs">
        <div 
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-zinc-800 rounded ${activeFile?.path === node.path ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-400'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          <span>{node.type === 'directory' ? '📁' : '📄'}</span>
          <span>{node.name}</span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-2 border-l border-zinc-800 pl-2">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const assetFolders = ['hero', 'logos', 'mockups', 'videos', 'thumbnails', 'branding'];

  return (
    <main className="bg-zinc-950 text-white min-h-screen flex overflow-hidden">
      <Sidebar activeModule={"landing_factory"} onSelect={handleSidebarSelect} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <TopBar title={`Landing HQ: ${product?.name || slug}`} />

        {/* Internal Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-zinc-800 bg-zinc-950 overflow-x-auto flex-shrink-0">
          {[
            { id: "variantes", label: "📄 Variantes" },
            { id: "ficha", label: "📦 Ficha de Producto" },
            { id: "manual", label: "📖 Manual de Usuario" },
            { id: "plantilla", label: "🏆 Plantilla Ganadora" },
            { id: "assets", label: "📁 Vault Manager" },
            { id: "codigo", label: "💻 Code Explorer" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'codigo') refreshFileTree();
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex-shrink-0 ${
                activeTab === tab.id ? "border-cyan-500 text-cyan-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/50">
          
          {/* TAB: VARIANTES */}
          {activeTab === "variantes" && (
            <div className="grid grid-cols-2 gap-6 h-full min-h-[500px]">
              {editingVariant ? (
                <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400"><span>⚡</span> Editor Rápido Nativo</h2>
                    <button onClick={() => setEditingVariant(null)} className="text-zinc-500 hover:text-white">✕ Cerrar</button>
                  </div>
                  <form onSubmit={handleEditorSave} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Título Principal (Hook)</label>
                      <textarea value={editForm.hook} onChange={e => setEditForm({...editForm, hook: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none" rows={3} placeholder="¿Cansado de perder dinero?"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Subtítulo (Copy)</label>
                      <textarea value={editForm.copy} onChange={e => setEditForm({...editForm, copy: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none" rows={3} placeholder="Descubre el método que..."></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Texto del Botón</label>
                        <input type="text" value={editForm.ctaText} onChange={e => setEditForm({...editForm, ctaText: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Color Principal (Hex)</label>
                        <input type="text" value={editForm.primaryColor} onChange={e => setEditForm({...editForm, primaryColor: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none" placeholder="#10b981" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Link Checkout / WhatsApp</label>
                      <input type="text" value={editForm.checkoutUrl} onChange={e => setEditForm({...editForm, checkoutUrl: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">URL de Video (Opcional)</label>
                      <input type="text" value={editForm.videoUrl} onChange={e => setEditForm({...editForm, videoUrl: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none" placeholder="https://...mp4" />
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button type="submit" disabled={savingEditor} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-lg transition-colors">
                        {savingEditor ? 'Generando Código...' : 'Guardar y Publicar Variante'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <form onSubmit={handleAddVariant} className="flex gap-2 mb-6">
                  <input type="text" placeholder="Nombre (ej: VSL Dolor)" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded px-3 text-sm focus:border-cyan-500 outline-none" />
                  <select value={newVariantType} onChange={(e) => setNewVariantType(e.target.value)} className="bg-black border border-zinc-800 rounded px-3 text-sm text-zinc-300 outline-none">
                    <option value="direct_response">Respuesta Directa</option>
                    <option value="vsl">VSL</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm font-semibold">Crear</button>
                </form>

                <div className="space-y-3">
                  {variants?.map((v: any) => (
                    <div key={v.id} className="bg-black/50 border border-zinc-800 p-4 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{v.name}</h3>
                          {v.is_main && <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-green-500/30">Principal</span>}
                        </div>
                        <div className="mt-2 text-sm text-zinc-400 bg-zinc-900/30 p-3 rounded-lg border border-dashed border-zinc-800">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">📂 /legacy/{slug}/{v.config?.folder || ''}</span>
                            <a href={`/legacy/${slug}/${v.config?.folder || ''}/index.html`} target="_blank" className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded transition-colors">
                              Ver Variante ↗
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button onClick={() => {
                          setEditingVariant(v);
                          setEditForm({
                            hook: v.config?.hook || '',
                            copy: v.config?.copy || '',
                            ctaText: v.config?.ctaText || '¡Quiero Empezar Ahora!',
                            checkoutUrl: v.config?.checkoutUrl || '',
                            primaryColor: v.config?.primaryColor || '#10b981',
                            videoUrl: v.config?.videoUrl || ''
                          });
                        }} className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold px-3 py-1.5 rounded flex items-center justify-center gap-2 transition-colors border border-emerald-500/20">
                          <span>⚡</span> Editor Rápido
                        </button>
                        <button onClick={() => setActiveTab('codigo')} className="text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-3 py-1.5 rounded flex items-center justify-center gap-2 transition-colors">
                          <span>💻</span> Código
                        </button>
                        {!v.is_main && (
                          <button onClick={() => toggleMainVariant(v.id, slug)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded transition-colors">
                            ⭐ Hacer Principal
                          </button>
                        )}
                        {!v.is_main && (
                          <button onClick={async () => {
                            if (confirm('¿Eliminar variante? Se borrará el código para siempre.')) {
                              await deleteVariant(v.id, slug);
                              await refreshFileTree();
                            }
                          }} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors border border-red-500/20 mt-2">
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Preview Iframe */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
                <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-mono text-zinc-500">Preview: /{slug}</span>
                  <a href={`/${slug}`} target="_blank" className="text-xs text-cyan-400 hover:underline">Ver Live ↗</a>
                </div>
                <div className="flex-1 bg-black">
                  <iframe src={`/${slug}`} className="w-full h-full border-none" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: FICHA DE PRODUCTO */}
          {activeTab === "ficha" && (
            <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>📦</span> Ficha Comercial de {product.name}
              </h3>
              <p className="text-xs text-zinc-500 mb-6">Configura los datos del producto que se inyectarán en la landing page y el manual de entrega.</p>
              
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Precio sugerido ($ USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={prodPrice} 
                      onChange={e => setProdPrice(parseFloat(e.target.value))} 
                      className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-cyan-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Estado de validación</label>
                    <select 
                      value={prodStatus} 
                      onChange={e => setProdStatus(e.target.value)} 
                      className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-cyan-500"
                    >
                      <option value="IDEA">💡 IDEA</option>
                      <option value="VALIDANDO">🧪 VALIDANDO</option>
                      <option value="CONSTRUYENDO">🏗️ CONSTRUYENDO</option>
                      <option value="LANZADO">🚀 LANZADO</option>
                      <option value="GANADOR">🏆 GANADOR</option>
                      <option value="DESCARTADO">💀 DESCARTADO</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Enlace de Checkout (MercadoPago / Stripe)</label>
                  <input 
                    type="text" 
                    value={prodCheckout} 
                    onChange={e => setProdCheckout(e.target.value)} 
                    placeholder="https://..."
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm outline-none focus:border-cyan-500" 
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Este enlace reemplaza automáticamente el enlace del botón de compra en la landing page.</span>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={savingDetails}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-6 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
                  >
                    {savingDetails ? "Guardando..." : "Guardar Ficha Comercial"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: MANUAL DEL USUARIO */}
          {activeTab === "manual" && (
            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-230px)]">
              {/* Left pane: Editor */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">Editor de Manual (Markdown)</h3>
                    <span className="text-[10px] text-zinc-500">Soporte básico: # H1, ## H2, ### H3, - Lista, **Negrita**</span>
                  </div>
                  <textarea 
                    value={manualMarkdown} 
                    onChange={e => setManualMarkdown(e.target.value)}
                    placeholder="# Manual de usuario para..."
                    className="flex-1 w-full bg-black text-zinc-300 font-mono text-sm p-4 border border-zinc-800 rounded-lg focus:outline-none focus:border-cyan-500 resize-none min-h-[300px]"
                  />
                </div>
                <div className="pt-4 flex justify-end flex-shrink-0">
                  <button 
                    onClick={handleSaveManual}
                    disabled={savingManual}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-2 rounded-lg text-xs tracking-wider uppercase transition-all"
                  >
                    {savingManual ? "Guardando..." : "Guardar y Publicar Manual HTML"}
                  </button>
                </div>
              </div>

              {/* Right pane: Preview */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
                <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-mono text-zinc-500">Preview: /manual (HTML en vivo)</span>
                  <a href={`/legacy/${slug}/manual/index.html`} target="_blank" className="text-xs text-cyan-400 hover:underline">Ver pantalla completa ↗</a>
                </div>
                <div className="flex-1 bg-black">
                  <iframe src={`/legacy/${slug}/manual/index.html`} className="w-full h-full border-none" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANTILLA GANADORA */}
          {activeTab === "plantilla" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-4xl">
              <h3 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                <span>🏆</span> Modelo de Plantilla de Conversión Ganadora
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                Ingenio OS utiliza esta estructura basada en el exitoso modelo VerdePro para modelar y adaptar tu nuevo producto de forma automática:
              </p>

              <div className="space-y-4">
                {[
                  { section: "⏱️ Barra de Urgencia Superior", detail: "Inyecta un contador de cuenta regresiva para incentivar la compra inmediata." },
                  { section: "🎯 Hero Section (Propuesta de Valor)", detail: "Visualización limpia con el Gancho Principal (Hook), el subtítulo persuasivo y un video o mockup del producto." },
                  { section: "🛑 Bloque de Dolores (Pain Points)", detail: "4 tarjetas de dolor de cabeza principales que el avatar comprador padece en su día a día." },
                  { section: "✨ Bloque de Beneficios (Checklist)", detail: "5 viñetas positivas que demuestran qué cambia y qué se soluciona al tener tu producto." },
                  { section: "⚖️ Tabla de Comparación (Antes / Después)", detail: "Tabla comparativa rápida que resalta las frustraciones de no usar el sistema contra los beneficios de tenerlo." },
                  { section: "🎁 Módulos del Producto & 6 Bonos Gratis", detail: "Desglose visual del producto en módulos de valor y bonos de regalo estructurados de forma irresistible." },
                  { section: "📢 Testimonios Infinitos", detail: "Carrusel continuo de reseñas de clientes satisfechos para inyectar prueba social." },
                  { section: "💳 Caja de Precios con Checkout", detail: "Precio de oferta, garantía de 15 días y un botón enlazado directamente a tu MercadoPago o Stripe." }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-4 p-3.5 bg-black/40 border border-zinc-800 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 flex-shrink-0 text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.section}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CODIGO */}
          {activeTab === "codigo" && (
            <div className="flex h-full gap-4">
              <div className="w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-3 overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Archivos</div>
                  <button onClick={refreshFileTree} className="text-xs text-zinc-400 hover:text-white" title="Recargar archivos">🔄</button>
                </div>
                {renderTree(fileTree)}
              </div>
              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-sm font-mono text-zinc-300">{activeFile ? activeFile.path : 'Selecciona un archivo'}</span>
                  {activeFile && (
                    <button onClick={handleSaveCode} disabled={savingCode} className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-1 rounded text-xs font-bold">
                      {savingCode ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  )}
                </div>
                <textarea 
                  value={fileContent} 
                  onChange={(e) => setFileContent(e.target.value)}
                  disabled={!activeFile}
                  spellCheck={false}
                  className="flex-1 w-full bg-[#0d0d0d] text-emerald-400 font-mono text-sm p-4 focus:outline-none resize-none"
                  placeholder="El código aparecerá aquí..."
                />
              </div>
            </div>
          )}

          {/* TAB: ASSETS */}
          {activeTab === "assets" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Vault Físico (Asset Manager)</h2>
              <div className="grid grid-cols-3 gap-4">
                {assetFolders.map(folder => (
                  <div key={folder} className="bg-black/50 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors">
                    <div className="text-2xl mb-2">📁</div>
                    <div className="font-semibold capitalize">{folder}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-1">/public/assets/{slug}/{folder}/</div>
                    <input type="file" className="text-[10px] mt-3 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-300 w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
