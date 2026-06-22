"use client";

import React, { useState, useEffect } from "react";

type FactoryStep = "select_idea" | "hooks" | "images" | "scripts" | "done";

export function CreativeFactoryModule() {
  const [step, setStep] = useState<FactoryStep>("select_idea");
  const [loading, setLoading] = useState(false);
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  // Generative State
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);
  const [selectedHooks, setSelectedHooks] = useState<string[]>([]);
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const [generatedScripts, setGeneratedScripts] = useState<string[]>([]);
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);

  // 1. Fetch Ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch("/api/ideas");
        const data = await res.json();
        if (data.success && data.ideas) {
          setIdeas(data.ideas);
        }
      } catch (err) {
        console.error("Error fetching ideas", err);
      }
    };
    fetchIdeas();
  }, []);

  const handleGenerate = async (targetStep: FactoryStep, context: any, setter: (val: string[]) => void) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/creative-factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: targetStep, context })
      });
      const data = await res.json();
      if (data.results) {
        setter(data.results);
      } else {
        alert("Error en la respuesta de la IA.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red.");
    }
    setLoading(false);
    setStep(targetStep);
  };

  const handleToggleSelection = (item: string, selectedList: string[], setSelectedList: (val: string[]) => void) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedIdea) return;
    setLoading(true);
    
    try {
      const inserts = [];
      for (const hook of selectedHooks) {
        inserts.push({ idea_id: selectedIdea.id, asset_type: 'hook', content: hook });
      }
      for (const img of selectedImages) {
        inserts.push({ idea_id: selectedIdea.id, asset_type: 'image_concept', content: img });
      }
      for (const script of selectedScripts) {
        inserts.push({ idea_id: selectedIdea.id, asset_type: 'short_script', content: script });
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from("pve_creative_assets").insert(inserts);
        if (error) throw error;
        alert("¡Activos guardados exitosamente en la Creative Vault!");
        setStep("done");
      } else {
        alert("No seleccionaste ningún activo para guardar.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error al guardar: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fábrica de Creativos (V1)</h1>
        <p className="text-zinc-400">Refinamiento Iterativo: Descubre mensajes ganadores sin generar explosión de contenido basura.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        
        {/* STEP 1: SELECT IDEA */}
        {step === "select_idea" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl text-fuchsia-400 font-mono mb-4">1. Seleccionar Hipótesis Validada</h2>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {ideas.length === 0 ? <p className="text-zinc-500">No hay hipótesis en pve_ideas aún.</p> : ideas.map(idea => (
                <div 
                  key={idea.id} 
                  onClick={() => setSelectedIdea(idea)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedIdea?.id === idea.id ? 'bg-fuchsia-900/30 border-fuchsia-500' : 'bg-black border-zinc-800 hover:border-zinc-600'}`}
                >
                  <h3 className="text-white font-bold">{idea.niche}</h3>
                  <p className="text-sm text-zinc-400 truncate">{idea.offer}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleGenerate("hooks", selectedIdea, setGeneratedHooks)}
              disabled={!selectedIdea || loading}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              {loading ? "Generando 20 Hooks..." : "Empezar Refinamiento: Generar 20 Hooks"}
            </button>
          </div>
        )}

        {/* STEP 2: HOOKS */}
        {step === "hooks" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl text-fuchsia-400 font-mono mb-4">2. Selecciona tus Hooks Favoritos ({selectedHooks.length} seleccionados)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-[50vh] overflow-y-auto pr-2">
              {generatedHooks.map((hook, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleSelection(hook, selectedHooks, setSelectedHooks)}
                  className={`p-3 border rounded-lg cursor-pointer text-sm ${selectedHooks.includes(hook) ? 'bg-fuchsia-900/40 border-fuchsia-500 text-white' : 'bg-black border-zinc-800 text-zinc-300'}`}
                >
                  {hook}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleGenerate("images", { ...selectedIdea, selected_hooks: selectedHooks }, setGeneratedImages)}
                disabled={loading || selectedHooks.length === 0}
                className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
              >
                {loading ? "Generando..." : "Siguiente: Generar Conceptos de Imagen basados en Hooks"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: IMAGES */}
        {step === "images" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl text-fuchsia-400 font-mono mb-4">3. Selecciona Conceptos de Imagen ({selectedImages.length} seleccionados)</h2>
            <div className="grid grid-cols-1 gap-3 mb-6 max-h-[50vh] overflow-y-auto pr-2">
              {generatedImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleSelection(img, selectedImages, setSelectedImages)}
                  className={`p-4 border rounded-lg cursor-pointer text-sm ${selectedImages.includes(img) ? 'bg-fuchsia-900/40 border-fuchsia-500 text-white' : 'bg-black border-zinc-800 text-zinc-300'}`}
                >
                  {img}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleGenerate("scripts", { ...selectedIdea, selected_images: selectedImages }, setGeneratedScripts)}
                disabled={loading || selectedImages.length === 0}
                className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
              >
                {loading ? "Generando..." : "Siguiente: Redactar Guiones para VSL"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SCRIPTS */}
        {step === "scripts" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl text-fuchsia-400 font-mono mb-4">4. Revisa y Selecciona los Guiones ({selectedScripts.length} seleccionados)</h2>
            <div className="flex flex-col gap-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
              {generatedScripts.map((script, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleSelection(script, selectedScripts, setSelectedScripts)}
                  className={`p-5 border rounded-lg cursor-pointer whitespace-pre-wrap text-sm ${selectedScripts.includes(script) ? 'bg-fuchsia-900/40 border-fuchsia-500 text-white' : 'bg-black border-zinc-800 text-zinc-300'}`}
                >
                  {script}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSaveAll}
                disabled={loading || selectedScripts.length === 0}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg disabled:opacity-50 shadow-lg shadow-cyan-900/20"
              >
                {loading ? "Guardando..." : "Guardar Activos Seleccionados en Supabase"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DONE */}
        {step === "done" && (
          <div className="animate-in fade-in text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl text-white font-bold mb-2">¡Campaña Guardada Exitosamente!</h2>
            <p className="text-zinc-400 mb-8">Todos los hooks, imágenes y guiones seleccionados ya están listos para pautar.</p>
            <button onClick={() => setStep("select_idea")} className="bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700">
              Crear otra campaña
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
