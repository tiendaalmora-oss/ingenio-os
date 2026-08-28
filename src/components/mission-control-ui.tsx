"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Users, Building2, BookOpen,
  BrainCircuit, Puzzle, Bot, GitMerge, Zap, BarChart3,
  Plug, ShoppingBag, Settings, ChevronRight, Sparkles, Send, X,
  Sun, Moon, Focus, ShieldAlert, Target, Activity, CheckCircle2,
  TrendingUp, Code, Megaphone
} from 'lucide-react';
import { BusinessStudioUI } from './business-studio-ui';
import { ConversationHubUI } from './conversation-hub-ui';
import { CrmUI } from './crm-ui';
import { MemoryCenterUI } from './memory-center-ui';
import { FunnelEditorUI } from './funnel-editor/funnel-editor-ui';
import { MorningBriefingModal } from './morning-briefing-modal';
import { EveningShutdownModal } from './evening-shutdown-modal';
import { SkillsIntegrationsUI } from './skills-integrations-ui';
import { CommandPalette } from './command-palette';

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
  
  // Executive State & Rituals
  const [cognitiveMode, setCognitiveMode] = useState<'CEO' | 'CTO' | 'CMO'>('CEO');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [morningModalOpen, setMorningModalOpen] = useState(false);
  const [eveningModalOpen, setEveningModalOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Estoy monitoreando tus métricas y el Executive Loop. ¿Deseas ejecutar una acción de la Queue, iniciar un ritual o calibrar el Executive DNA?'
    }
  ]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleHermesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hermesInput.trim() || isLoadingAi) return;

    const userMsg = hermesInput.trim();
    setHermesInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/hermes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          workspaceId: 'default-workspace',
          cognitiveMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        
        if (data.suggestedAction) {
          if (data.suggestedAction.type === 'FOCUS_MODE') {
            setTimeout(() => setIsFocusMode(true), 1000);
          } else if (data.suggestedAction.type === 'EVENING_SHUTDOWN') {
            setTimeout(() => setEveningModalOpen(true), 1000);
          }
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Estado del sistema nominal. Modo resiliente activo.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Conexión local del Executive Engine activa.' }]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Focus Mode View
  if (isFocusMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#090909] text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent opacity-40 pointer-events-none" />
        <div className="max-w-xl text-center space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Focus className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-semibold">
              Deep Work • Focus Mode Activo
            </span>
            <h1 className="text-4xl font-light tracking-tight mt-2">
              Misión: <strong className="font-semibold text-white">Ajustar Presupuesto de Ads Q3</strong>
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-2 max-w-md mx-auto">
              Todas las notificaciones y distracciones están silenciadas por Hermes. Concéntrate en la única acción crítica.
            </p>
          </div>
          <div className="text-7xl font-mono py-4 text-white tracking-tight">01:45:00</div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFocusMode(false)}
            className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium transition-all"
          >
            Terminar Sesión de Deep Work
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#090909' }}>

      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside
        className="flex flex-col w-[230px] flex-shrink-0 h-full border-r py-5"
        style={{
          background: '#111111',
          borderColor: 'rgba(255,255,255,0.06)'
        }}
      >
        {/* Brand */}
        <div className="px-5 mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20"
              style={{ background: 'linear-gradient(135deg, #4F8CFF 0%, #6d58ff 100%)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-none">Hermes OS</span>
              <span className="text-[10px] font-mono text-[#9CA3AF] tracking-wider uppercase">Executive Edition</span>
            </div>
          </div>
        </div>

        {/* Cognitive Mode Selector */}
        <div className="px-3 mb-4">
          <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex gap-1">
            <button
              onClick={() => setCognitiveMode('CEO')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                cognitiveMode === 'CEO' ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              CEO
            </button>
            <button
              onClick={() => setCognitiveMode('CTO')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                cognitiveMode === 'CTO' ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              CTO
            </button>
            <button
              onClick={() => setCognitiveMode('CMO')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                cognitiveMode === 'CMO' ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Megaphone className="w-3 h-3" />
              CMO
            </button>
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
                  w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-xs transition-all duration-150
                  ${isActive
                    ? 'text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                  }
                `}
                style={{
                  background: isActive ? 'rgba(79,140,255,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(79,140,255,0.25)' : '1px solid transparent'
                }}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#4F8CFF]' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 ml-auto text-[#4F8CFF] opacity-60" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Executive Focus Trigger in Sidebar */}
        <div className="px-3 pt-3 border-t space-y-2 mt-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <motion.button
            onClick={() => setIsFocusMode(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs text-amber-400 font-medium transition-all"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <Focus className="w-3.5 h-3.5 text-amber-400" />
              <span>Focus Mode</span>
            </div>
            <span className="text-[10px] font-mono opacity-75">1h 45m</span>
          </motion.button>

          {/* Ask Hermes button */}
          <motion.button
            onClick={() => setHermesOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs text-[#9CA3AF] hover:text-white transition-all duration-150"
            style={{ background: 'rgba(79,140,255,0.07)', border: '1px solid rgba(79,140,255,0.15)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4F8CFF]" />
            <span>Consultar a Hermes...</span>
          </motion.button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-3.5 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-white">
                  {NAV.find(n => n.id === active)?.label}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {cognitiveMode} MODE
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Hermes Executive Engine · Workspace Principal</p>
            </div>
          </div>

          {/* Rituals Executive Quick Bar */}
          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMorningModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/15 transition-all"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Morning Brief</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEveningModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/15 transition-all"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Evening Shutdown</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 border border-white/10 text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-all"
            >
              <span>⌘K / Ctrl+K</span>
            </motion.button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-1.5 text-xs text-[#22C55E] bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" />
              </span>
              Engine Nominal
            </div>
          </div>
        </div>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {active === 'dashboard' && (
                <ExecutiveDashboardView
                  onOpenMorning={() => setMorningModalOpen(true)}
                  onOpenEvening={() => setEveningModalOpen(true)}
                  onOpenFocus={() => setIsFocusMode(true)}
                  cognitiveMode={cognitiveMode}
                />
              )}
              {active === 'conversations' && <ConversationHubUI />}
              {active === 'crm' && <CrmUI />}
              {active === 'studio' && <BusinessStudioUI />}
              {active === 'funnels' && <FunnelEditorUI />}
              {active === 'memory' && <MemoryCenterUI />}
              {(active === 'skills' || active === 'integrations') && <SkillsIntegrationsUI />}
              {active !== 'dashboard' && active !== 'conversations' && active !== 'crm' && active !== 'studio' && active !== 'funnels' && active !== 'memory' && active !== 'skills' && active !== 'integrations' && (
                <ComingSoon label={NAV.find(n => n.id === active)?.label || ''} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Command Palette (Ctrl + K) ─────────────────── */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectNav={(navId) => setActive(navId)}
        onOpenMorning={() => setMorningModalOpen(true)}
        onOpenEvening={() => setEveningModalOpen(true)}
        onOpenFocus={() => setIsFocusMode(true)}
        onOpenHermes={() => setHermesOpen(true)}
        onChangeMode={(mode) => setCognitiveMode(mode)}
      />

      {/* ─── Modales de Rituales Ejecutivos ─────────────── */}
      <MorningBriefingModal
        isOpen={morningModalOpen}
        onClose={() => setMorningModalOpen(false)}
        workspaceId="default-workspace"
        userName="Emprendedor"
        topQueue={[
          { id: '1', title: 'Ajustar Presupuesto de Ads Q3', expectedImpact: 85, reason: 'Desviación del CAC detectada (+42%)' },
          { id: '2', title: 'Aprobar Contratación Lead Developer', expectedImpact: 70, reason: 'Bloqueo técnico para lanzamiento' },
          { id: '3', title: 'Cierre Comercial Cliente Tier 1', expectedImpact: 65, reason: 'Acelerador de meta mensual' }
        ]}
        mainDna="El flujo de caja y la conversión son la prioridad absoluta en la fase actual."
      />

      <EveningShutdownModal
        isOpen={eveningModalOpen}
        onClose={() => setEveningModalOpen(false)}
        workspaceId="default-workspace"
        impactScore={85}
        completedActionsCount={4}
        pendingActionsCount={2}
      />

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
                    <div className="text-sm font-semibold text-white">Hermes Chief of Staff</div>
                    <div className="text-xs text-[#9CA3AF]">Inteligencia Ejecutiva Proactiva</div>
                  </div>
                </div>
                <button onClick={() => setHermesOpen(false)} className="text-[#9CA3AF] hover:text-white transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat area */}
              <div className="px-5 py-4 flex flex-col max-h-[380px]">
                <div className="space-y-3 overflow-y-auto pr-1 mb-4 flex-1 max-h-[260px]">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-[16px] text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#4F8CFF]/15 border border-[#4F8CFF]/25 text-white ml-6 text-right'
                          : 'bg-[#111111] border border-white/5 text-[#D1D5DB] mr-4'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <span className="text-[10px] font-mono text-[#4F8CFF] block mb-1 font-semibold uppercase">
                          Hermes Chief of Staff
                        </span>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  ))}

                  {isLoadingAi && (
                    <div className="bg-[#111111] border border-white/5 p-3 rounded-[16px] mr-4 text-xs text-[#9CA3AF] flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F8CFF] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F8CFF]" />
                      </span>
                      <span>Consultando Executive DNA y telemetría...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleHermesSubmit} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={hermesInput}
                    onChange={(e) => setHermesInput(e.target.value)}
                    placeholder="Instrucción ejecutiva..."
                    disabled={isLoadingAi}
                    autoFocus
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-[#9CA3AF] outline-none"
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      background: '#111111',
                    }}
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoadingAi || !hermesInput.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
                    style={{ background: '#4F8CFF' }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </form>
              </div>

              {/* Quick actions */}
              <div className="px-5 pb-5 flex flex-wrap gap-2">
                {[
                  '☀️ Iniciar Morning Brief',
                  '🌙 Cierre de jornada',
                  '🎯 Activar Focus Mode',
                  '📊 Ver Executive Health',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      if (suggestion.includes('Morning')) setMorningModalOpen(true);
                      else if (suggestion.includes('Cierre')) setEveningModalOpen(true);
                      else if (suggestion.includes('Focus')) setIsFocusMode(true);
                      else setHermesInput(suggestion);
                    }}
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

/* ─── Executive Dashboard View ────────────────────────── */
function ExecutiveDashboardView({
  onOpenMorning,
  onOpenEvening,
  onOpenFocus,
  cognitiveMode
}: {
  onOpenMorning: () => void;
  onOpenEvening: () => void;
  onOpenFocus: () => void;
  cognitiveMode: string;
}) {
  const [hasApprovalPending, setHasApprovalPending] = useState(true);

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* 1. Hero Ejecutivo & Rituals Banner */}
      <div
        className="p-6 rounded-[22px] border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(79,140,255,0.08) 0%, rgba(109,88,255,0.04) 100%)',
          borderColor: 'rgba(79,140,255,0.2)'
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#4F8CFF] font-semibold bg-[#4F8CFF]/10 px-2 py-0.5 rounded-md border border-[#4F8CFF]/20">
              Misión Activa ({cognitiveMode})
            </span>
          </div>
          <h2 className="text-2xl font-light text-white">
            Construir la plataforma líder para PyMEs • <span className="font-semibold text-[#4F8CFF]">Q3 Scale</span>
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-xl">
            Prioridad del día: <strong>Ajustar Presupuesto de Ads Q3</strong> para estabilizar el CAC antes del lanzamiento de FerreOS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenMorning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sun className="w-4 h-4" />
            <span>Morning Brief</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenEvening}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Moon className="w-4 h-4" />
            <span>Evening Shutdown</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Human Approval Layer Alert (Critical Action Intercepted) */}
      {hasApprovalPending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[18px] border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-400">Requiere Aprobación Humana</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">CRÍTICO</span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                El agente <strong>Executive Loop</strong> solicita ejecutar <strong>send_email</strong> hacia <em>equipo@hermes.os</em> (Alerta de desviación CAC).
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setHasApprovalPending(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              Denegar
            </button>
            <button
              onClick={() => setHasApprovalPending(false)}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
            >
              Autorizar Acción
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. Executive Health Grid */}
      <div>
        <p className="text-xs font-semibold text-[#4F8CFF] uppercase tracking-widest mb-3">Executive Health • Pulso de la Empresa</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {[
            { category: 'Ventas', status: 'WARNING', value: '-15% MRR', color: '#EAB308' },
            { category: 'Caja', status: 'HEALTHY', value: '8 meses runway', color: '#22C55E' },
            { category: 'Marketing', status: 'CRITICAL', value: 'CAC alto (+42%)', color: '#EF4444' },
            { category: 'Producto', status: 'HEALTHY', value: 'FerreOS al 82%', color: '#22C55E' },
            { category: 'Riesgos', status: 'HEALTHY', value: '0 bloqueos', color: '#22C55E' },
          ].map((h, i) => (
            <div
              key={h.category}
              className="rounded-[18px] p-4 flex flex-col justify-between"
              style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">{h.category}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: h.color }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{h.value}</p>
                <span
                  className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded mt-1"
                  style={{ background: `${h.color}15`, color: h.color }}
                >
                  {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Executive Queue (Priorizada por Impact Score) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white uppercase tracking-widest">
              Executive Queue • Acciones por Impacto
            </p>
            <span className="text-[10px] font-mono text-[#9CA3AF]">Ordenado por Impacto</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: '1',
                title: 'Ajustar Presupuesto de Ads Q3',
                impact: 85,
                reason: 'Desviación de CAC en 42%. Flujo de caja es prioridad #1 (DNA).'
              },
              {
                id: '2',
                title: 'Aprobar Contratación Lead Developer',
                impact: 70,
                reason: 'Bloqueo técnico para el lanzamiento de la nueva versión de producto.'
              },
              {
                id: '3',
                title: 'Contacto con 5 Leads Calificados de FerreOS',
                impact: 65,
                reason: 'Faltan 8 ventas para cumplir la meta del trimestre.'
              },
            ].map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-[16px] flex items-center justify-between gap-4 transition-all"
                style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
                    style={{ background: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.2)' }}
                  >
                    <span className="text-[8px] font-mono text-[#4F8CFF] font-semibold">IMPACT</span>
                    <span className="text-lg font-bold text-white leading-none">{q.impact}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{q.title}</h3>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{q.reason}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenFocus}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-white shrink-0"
                  style={{ background: '#4F8CFF' }}
                >
                  Ejecutar
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* Coach IA Advice & Impact Score Card */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">Impact Score del Día</p>
          
          <div
            className="p-5 rounded-[20px] flex flex-col justify-between"
            style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-[#9CA3AF] uppercase">Puntaje Acumulado</span>
              <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light text-white">85</span>
                <span className="text-xs font-mono text-[#22C55E] font-medium">+15 pts hoy</span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                Has completado 3 acciones de alto apalancamiento. Vas camino a superar el promedio semanal.
              </p>
            </div>
          </div>

          <div
            className="p-5 rounded-[20px]"
            style={{ background: 'rgba(79,140,255,0.05)', border: '1px solid rgba(79,140,255,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-2 text-[#4F8CFF]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">Consejo del Chief of Staff</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Detecté que postergaste ventas comerciales ayer. Antes de abrir código en CTO Mode, cierra las 3 llamadas pendientes de la Queue.
            </p>
          </div>
        </div>
      </div>

    </div>
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
