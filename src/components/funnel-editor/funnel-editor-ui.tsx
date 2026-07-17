import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BusinessNode } from './nodes/business-node';
import { Save, Plus, GitMerge, Settings2, Trash2, Sparkles, X, Loader2 } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { motion, AnimatePresence } from 'framer-motion';

const nodeTypes = {
  businessNode: BusinessNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'businessNode',
    position: { x: 250, y: 50 },
    data: { type: 'event', category: 'Trigger', label: 'Mensaje Entrante de WhatsApp' },
  },
];

const initialEdges: Edge[] = [];

let id = 10;
const getId = () => `dndnode_${id++}`;

function EditorCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI Generation State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { tenantId } = useTenant();

  // Drag & Drop logic
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type: 'businessNode',
        position,
        data: { 
          type, 
          label: `Nuevo ${type}`,
          category: type.toUpperCase()
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const saveFlow = async () => {
    setIsSaving(true);
    try {
      const flow = reactFlowInstance?.toObject();
      await fetch('http://localhost:3000/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({
          name: 'Nuevo Flow',
          trigger: 'ANY',
          steps: flow
        })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:3000/funnels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
      }
      setShowAiModal(false);
      setAiPrompt('');
    } catch (e) {
      console.error('Error generando con IA', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: '#090909' }}>
      
      {/* ─── Nodos Toolbox Sidebar ─── */}
      <aside className="w-64 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-[#4F8CFF]" />
            Automation Studio
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1 mb-4">Diseña procesos de negocio</p>
          
          {/* BOTON CREAR CON IA */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAiModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-medium text-white shadow-lg transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
              boxShadow: '0 4px 20px rgba(168,85,247,0.3)'
            }}
          >
            <Sparkles className="w-4 h-4" />
            Crear con IA
          </motion.button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Eventos</p>
          <DragNode type="event" label="Evento / Trigger" color="#4F8CFF" bg="rgba(79,140,255,0.1)" />
          
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 mt-6">Inteligencia</p>
          <DragNode type="ai" label="Análisis de IA" color="#A855F7" bg="rgba(168,85,247,0.1)" />
          <DragNode type="skill" label="Ejecutar Skill" color="#EC4899" bg="rgba(236,72,153,0.1)" />
          
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 mt-6">Acciones</p>
          <DragNode type="whatsapp" label="Enviar WhatsApp" color="#22C55E" bg="rgba(34,197,94,0.1)" />
          <DragNode type="crm" label="Actualizar CRM" color="#F59E0B" bg="rgba(245,158,11,0.1)" />
          <DragNode type="automation" label="Lógica / Webhook" color="#EAB308" bg="rgba(234,179,8,0.1)" />
          
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 mt-6">Lógica</p>
          <DragNode type="condition" label="Condición IF/ELSE" color="#64748B" bg="rgba(100,116,139,0.1)" />
        </div>
      </aside>

      {/* ─── Canvas React Flow ─── */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={saveFlow}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: '#4F8CFF', boxShadow: '0 4px 14px rgba(79,140,255,0.3)' }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Flujo
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="dark"
          minZoom={0.2}
        >
          <Background color="rgba(255,255,255,0.05)" gap={16} size={1} />
          <Controls 
            style={{ 
              background: '#181818', 
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              overflow: 'hidden'
            }} 
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      {/* ─── AI Modal ─── */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isGenerating && setShowAiModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-[24px] overflow-hidden"
              style={{
                background: '#181818',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(168,85,247,0.1)'
              }}
            >
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Generador IA</h3>
                    <p className="text-xs text-[#9CA3AF]">Describe el proceso de negocio</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAiModal(false)} 
                  disabled={isGenerating}
                  className="p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Cuando un cliente pregunte por 'precios', quiero analizar su intención. Si está muy interesado, envíale el catálogo PDF. Si no, actualiza el CRM."
                  className="w-full h-32 bg-[#111111] text-sm text-white placeholder:text-[#9CA3AF] resize-none outline-none p-4 rounded-[16px] focus:ring-1 focus:ring-purple-500/50 transition-shadow"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  disabled={isGenerating}
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={generateWithAi}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)' }}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? 'Generando embudo...' : 'Generar Embudo'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function DragNode({ type, label, color, bg }: { type: string, label: string, color: string, bg: string }) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      onDragStart={onDragStart}
      draggable
      className="flex items-center gap-3 p-3 rounded-[12px] cursor-grab active:cursor-grabbing hover:bg-white/5 border transition-colors"
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      <span className="text-xs text-[#9CA3AF] font-medium">{label}</span>
    </div>
  );
}

export function FunnelEditorUI() {
  return (
    <div className="h-[calc(100vh-80px)] w-full rounded-[20px] overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <ReactFlowProvider>
        <EditorCanvas />
      </ReactFlowProvider>
    </div>
  );
}
