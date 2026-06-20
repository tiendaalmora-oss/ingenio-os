"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Save, Trash2, HelpCircle, Activity } from "lucide-react";

interface Pattern {
  id: string;
  niche: string;
  adText: string;
  primaryPain: string;
  secondaryPain: string;
  promise: string;
  emotion: string;
  awarenessLevel: string;
  winnerScore: number;
  notes: string;
  createdAt: string;
}

export function WinningPatternsModule() {
  const [niche, setNiche] = useState("");
  const [adText, setAdText] = useState("");
  const [notes, setNotes] = useState("");
  const [winnerScore, setWinnerScore] = useState(80);
  const [analyzing, setAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("ingenio_os_winning_patterns");
    if (saved) {
      try {
        setPatterns(JSON.parse(saved));
      } catch (e) {
        console.error("Error al cargar patrones:", e);
      }
    }
  }, []);

  const saveToLocalStorage = (newPatterns: Pattern[]) => {
    localStorage.setItem("ingenio_os_winning_patterns", JSON.stringify(newPatterns));
    setPatterns(newPatterns);
  };

  const handleAnalyze = async () => {
    if (!adText.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/ai/analyze-pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adText }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.pattern);
      } else {
        alert("Error en el análisis de IA: " + data.error);
      }
    } catch (e: any) {
      alert("Error de red: " + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!niche.trim() || !adText.trim() || !analysisResult) {
      alert("Por favor completa el nicho, el texto y realiza el análisis de IA antes de guardar.");
      return;
    }

    const newPattern: Pattern = {
      id: `pattern_${Date.now()}`,
      niche,
      adText,
      primaryPain: analysisResult.primary_pain,
      secondaryPain: analysisResult.secondary_pain || "Ninguno",
      promise: analysisResult.promise,
      emotion: analysisResult.emotion,
      awarenessLevel: analysisResult.awareness_level,
      winnerScore,
      notes,
      createdAt: new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [newPattern, ...patterns];
    saveToLocalStorage(updated);

    // Limpiar formulario
    setNiche("");
    setAdText("");
    setNotes("");
    setWinnerScore(80);
    setAnalysisResult(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Seguro de eliminar este patrón de la base local?")) {
      const filtered = patterns.filter((p) => p.id !== id);
      saveToLocalStorage(filtered);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-zinc-100 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Brain className="text-purple-400 w-7 h-7" /> Winning Patterns Engine
          </h2>
          <p className="text-zinc-400 text-sm">
            Ecosistema de análisis y almacenamiento de anuncios de validación comercial ganadores.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-zinc-400">
            Total Patrones: {patterns.length}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Formulario de Análisis (Lado Izquierdo) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 h-fit shadow-xl">
          <h3 className="text-base font-bold text-zinc-300 flex items-center gap-2 border-b border-zinc-800 pb-3">
            📥 Analizar Nuevo Anuncio
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Nicho / Producto Validado
              </label>
              <input
                type="text"
                placeholder="Ej: Verdulería (VerdePro) o Carnicería (CarniGestión)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Texto del Anuncio (Ad Copy)
              </label>
              <textarea
                placeholder="Pega el copy publicitario completo aquí..."
                value={adText}
                onChange={(e) => setAdText(e.target.value)}
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition-colors resize-none font-mono text-zinc-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Winner Score (1 - 100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={winnerScore}
                  onChange={(e) => setWinnerScore(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Notas de Rendimiento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Generó 40 ventas en el lanzamiento"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {analyzing ? "Analizando..." : <><Sparkles className="w-4 h-4" /> Analizar con IA</>}
            </button>

            {analysisResult && (
              <button
                onClick={handleSave}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" /> Guardar Patrón
              </button>
            )}
          </div>
        </div>

        {/* Resultados del Análisis IA (Lado Derecho) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 h-full shadow-xl">
          <h3 className="text-base font-bold text-zinc-300 flex items-center gap-2 border-b border-zinc-800 pb-3">
            🧠 Resultados de Extracción de Patrón
          </h3>

          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
              <div className="w-8 h-8 rounded-full border-4 border-t-purple-500 border-zinc-800 animate-spin"></div>
              <span className="text-sm">Analizando copy con OpenRouter...</span>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Dolor Principal</span>
                <p className="text-sm text-zinc-100 font-semibold">{analysisResult.primary_pain}</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Dolor Secundario</span>
                <p className="text-sm text-zinc-100 font-semibold">{analysisResult.secondary_pain || "Ninguno"}</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Promesa de Valor</span>
                <p className="text-sm text-zinc-100 font-semibold">{analysisResult.promise}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Emoción Dominante</span>
                  <p className="text-sm text-purple-400 font-bold">{analysisResult.emotion}</p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nivel de Consciencia</span>
                  <p className="text-sm text-blue-400 font-bold">{analysisResult.awareness_level}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-600 gap-3">
              <HelpCircle className="w-12 h-12 text-zinc-800" />
              <span className="text-sm max-w-xs leading-relaxed">
                Pega el texto de tu anuncio a la izquierda y dale clic a "Analizar con IA" para extraer los dolores y la promesa.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Patrones Guardados */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-zinc-300 border-b border-zinc-800 pb-3">
          📚 Base de Datos de Patrones Ganadores (Local)
        </h3>

        {patterns.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            Aún no has guardado ningún patrón de marketing. Comienza analizando un anuncio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500 bg-zinc-950/40">
                  <th className="p-4 font-medium">Nicho</th>
                  <th className="p-4 font-medium">Dolor Principal</th>
                  <th className="p-4 font-medium">Promesa</th>
                  <th className="p-4 font-medium">Emoción / Consciencia</th>
                  <th className="p-4 font-medium text-center">Score</th>
                  <th className="p-4 font-medium">Notas</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-sm">
                {patterns.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="p-4 font-bold text-purple-400">{p.niche}</td>
                    <td className="p-4 text-zinc-200 max-w-[220px] truncate" title={p.primaryPain}>
                      {p.primaryPain}
                    </td>
                    <td className="p-4 text-zinc-200 max-w-[220px] truncate" title={p.promise}>
                      {p.promise}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded border border-purple-800/40 w-fit">
                          {p.emotion}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/40 w-fit">
                          {p.awarenessLevel}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-black ${
                        p.winnerScore >= 80 ? "text-emerald-400" : p.winnerScore >= 60 ? "text-yellow-400" : "text-rose-400"
                      }`}>
                        {p.winnerScore}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 max-w-[150px] truncate" title={p.notes}>{p.notes || "—"}</td>
                    <td className="p-4 text-zinc-500 text-xs font-mono">{p.createdAt}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
