"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { addVariant, updateVariantConfig, toggleMainVariant, deleteVariant } from "./actions";
import { getFileTree, readFileContent, saveFileContent } from "./codeActions";

export default function LandingHQClient({ slug, initialData }: { slug: string, initialData: any }) {
  const { product, variants } = initialData;
  const [activeTab, setActiveTab] = useState<"variantes" | "assets" | "codigo" | "deploys">("variantes");

  // State: Variants
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantType, setNewVariantType] = useState("direct_response");

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

  const handleUploadZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', slug);
    formData.append('folder', 'zip_deploy');

    alert("Subiendo build... (esto reemplazará el código estático actual)");
    await fetch('/api/upload', { method: 'POST', body: formData });
    alert("Build subido correctamente.");
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
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-zinc-800 bg-zinc-950">
          {[
            { id: "variantes", label: "📄 Variantes (Landings)" },
            { id: "assets", label: "📁 Asset Manager" },
            { id: "codigo", label: "💻 Code Explorer" },
            { id: "deploys", label: "🚀 Deploys" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'codigo') refreshFileTree();
              }}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
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
            <div className="grid grid-cols-2 gap-6">
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
                        <button onClick={() => setActiveTab('codigo')} className="text-xs bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded flex items-center justify-center gap-2 transition-colors border border-cyan-500/20">
                          <span>💻</span> Editar Código
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

              {/* Preview Iframe Mock */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-mono text-zinc-500">Preview: {slug}.ingeniodigital.shop</span>
                  <a href={`/${slug}`} target="_blank" className="text-xs text-cyan-400 hover:underline">Abrir Live ↗</a>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center text-zinc-700">
                  <iframe src={`/${slug}`} className="w-full h-full border-none opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                </div>
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
              <h2 className="text-lg font-bold mb-4">Asset Manager Físico</h2>
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

          {/* TAB: DEPLOYS */}
          {activeTab === "deploys" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">📦</div>
                <h2 className="text-xl font-bold mb-2">Reemplazar Build Completo</h2>
                <p className="text-zinc-400 text-sm mb-6">Sube un archivo .zip exportado de GHL, Webflow o un build de React para reemplazar los estáticos legacy.</p>
                <label className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-bold cursor-pointer hover:opacity-90 transition-opacity inline-block">
                  Seleccionar ZIP de Build
                  <input type="file" accept=".zip" className="hidden" onChange={handleUploadZip} />
                </label>
              </div>

              <div className="bg-black border border-zinc-800 rounded-xl p-4">
                <div className="text-xs font-mono text-zinc-500 mb-2">Deploy Logs</div>
                <div className="font-mono text-xs text-green-400 space-y-1">
                  <div>[sys] Landing HQ v2 Iniciado.</div>
                  <div>[sys] Entorno listo para despliegues.</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
