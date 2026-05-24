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
  niche?: string;
}

interface Idea {
  id: string;
  title: string;
  niche: string;
  notes: string;
  pain_points: string[];
  desires: string[];
  avatar?: string;
  offer?: string;
  product_description?: string;
  status: string;
  created_at: string;
}

export function ProductFactoryModule() {
  const [activeTab, setActiveTab] = useState<"products" | "ideas">("products");
  
  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [prodError, setProdError] = useState<string | null>(null);

  // Ideas State
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  // Modal / Form State for Ideas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  
  // Idea Form inputs
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaNiche, setIdeaNiche] = useState("");
  const [ideaNotes, setIdeaNotes] = useState("");
  const [ideaAvatar, setIdeaAvatar] = useState("");
  const [ideaPainPoints, setIdeaPainPoints] = useState(""); // comma separated
  const [ideaDesires, setIdeaDesires] = useState(""); // comma separated
  const [ideaOffer, setIdeaOffer] = useState("");
  const [ideaProdDesc, setIdeaProdDesc] = useState("");

  const [aiProfiling, setAiProfiling] = useState(false);
  const [approvingIdea, setApprovingIdea] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);

  // Template Selection State
  const [availableTemplates, setAvailableTemplates] = useState<{landing: string[], producto: string[], manual: string[]}>({landing: [], producto: [], manual: []});
  const [landingTemplate, setLandingTemplate] = useState("");
  const [productoTemplate, setProductoTemplate] = useState("");
  const [manualTemplate, setManualTemplate] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar productos");
      setProducts(data.products || []);
    } catch (err: any) {
      setProdError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Ideas (excluding already approved/status 'approved' ones)
  const fetchIdeas = async () => {
    try {
      setLoadingIdeas(true);
      const res = await fetch("/api/ideas");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar ideas");
      
      // Filter out approved ideas to keep the pipeline clean
      const activeIdeas = (data.ideas || []).filter((i: Idea) => i.status !== "approved");
      setIdeas(activeIdeas);
    } catch (err: any) {
      setIdeasError(err.message);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success && data.templates) {
        setAvailableTemplates(data.templates);
        // Establecer valores por defecto si hay opciones disponibles
        if (data.templates.landing.length > 0) setLandingTemplate(data.templates.landing[0]);
        if (data.templates.producto.length > 0) setProductoTemplate(data.templates.producto[0]);
        if (data.templates.manual.length > 0) setManualTemplate(data.templates.manual[0]);
      }
    } catch (e) {
      console.error("Error cargando templates", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchIdeas();
    fetchTemplates();
  }, []);

  const handleOpenNewIdeaModal = () => {
    setSelectedIdea(null);
    setIdeaTitle("");
    setIdeaNiche("");
    setIdeaNotes("");
    setIdeaAvatar("");
    setIdeaPainPoints("");
    setIdeaDesires("");
    setIdeaOffer("");
    setIdeaProdDesc("");
    setCheckoutUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditIdeaModal = (idea: Idea) => {
    setSelectedIdea(idea);
    setIdeaTitle(idea.title);
    setIdeaNiche(idea.niche);
    setIdeaNotes(idea.notes || "");
    setIdeaAvatar(idea.avatar || "");
    setIdeaPainPoints((idea.pain_points || []).join(", "));
    setIdeaDesires((idea.desires || []).join(", "));
    setIdeaOffer(idea.offer || "");
    setIdeaProdDesc(idea.product_description || "");
    setCheckoutUrl(""); // Se pide solo al momento de aprobar
    setIsModalOpen(true);
  };

  // Auto-complete idea fields using LLM
  const handleAiProfile = async () => {
    if (!ideaTitle.trim() || !ideaNiche.trim()) {
      alert("Por favor ingresa un Título y Nicho para que la IA investigue.");
      return;
    }

    try {
      setAiProfiling(true);
      const res = await fetch("/api/ai/profile-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: ideaTitle, niche: ideaNiche }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const p = data.profile;
      setIdeaAvatar(p.avatar || "");
      setIdeaOffer(p.offer || "");
      setIdeaProdDesc(p.product_description || "");
      if (p.pain_points) setIdeaPainPoints(p.pain_points.join(", "));
      if (p.desires) setIdeaDesires(p.desires.join(", "));
    } catch (err: any) {
      alert("Error en el perfilado con IA: " + err.message);
    } finally {
      setAiProfiling(false);
    }
  };

  // Save or Update Idea
  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaNiche.trim()) return;

    const painPointsArray = ideaPainPoints
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    const desiresArray = ideaDesires
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    try {
      setSavingIdea(true);
      const method = selectedIdea ? "PUT" : "POST";
      const payload = {
        id: selectedIdea?.id,
        title: ideaTitle,
        niche: ideaNiche,
        notes: ideaNotes,
        pain_points: painPointsArray,
        desires: desiresArray,
        avatar: ideaAvatar,
        offer: ideaOffer,
        product_description: ideaProdDesc,
        status: "idea"
      };

      const res = await fetch("/api/ideas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setIsModalOpen(false);
      fetchIdeas();
    } catch (err: any) {
      alert("Error al guardar la idea: " + err.message);
    } finally {
      setSavingIdea(false);
    }
  };

  // Approve Idea and trigger Launch Orchestra
  const handleApproveIdea = async () => {
    if (!selectedIdea) return;
    
    const confirmLaunch = confirm(
      `¿Confirmas la aprobación de "${ideaTitle}"?\n\nEsto creará automáticamente:\n1. El Producto en Base de Datos.\n2. La Landing Page usando la Plantilla Ganadora.\n3. 3 Anuncios con guiones de video y copys redactados por IA.\n4. Checklist de lanzamiento.`
    );

    if (!confirmLaunch) return;

    try {
      setApprovingIdea(true);
      const res = await fetch("/api/ideas/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ideaId: selectedIdea.id,
          landingTemplate,
          productoTemplate,
          manualTemplate,
          checkoutUrl
        }),
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert(`🚀 ¡Ecosistema creado con éxito!\nProducto: "${ideaTitle}" está listo para validar.`);
      setIsModalOpen(false);
      
      // Refresh both and go to products view
      await fetchProducts();
      await fetchIdeas();
      setActiveTab("products");
    } catch (err: any) {
      alert("Error al orquestar el lanzamiento: " + err.message);
    } finally {
      setApprovingIdea(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Fábrica de Productos
          </h2>
          <p className="text-zinc-400 mt-1 text-sm">
            Diseña, perfila y orquesta tus embudos de validación con un solo clic.
          </p>
        </div>
        
        {activeTab === "ideas" && (
          <button 
            onClick={handleOpenNewIdeaModal}
            className="bg-gradient-to-r from-green-400 to-cyan-500 hover:opacity-90 transition-opacity text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-green-500/10 text-sm"
          >
            <span>💡</span> Nueva Idea de Producto
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-zinc-800 mb-8 bg-zinc-900/30 p-1.5 rounded-xl gap-2 w-fit">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "products"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700/50"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span>🏭</span> Productos Activos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "ideas"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700/50"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span>💡</span> Pipeline de Ideas ({ideas.length})
        </button>
      </div>

      {/* TAB: PRODUCTS */}
      {activeTab === "products" && (
        <>
          {prodError && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
              {prodError}
            </div>
          )}

          {loadingProducts ? (
            <div className="flex justify-center items-center py-20 text-zinc-500">
              <div className="flex flex-col items-center gap-3">
                <span className="w-10 h-10 border-2 border-zinc-800 border-t-green-400 rounded-full animate-spin"></span>
                <span className="text-sm">Abriendo la fábrica de productos...</span>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 hover:bg-zinc-900 transition-all group flex flex-col relative overflow-hidden backdrop-blur-md"
                  style={{
                    boxShadow: "0 10px 30px -15px rgba(0,0,0,0.7)"
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: product.color }}></div>
                  
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-inner" style={{ backgroundColor: product.color }}>
                      {product.name[0]}
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-zinc-950/80 border-zinc-800 text-zinc-400">
                      {product.status === 'IDEA' ? '💡 Idea' :
                       product.status === 'VALIDANDO' ? '🧪 Validando' :
                       product.status === 'CONSTRUYENDO' ? '🏗️ Construyendo' :
                       product.status === 'LANZADO' ? '🚀 Lanzado' :
                       product.status === 'GANADOR' ? '🏆 Ganador' : product.status}
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-extrabold text-xl text-white group-hover:text-green-400 transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-zinc-500 text-xs mt-0.5 font-medium tracking-wide uppercase">Nicho: {product.niche || "No definido"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6 bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">MRR</div>
                      <div className="font-mono text-sm font-bold text-white mt-0.5">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(product.mrr)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Leads</div>
                      <div className="font-mono text-sm font-bold text-white mt-0.5">{product.leads}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-800/80 flex flex-col gap-2.5">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Navegación del Activo</div>
                    <div className="grid grid-cols-2 gap-2">
                      <a href={`/os/landing/${product.slug}`} className="text-center text-xs py-2 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all font-bold">
                        Landing HQ 🌐
                      </a>
                      <a href={`/os/creative/${product.slug}`} className="text-center text-xs py-2 rounded-lg bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/20 hover:border-purple-800/50 text-purple-400 hover:text-purple-300 transition-all font-bold">
                        Creative Lab 🎨
                      </a>
                    </div>
                    <a href={`/os/product/${product.slug}`} className="text-center text-xs py-2 rounded-lg bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-900/20 hover:border-cyan-800/50 text-cyan-400 hover:text-cyan-300 transition-all font-bold">
                      Ficha Operativa (Notas) →
                    </a>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="col-span-full text-center py-20 text-zinc-500 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl italic">
                  No hay productos activos registrados. ¡Prueba aprobar una idea!
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB: IDEAS PIPELINE */}
      {activeTab === "ideas" && (
        <>
          {ideasError && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
              {ideasError}
            </div>
          )}

          {loadingIdeas ? (
            <div className="flex justify-center items-center py-20 text-zinc-500">
              <div className="flex flex-col items-center gap-3">
                <span className="w-10 h-10 border-2 border-zinc-800 border-t-cyan-400 rounded-full animate-spin"></span>
                <span className="text-sm">Analizando pipeline de ideas...</span>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <div 
                  key={idea.id} 
                  onClick={() => handleOpenEditIdeaModal(idea)}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-zinc-900/80 transition-all group cursor-pointer flex flex-col relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-zinc-700 to-zinc-900 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all"></div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-900/30 px-2 py-0.5 rounded uppercase tracking-wider">
                      {idea.niche}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {idea.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-3 flex-1">
                    {idea.offer || idea.notes || "Haga clic para editar y configurar el perfilado con la IA."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500 group-hover:text-zinc-300">
                    <span className="flex items-center gap-1">
                      <span>🧠</span> {idea.pain_points?.length || 0} dolores
                    </span>
                    <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-0.5">
                      Editar Idea ⚡
                    </span>
                  </div>
                </div>
              ))}

              {ideas.length === 0 && (
                <div className="col-span-full text-center py-20 text-zinc-500 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl italic">
                  No hay ideas registradas en el pipeline.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* IDEA MODAL / DRAWER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl h-screen bg-zinc-950 border-l border-zinc-850 p-8 overflow-y-auto flex flex-col justify-between shadow-2xl relative">
            
            {/* Close button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white text-xl p-2"
            >
              ✕
            </button>

            <div>
              <div className="mb-6">
                <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
                  {selectedIdea ? "💡 Perfilador de Idea" : "✨ Nueva Hipótesis"}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedIdea ? `Editar: ${selectedIdea.title}` : "Registrar Idea de Negocio"}
                </h3>
              </div>

              <form onSubmit={handleSaveIdea} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Título de la Idea</label>
                    <input 
                      type="text" 
                      value={ideaTitle}
                      onChange={e => setIdeaTitle(e.target.value)}
                      placeholder="Ej: RestaurantPro o Copilot Legal"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Nicho / Categoría</label>
                    <input 
                      type="text" 
                      value={ideaNiche}
                      onChange={e => setIdeaNiche(e.target.value)}
                      placeholder="Ej: Gastronomía, Abogados, Fitness"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-xl">
                  <div className="max-w-[70%]">
                    <h4 className="text-xs font-extrabold text-cyan-400 uppercase">Perfilado Automático con IA</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">Nuestra IA analizará dolores, deseos, avatar ideal y redactará la oferta de la landing en segundos.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiProfile}
                    disabled={aiProfiling}
                    className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {aiProfiling ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                        Analizando...
                      </>
                    ) : (
                      <>⚡ Autocompletar con IA</>
                    )}
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Avatar del Comprador Ideal (IA)</label>
                    <textarea 
                      value={ideaAvatar}
                      onChange={e => setIdeaAvatar(e.target.value)}
                      placeholder="IA describirá al comprador estrella..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500 min-h-[60px] resize-y"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Dolores de Cabeza (Separados por coma)</label>
                    <input 
                      type="text" 
                      value={ideaPainPoints}
                      onChange={e => setIdeaPainPoints(e.target.value)}
                      placeholder="Problema 1, Problema 2, Problema 3"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Deseos y Soluciones Anheladas (Separados por coma)</label>
                    <input 
                      type="text" 
                      value={ideaDesires}
                      onChange={e => setIdeaDesires(e.target.value)}
                      placeholder="Deseo 1, Deseo 2, Deseo 3"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Oferta de la Landing (Promesa)</label>
                    <input 
                      type="text" 
                      value={ideaOffer}
                      onChange={e => setIdeaOffer(e.target.value)}
                      placeholder="Ej: Consigue administrar tu restaurante en 1 clic sin planillas"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Descripción Comercial del Producto</label>
                    <textarea 
                      value={ideaProdDesc}
                      onChange={e => setIdeaProdDesc(e.target.value)}
                      placeholder="Qué es lo que realmente se entrega al comprar..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500 min-h-[65px] resize-y"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block uppercase tracking-wider">Apuntes Operativos Generales</label>
                    <textarea 
                      value={ideaNotes}
                      onChange={e => setIdeaNotes(e.target.value)}
                      placeholder="Notas adicionales..."
                      className="w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-400 outline-none focus:border-zinc-700 min-h-[60px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-850">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingIdea}
                    className="px-5 py-2.5 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-50"
                  >
                    {savingIdea ? "Guardando..." : "Guardar Idea"}
                  </button>
                </div>
              </form>
            </div>

            {/* Approve Panel for Edit Mode */}
            {selectedIdea && (
              <div className="mt-8 p-5 bg-green-950/10 border border-green-500/20 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                      <span>🚀</span> ¿Listo para Validar el Mercado?
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">Configura la URL de pago y elige qué plantillas deseas que la IA modele antes de lanzar la orquesta.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApproveIdea}
                    disabled={approvingIdea}
                    className="bg-gradient-to-r from-green-400 to-cyan-500 text-black px-6 py-2.5 rounded-xl text-sm font-black tracking-wide shadow-md shadow-green-500/10 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {approvingIdea ? (
                      <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span> Desplegando...</>
                    ) : (
                      <>🚀 APROBAR E INICIAR</>
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-black/40 border border-zinc-800/80 rounded-xl mt-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Link de Pago (Checkout / WhatsApp)</label>
                    <input 
                      type="text" 
                      value={checkoutUrl}
                      onChange={e => setCheckoutUrl(e.target.value)}
                      placeholder="https://link.mercadopago.com.ar/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Plantilla de Landing</label>
                    <select 
                      value={landingTemplate} 
                      onChange={e => setLandingTemplate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-green-500"
                    >
                      <option value="">-- Ninguna --</option>
                      {availableTemplates.landing.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Plantilla de Producto</label>
                    <select 
                      value={productoTemplate} 
                      onChange={e => setProductoTemplate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-green-500"
                    >
                      <option value="">-- Ninguna --</option>
                      {availableTemplates.producto.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Plantilla de Manual (Entrega)</label>
                    <select 
                      value={manualTemplate} 
                      onChange={e => setManualTemplate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-green-500"
                    >
                      <option value="">-- Ninguna --</option>
                      {availableTemplates.manual.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
