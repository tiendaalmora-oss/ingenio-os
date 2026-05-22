"use client";

import React, { useEffect, useState } from "react";

export type IdeaStatus = "idea" | "researching" | "validating" | "building" | "launched" | "scaling" | "paused";

interface Idea {
  id: string;
  title: string;
  niche: string;
  notes: string;
  pain_points: string[];
  competitors: string[];
  status: IdeaStatus;
  created_at: string;
}

const STATUS_COLUMNS: { id: IdeaStatus; label: string; color: string }[] = [
  { id: "idea", label: "Idea", color: "bg-zinc-800" },
  { id: "researching", label: "Investigación", color: "bg-blue-900/30 text-blue-400 border border-blue-900/50" },
  { id: "validating", label: "Validación", color: "bg-yellow-900/30 text-yellow-400 border border-yellow-900/50" },
  { id: "building", label: "Construcción", color: "bg-orange-900/30 text-orange-400 border border-orange-900/50" },
  { id: "launched", label: "Lanzado", color: "bg-green-900/30 text-green-400 border border-green-900/50" },
  { id: "scaling", label: "Escalando", color: "bg-cyan-900/30 text-cyan-400 border border-cyan-900/50" },
];

export function OperationsModule() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNiche, setNewNiche] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPainPoints, setNewPainPoints] = useState("");
  const [newCompetitors, setNewCompetitors] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch Ideas
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ideas");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al cargar ideas");
      setIdeas(data.ideas || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: IdeaStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    // Optimistic Update
    const previousIdeas = [...ideas];
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, status: targetStatus } : idea))
    );

    try {
      const res = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: targetStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      setError("No se pudo guardar el cambio en el servidor. Revirtiendo...");
      setIdeas(previousIdeas);
    }
  };

  // Create Idea
  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNiche.trim()) return;

    try {
      setSaving(true);
      const painPointsArray = newPainPoints
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      const competitorsArray = newCompetitors
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          niche: newNiche,
          notes: newNotes,
          pain_points: painPointsArray,
          competitors: competitorsArray,
          status: "idea",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Append new idea to list
      setIdeas((prev) => [...prev, data.idea]);
      setIsModalOpen(false);

      // Reset form
      setNewTitle("");
      setNewNiche("");
      setNewNotes("");
      setNewPainPoints("");
      setNewCompetitors("");
    } catch (err: any) {
      alert("Error al crear idea: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-73px)] overflow-x-auto animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold mb-2">Pipeline de Ideas</h2>
          <p className="text-zinc-400">Seguimiento y gestión de oportunidades de productos desde la idea hasta el escalado.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          + Nueva Idea
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg mb-6 flex-shrink-0 flex justify-between items-center text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline hover:text-white">Cerrar</button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          <div className="flex flex-col items-center gap-2">
            <span className="w-8 h-8 border-2 border-zinc-700 border-t-green-400 rounded-full animate-spin"></span>
            <span>Cargando ideas de la base de datos...</span>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 pb-8 min-w-max flex-1 overflow-hidden h-full">
          {STATUS_COLUMNS.map((col) => {
            const columnIdeas = ideas.filter((i) => i.status === col.id);
            return (
              <div
                key={col.id}
                className="w-80 flex flex-col h-full overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-4 px-1 flex-shrink-0">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color.split(" ")[0]}`}></span>
                    {col.label}
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {columnIdeas.length}
                  </span>
                </div>

                <div className="bg-zinc-900/40 rounded-xl p-3 flex-1 overflow-y-auto border border-zinc-800/50 flex flex-col gap-3 min-h-[300px]">
                  {columnIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idea.id)}
                      className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors cursor-grab active:cursor-grabbing group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white group-hover:text-green-400 transition-colors truncate pr-4">
                          {idea.title}
                        </h4>
                      </div>
                      <div className="text-xs text-zinc-400 mb-3 bg-zinc-950 inline-block px-2 py-0.5 rounded border border-zinc-850">
                        Nicho: {idea.niche}
                      </div>
                      {idea.notes && (
                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                          {idea.notes}
                        </p>
                      )}

                      <div className="space-y-1.5 pt-2 border-t border-zinc-800/50 text-[11px] text-zinc-500">
                        {idea.pain_points && idea.pain_points.length > 0 && (
                          <div className="truncate">
                            <span className="text-zinc-600 font-medium">Dolores:</span> {idea.pain_points.join(", ")}
                          </div>
                        )}
                        {idea.competitors && idea.competitors.length > 0 && (
                          <div className="truncate">
                            <span className="text-zinc-600 font-medium">Rivales:</span> {idea.competitors.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnIdeas.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-zinc-650 text-xs italic border border-dashed border-zinc-800/80 rounded-lg min-h-[120px] select-none">
                      Arrastrar aquí
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Nueva Idea */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💡</span> Crear Nueva Idea de SaaS
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Título del SaaS *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Panadería OS o VetPro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Nicho / Mercado *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Veterinarias, Panaderías, Gimnasios"
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Notas / Descripción</label>
                <textarea
                  placeholder="¿Cuál es la idea central del producto y su propuesta de valor?"
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Puntos de Dolor (separados por coma)</label>
                <input
                  type="text"
                  placeholder="ej. Control de stock, Turnos lentos, Cobranza"
                  value={newPainPoints}
                  onChange={(e) => setNewPainPoints(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Competidores (separados por coma)</label>
                <input
                  type="text"
                  placeholder="ej. Excel, Cuaderno, Software X"
                  value={newCompetitors}
                  onChange={(e) => setNewCompetitors(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-850 text-zinc-300 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-white text-black font-bold py-2 rounded-lg text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Crear Idea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
