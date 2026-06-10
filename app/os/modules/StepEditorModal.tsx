"use client";

import React, { useState } from "react";

export function StepEditorModal({ step, onClose, onRefresh }: { step: any, onClose: () => void, onRefresh: () => void }) {
  const [nombre, setNombre] = useState(step.nombre || "");
  const [descripcion, setDescripcion] = useState(step.descripcion || "");
  const [color, setColor] = useState(step.color || "#3b82f6");
  
  // Normalizar los drips
  const initialDrips = step.drips_config && Array.isArray(step.drips_config) && step.drips_config.length > 0
    ? step.drips_config
    : step.followup_template
      ? [{ delay_minutes: step.followup_delay_minutes || 30, template: step.followup_template, condition: step.followup_condition || 'no_reply' }]
      : [];
      
  const [drips, setDrips] = useState<any[]>(initialDrips);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/crm/steps/${step.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          color,
          drips_config: drips
        })
      });
      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        alert("Error al guardar la etapa");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const addDrip = () => {
    setDrips([...drips, { delay_minutes: 60, template: "", condition: "no_reply" }]);
  };

  const removeDrip = (index: number) => {
    setDrips(drips.filter((_, i) => i !== index));
  };

  const updateDrip = (index: number, field: string, value: any) => {
    const newDrips = [...drips];
    newDrips[index][field] = value;
    setDrips(newDrips);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
            Editar Etapa: {step.nombre}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-[42px] p-1 cursor-pointer" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Descripción / Objetivo</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Secuencia de Seguimiento (Drip)</h3>
              <button onClick={addDrip} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-xs font-semibold">
                + Añadir Mensaje
              </button>
            </div>

            <div className="space-y-4">
              {drips.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm py-4 bg-zinc-950 rounded-lg border border-zinc-800 border-dashed">
                  No hay seguimientos programados. El cliente se quedará en esta etapa indefinidamente hasta que responda.
                </div>
              ) : (
                drips.map((drip, index) => (
                  <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 relative">
                    <button onClick={() => removeDrip(index)} className="absolute top-3 right-3 text-red-500 hover:text-red-400 text-xs font-bold">Eliminar</button>
                    
                    <h4 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-widest">Seguimiento #{index + 1}</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-500">Esperar (minutos)</label>
                        <input 
                          type="number" 
                          value={drip.delay_minutes} 
                          onChange={e => updateDrip(index, 'delay_minutes', parseInt(e.target.value) || 0)} 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white" 
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">
                          Ej: 30 = media hora | 1440 = 1 día | 43200 = 1 mes
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-500">Condición</label>
                        <select 
                          value={drip.condition} 
                          onChange={e => updateDrip(index, 'condition', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white"
                        >
                          <option value="no_reply">Si el cliente NO responde</option>
                          <option value="always">Enviar siempre</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-500">Mensaje a enviar</label>
                      <textarea 
                        value={drip.template} 
                        onChange={e => updateDrip(index, 'template', e.target.value)}
                        placeholder="Ej: Hola {nombre}, ¿pudiste revisar lo que te pasé?"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-white min-h-[80px]" 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white font-semibold text-sm">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
