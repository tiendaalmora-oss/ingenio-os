"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Users, Building2, BookOpen,
  BrainCircuit, Puzzle, Bot, GitMerge, Zap, BarChart3,
  Plug, ShoppingBag, Settings, ChevronRight, Sparkles, Send, X
} from 'lucide-react';
import { BusinessStudioUI } from './business-studio-ui';
import { ConversationHubUI } from './conversation-hub-ui';
import { CrmUI } from './crm-ui';
import { MemoryCenterUI } from './memory-center-ui';

const NAV = [
  { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard },
  { id: 'conversations', label: 'Conversation Hub', icon: MessageSquare },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'studio', label: 'Business Studio', icon: Building2 },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'memory', label: 'Memory', icon: BrainCircuit },
  { id: 'skills', label: 'Skills', icon: Puzzle },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'funnels', label: 'Funnels', icon: GitMerge },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function MissionControlUI() {
  const [active, setActive] = useState('dashboard');
  const [hermesOpen, setHermesOpen] = useState(false);
  const [hermesInput, setHermesInput] = useState('');

  const handleHermesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hermesInput.trim()) return;
    // Future: emit to backend AI command processor
    setHermesInput('');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#090909' }}>

      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside
        className="flex flex-col w-[220px] flex-shrink-0 h-full border-r py-6"
        style={{
          background: '#111111',
          borderColor: 'rgba(255,255,255,0.06)'
        }}
      >
        {/* Brand */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F8CFF 0%, #6d58ff 100%)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Ingenio OS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-sm transition-all duration-150
                  ${isActive
                    ? 'text-white sidebar-active'
                    : 'text-[#9CA3AF] hover:text-white'
                  }
                `}
                style={{
                  background: isActive ? 'rgba(79,140,255,0.1)' : 'transparent',
                }}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#4F8CFF]' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 ml-auto text-[#4F8CFF] opacity-60" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Hermes mini button */}
        <div className="px-3 pt-4 border-t mt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <motion.button
            onClick={() => setHermesOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-sm text-[#9CA3AF] hover:text-white transition-all duration-150"
            style={{ background: 'rgba(79,140,255,0.07)', border: '1px solid rgba(79,140,255,0.15)' }}
          >
            <Sparkles className="w-4 h-4 text-[#4F8CFF]" />
            <span>Ask Hermes...</span>
          </motion.button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(17,17,17,0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div>
            <h1 className="text-base font-semibold text-white">
              {NAV.find(n => n.id === active)?.label}
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Ingenio AI Platform · FerreOS</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#22C55E]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" />
              </span>
              Sistema operativo
            </div>
          </div>
        </div>

        {/* Page */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {active === 'dashboard' && <DashboardView />}
              {active === 'conversations' && <ConversationHubUI />}
              {active === 'crm' && <CrmUI />}
              {active === 'studio' && <BusinessStudioUI />}
              {active === 'funnels' && <FunnelEditorUI />}
              {active === 'memory' && <MemoryCenterUI />}
              {active !== 'dashboard' && active !== 'conversations' && active !== 'crm' && active !== 'studio' && active !== 'funnels' && active !== 'memory' && (
                <ComingSoon label={NAV.find(n => n.id === active)?.label || ''} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Hermes Floating Panel ────────────────────── */}
      <AnimatePresence>
        {hermesOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setHermesOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-8 right-8 z-50 w-[440px] rounded-[24px] overflow-hidden"
              style={{
                background: '#181818',
                border: '1px solid rgba(79,140,255,0.2)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(79,140,255,0.08)'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F8CFF 0%, #6d58ff 100%)' }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Hermes</div>
                    <div className="text-xs text-[#9CA3AF]">Tu asistente de plataforma</div>
                  </div>
                </div>
                <button onClick={() => setHermesOpen(false)} className="text-[#9CA3AF] hover:text-white transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat area */}
              <div className="px-5 py-5">
                <div className="rounded-[16px] p-4 mb-4 text-sm text-[#9CA3AF]" style={{ background: '#111111' }}>
                  <p className="text-white font-medium mb-2">¿Qué quieres hacer?</p>
                  <p className="text-xs leading-relaxed">Puedo modificar tu Business Studio, crear Funnels, consultar datos de conversaciones o configurar el sistema. Solo dime qué necesitas.</p>
                </div>

                <form onSubmit={handleHermesSubmit} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={hermesInput}
                    onChange={(e) => setHermesInput(e.target.value)}
                    placeholder="Ej: Agrega un nuevo producto..."
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-[#9CA3AF] outline-none"
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      background: '#111111',
                    }}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: '#4F8CFF' }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </form>
              </div>

              {/* Quick actions */}
              <div className="px-5 pb-5 flex flex-wrap gap-2">
                {[
                  'Resumen del día',
                  'Crear embudo',
                  'Agregar producto',
                  'Ver conversaciones',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setHermesInput(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full text-[#9CA3AF] hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { FunnelEditorUI } from './funnel-editor/funnel-editor-ui';

/* ─── Dashboard View ──────────────────────────────────── */
function DashboardView() {
  const [summary, setSummary] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:3000/health/system-status')
        .then(r => r.json())
        .then(data => setSummary(data))
        .catch(e => console.error('Error fetching dashboard data:', e));
    };
    
    // Initial fetch
    fetchData();
    
    // Poll every 5 seconds for real-time updates
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (!summary) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F8CFF] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4F8CFF]" />
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Metrics Grid */}
      <div>
        <p className="text-xs font-semibold text-[#4F8CFF] uppercase tracking-widest mb-4">Métricas Principales</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Widget title="Conversaciones" value={summary.metrics.conversations} icon={MessageSquare} />
          <Widget title="Leads CRM" value={summary.metrics.leads} icon={Users} />
          <Widget title="Knowledge Bundles" value={summary.metrics.knowledgeBundles} icon={BookOpen} />
          <Widget title="Automatizaciones" value={summary.metrics.automations} icon={Zap} />
          <Widget title="Skills Ejecutadas" value={summary.metrics.skillsExecuted} icon={Puzzle} />
        </div>
      </div>

      {/* System Status */}
      <div>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Estado de los Servicios</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {summary.services.map((svc: any, i: number) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-[18px] p-5 card-hover flex flex-col justify-between h-28"
              style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#9CA3AF] tracking-wider">{svc.name}</span>
                {svc.status === 'online' ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-50" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]" />
                  </span>
                ) : (
                  <span className="relative flex h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </div>
              <div>
                <p className="text-white text-base font-medium">{svc.detail}</p>
                {svc.latency && (
                  <p className="text-[#9CA3AF] text-xs mt-1">Latencia: {svc.latency}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[20px] p-5 flex flex-col justify-between"
      style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-5 h-5 text-[#4F8CFF]" />
      </div>
      <div>
        <p className="text-3xl font-light text-white mb-1">{value}</p>
        <p className="text-xs text-[#9CA3AF] uppercase tracking-wider font-medium">{title}</p>
      </div>
    </motion.div>
  );
}

/* ─── Coming Soon placeholder ─────────────────────────── */
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div
        className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-6"
        style={{ background: 'rgba(79,140,255,0.08)', border: '1px solid rgba(79,140,255,0.15)' }}
      >
        <Sparkles className="w-7 h-7 text-[#4F8CFF]" />
      </div>
      <h2 className="text-2xl font-light text-white mb-2">{label}</h2>
      <p className="text-sm text-[#9CA3AF]">Este módulo estará disponible pronto.</p>
    </div>
  );
}
