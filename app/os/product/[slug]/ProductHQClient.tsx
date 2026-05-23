"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { updateNotes, addDecision, toggleTask, addTask, updateStatus } from "./actions";

export default function ProductHQClient({ slug, initialData }: { slug: string, initialData: any }) {
  const { product, notes: initialNotes, links, decisions, tasks } = initialData;
  const [notes, setNotes] = useState(initialNotes);
  const [newDecision, setNewDecision] = useState("");
  const [newTask, setNewTask] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Autosave notes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== initialNotes) {
        setSavingNotes(true);
        updateNotes(slug, notes).then(() => setSavingNotes(false));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, initialNotes, slug]);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.trim()) return;
    await addDecision(slug, newDecision);
    setNewDecision("");
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await addTask(slug, newTask);
    setNewTask("");
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateStatus(slug, e.target.value);
  };

  // Redirect to main OS dashboard when clicking a sidebar module
  const handleSidebarSelect = (mod: string) => {
    window.location.href = `/?module=${mod}`;
  };

  return (
    <main className="bg-zinc-950 text-white min-h-screen flex overflow-hidden">
      <Sidebar activeModule={"product_factory"} onSelect={handleSidebarSelect} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <TopBar title={`Product HQ: ${product.name}`} />

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-zinc-800">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-zinc-500 text-sm mt-1">Nicho: {product.niche || "No definido"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Estado:</span>
              <select 
                defaultValue={product.status} 
                onChange={handleStatusChange}
                className="bg-zinc-900 border border-zinc-800 text-white rounded-md px-3 py-1.5 text-sm outline-none focus:border-cyan-500"
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

          <div className="grid grid-cols-3 gap-6">
            
            {/* Left Column: Notes & Metrics */}
            <div className="col-span-2 space-y-6">
              
              {/* Notas Operativas */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <span>📝</span> Notas Operativas
                  </h2>
                  <span className={`text-xs ${savingNotes ? 'text-yellow-500' : 'text-green-500'}`}>
                    {savingNotes ? 'Guardando...' : 'Guardado ✓'}
                  </span>
                </div>
                <textarea 
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-sm min-h-[200px] text-zinc-300 focus:outline-none focus:border-zinc-600 resize-y"
                  placeholder="Escribe aprendizajes, hipótesis, resultados de hooks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Metrics Mock */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <span>📊</span> Métricas (Mock)
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "CTR", value: "3.2%" },
                    { label: "CPC", value: "$0.15" },
                    { label: "CPA", value: "$4.50" },
                    { label: "ROAS", value: "2.1x" }
                  ].map((m, i) => (
                    <div key={i} className="bg-black/50 border border-zinc-800 rounded-lg p-3 text-center">
                      <div className="text-xs text-zinc-500">{m.label}</div>
                      <div className="text-xl font-bold text-white mt-1">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Decisions, Tasks, Links */}
            <div className="space-y-6">

              {/* Checklist */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <span>✅</span> Checklist Operacional
                </h2>
                <div className="space-y-2 mb-4">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        defaultChecked={task.completed} 
                        onChange={(e) => toggleTask(task.id, e.target.checked, slug)}
                        className="rounded border-zinc-700 text-cyan-500 bg-zinc-900"
                      />
                      <span className={`text-sm ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleTaskSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Nueva tarea..." 
                    className="flex-1 bg-black/50 border border-zinc-800 rounded text-sm px-3 py-1.5 focus:outline-none focus:border-zinc-600"
                  />
                  <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-sm transition-colors">
                    +
                  </button>
                </form>
              </div>

              {/* Decision Log */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <span>🧠</span> Decision Log
                </h2>
                <form onSubmit={handleDecisionSubmit} className="mb-4 flex gap-2">
                  <input 
                    type="text" 
                    value={newDecision}
                    onChange={(e) => setNewDecision(e.target.value)}
                    placeholder="Registrar decisión..." 
                    className="flex-1 bg-black/50 border border-zinc-800 rounded text-sm px-3 py-1.5 focus:outline-none focus:border-zinc-600"
                  />
                  <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-sm transition-colors">
                    +
                  </button>
                </form>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {decisions.map((dec: any) => (
                    <div key={dec.id} className="text-sm bg-black/40 border border-zinc-800/50 p-2 rounded">
                      <div className="text-zinc-300">{dec.decision}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">
                        {new Date(dec.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {decisions.length === 0 && (
                    <p className="text-zinc-600 text-xs italic">Aún no hay decisiones registradas.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
