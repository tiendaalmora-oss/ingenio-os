"use client";

import React, { useState } from "react";

type Step = 
  | "niche" 
  | "pain_points" 
  | "offer" 
  | "promise" 
  | "hooks" 
  | "whatsapp" 
  | "landing" 
  | "ad_script" 
  | "summary";

export function OfferGeneratorModule() {
  const [currentStep, setCurrentStep] = useState<Step>("niche");
  const [loading, setLoading] = useState(false);
  
  // State for the hypothesis
  const [niche, setNiche] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [offer, setOffer] = useState("");
  const [promise, setPromise] = useState("");
  const [hooks, setHooks] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [landing, setLanding] = useState("");
  const [adScript, setAdScript] = useState("");

  const handleGenerate = async (targetStep: Step, promptType: string, context: any, setter: (val: string) => void) => {
    setLoading(true);
    try {
      // Assuming an API route exists for AI generation. For now, we simulate or call a generic AI endpoint.
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptType, context })
      });
      const data = await res.json();
      if (data.text) {
        setter(data.text);
      } else {
        setter("Error al generar el contenido. Verifica la API.");
      }
    } catch (err) {
      console.error(err);
      setter("Error de red al conectar con OpenRouter.");
    }
    setLoading(false);
    setCurrentStep(targetStep);
  };

  const handleSaveToSupabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: niche,
          niche: niche,
          notes: `Promesa: ${promise}\n\nHooks:\n${hooks}\n\nGuion:\n${adScript}`,
          pain_points: painPoints.split(',').map(p => p.trim()),
          competitors: [],
          status: "idea"
        })
      });
      
      const data = await res.json();
      if (!data.success) {
        alert("Error al guardar la idea: " + (data.error || "Desconocido"));
      } else {
        alert("¡Idea guardada exitosamente en Operaciones!");
        setCurrentStep("summary");
      }
    } catch (err) {
      console.error(err);
      alert("Error al intentar guardar la idea en la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generador de Ofertas (PVE)</h1>
        <p className="text-zinc-400">Motor de Validación Rápida. Define un nicho y deja que la IA construya el Go-to-Market.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        
        {/* STEP 1: NICHE */}
        {currentStep === "niche" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">1. Define el Nicho</h2>
            <input 
              type="text" 
              className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:border-green-500 outline-none mb-4"
              placeholder="Ej: Mecánicos, Peluquerías, Ferreterías..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
            <button 
              onClick={() => handleGenerate("pain_points", "pain_points", { niche }, setPainPoints)}
              disabled={!niche || loading}
              className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              {loading ? "Pensando..." : "Generar Dolores (Pain Points)"}
            </button>
          </div>
        )}

        {/* STEP 2: PAIN POINTS */}
        {currentStep === "pain_points" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">2. Dolores (Pain Points)</h2>
            <textarea 
              className="w-full h-40 bg-black border border-zinc-700 rounded-lg p-4 text-white focus:border-green-500 outline-none mb-4"
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("niche")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={() => handleGenerate("offer", "offer", { niche, painPoints }, setOffer)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg flex-1 disabled:opacity-50"
              >
                {loading ? "Generando Oferta..." : "Generar Oferta Irresistible"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OFFER */}
        {currentStep === "offer" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">3. Oferta Irresistible</h2>
            <textarea 
              className="w-full h-32 bg-black border border-zinc-700 rounded-lg p-4 text-white focus:border-green-500 outline-none mb-4"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("pain_points")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={() => handleGenerate("promise", "promise", { offer }, setPromise)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg flex-1 disabled:opacity-50"
              >
                {loading ? "Generando..." : "Generar Promesas"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROMISE */}
        {currentStep === "promise" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">4. Promesas Secundarias</h2>
            <textarea 
              className="w-full h-32 bg-black border border-zinc-700 rounded-lg p-4 text-white mb-4"
              value={promise}
              onChange={(e) => setPromise(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("offer")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={() => handleGenerate("hooks", "hooks", { niche, offer }, setHooks)}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg flex-1"
              >
                Generar Hooks de Anuncios
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: HOOKS */}
        {currentStep === "hooks" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">5. Hooks (Ángulos)</h2>
            <textarea 
              className="w-full h-32 bg-black border border-zinc-700 rounded-lg p-4 text-white mb-4"
              value={hooks}
              onChange={(e) => setHooks(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("promise")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={() => handleGenerate("whatsapp", "whatsapp", { offer }, setWhatsapp)}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg flex-1"
              >
                Generar Mensaje WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: WHATSAPP */}
        {currentStep === "whatsapp" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">6. Mensaje Apertura WA (Gatekeeper)</h2>
            <textarea 
              className="w-full h-32 bg-black border border-zinc-700 rounded-lg p-4 text-white mb-4"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("hooks")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={() => handleGenerate("landing", "landing", { niche, painPoints, offer }, setLanding)}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg flex-1"
              >
                Generar Estructura Landing
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: LANDING */}
        {currentStep === "landing" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">7. Landing Page Copy</h2>
            <textarea 
              className="w-full h-48 bg-black border border-zinc-700 rounded-lg p-4 text-white mb-4"
              value={landing}
              onChange={(e) => setLanding(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("whatsapp")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={() => handleGenerate("ad_script", "ad_script", { hooks, offer }, setAdScript)}
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg flex-1"
              >
                Generar Guión de Anuncio
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: AD SCRIPT & SAVE */}
        {currentStep === "ad_script" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-green-400 font-mono mb-4">8. Guión del Anuncio (VSL)</h2>
            <textarea 
              className="w-full h-48 bg-black border border-zinc-700 rounded-lg p-4 text-white mb-4"
              value={adScript}
              onChange={(e) => setAdScript(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep("landing")} className="text-zinc-400 hover:text-white px-4">Atrás</button>
              <button 
                onClick={handleSaveToSupabase}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg flex-1 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Hipótesis en Base de Datos"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
