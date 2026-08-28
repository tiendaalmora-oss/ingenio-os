"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle, Plug, MessageSquare, GitBranch, Calendar, Mail,
  Zap, Database, CheckCircle2, ShieldAlert, Play, ArrowUpRight,
  Sparkles, RefreshCw, Lock, Radio
} from 'lucide-react';

interface SkillItem {
  id: string;
  name: string;
  toolKey: string;
  category: 'Communication' | 'Development' | 'Productivity' | 'Automation' | 'Infrastructure';
  description: string;
  permission: 'CRITICAL' | 'WRITE' | 'READ';
  status: 'CONNECTED' | 'READY' | 'CONFIG_NEEDED';
  lastRun?: string;
  icon: any;
  color: string;
}

const INITIAL_SKILLS: SkillItem[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business / WAHA',
    toolKey: 'whatsapp_dispatch',
    category: 'Communication',
    description: 'Envío de alertas ejecutivas directas, seguimiento de leads calificados y notificaciones VIP.',
    permission: 'CRITICAL',
    status: 'CONNECTED',
    lastRun: 'Hace 12 min',
    icon: MessageSquare,
    color: '#22C55E'
  },
  {
    id: 'github',
    name: 'GitHub Repository Sync',
    toolKey: 'github_sync_blockers',
    category: 'Development',
    description: 'Monitoreo de PRs bloqueantes, incidencias críticas y sincronización con el modo CTO.',
    permission: 'READ',
    status: 'CONNECTED',
    lastRun: 'Hace 1h',
    icon: GitBranch,
    color: '#E5E7EB'
  },
  {
    id: 'calendar',
    name: 'Google Calendar / Time Blocking',
    toolKey: 'calendar_protect_focus',
    category: 'Productivity',
    description: 'Protección automática de bloques de Focus Mode (Deep Work) y preparación previa a reuniones.',
    permission: 'WRITE',
    status: 'CONNECTED',
    lastRun: 'Hoy, 08:30',
    icon: Calendar,
    color: '#3B82F6'
  },
  {
    id: 'n8n',
    name: 'n8n Webhook Engine',
    toolKey: 'n8n_execute_flow',
    category: 'Automation',
    description: 'Disparo de flujos de automatización empresarial, sincronización de leads y triggers externos.',
    permission: 'WRITE',
    status: 'CONNECTED',
    lastRun: 'Ayer',
    icon: Zap,
    color: '#F97316'
  },
  {
    id: 'gmail',
    name: 'Gmail Dispatcher',
    toolKey: 'send_email',
    category: 'Communication',
    description: 'Envío de reportes de Morning Brief y propuestas comerciales bajo autorización explícita.',
    permission: 'CRITICAL',
    status: 'CONNECTED',
    lastRun: 'Hace 3h',
    icon: Mail,
    color: '#EF4444'
  },
  {
    id: 'supabase',
    name: 'Supabase Data Gateway',
    toolKey: 'supabase_backup_snapshot',
    category: 'Infrastructure',
    description: 'Consultas en tiempo real al PostgreSQL central y generación de snapshots de resguardo.',
    permission: 'READ',
    status: 'CONNECTED',
    lastRun: 'Hace 45 min',
    icon: Database,
    color: '#10B981'
  }
];

export function SkillsIntegrationsUI() {
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [filter, setFilter] = useState<string>('ALL');
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredSkills = filter === 'ALL'
    ? skills
    : skills.filter(s => s.category.toUpperCase() === filter);

  const handleTestSkill = async (skill: SkillItem) => {
    setExecutingId(skill.id);
    
    // Simulate invocation to backend
    await new Promise(r => setTimeout(r, 1200));

    setExecutingId(null);
    setToastMessage(
      skill.permission === 'CRITICAL'
        ? `🛡️ "${skill.name}" requiere aprobación en el Human Approval Layer.`
        : `⚡ "${skill.name}" ejecutada con éxito por el Action Engine.`
    );

    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl border bg-black/90 text-white text-xs font-mono shadow-2xl flex items-center justify-between border-[#4F8CFF]/40"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#4F8CFF]" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-[#9CA3AF] hover:text-white ml-4">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div
        className="p-6 rounded-[22px] border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(79,140,255,0.08) 0%, rgba(109,88,255,0.04) 100%)',
          borderColor: 'rgba(79,140,255,0.2)'
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#4F8CFF] font-semibold bg-[#4F8CFF]/10 px-2 py-0.5 rounded-md border border-[#4F8CFF]/20">
              Tool Registry • Action Engine
            </span>
          </div>
          <h2 className="text-2xl font-light text-white">
            Executive Skills & Conectores Activos
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-xl">
            Herramientas oficiales que los agentes (CEO, CTO, Coach) y el Executive Loop pueden invocar para interactuar con el mundo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5 text-xs text-[#9CA3AF]">
          <Radio className="w-3.5 h-3.5 text-[#22C55E] animate-pulse" />
          <span>6 Conectores Online</span>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Todas las Skills' },
          { id: 'COMMUNICATION', label: 'Comunicación' },
          { id: 'DEVELOPMENT', label: 'Desarrollo (CTO)' },
          { id: 'PRODUCTIVITY', label: 'Productividad' },
          { id: 'AUTOMATION', label: 'Automatización (n8n)' },
          { id: 'INFRASTRUCTURE', label: 'Infraestructura' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              filter === cat.id
                ? 'bg-[#4F8CFF] text-white shadow-sm shadow-[#4F8CFF]/20'
                : 'text-[#9CA3AF] hover:text-white bg-white/5 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill) => {
          const Icon = skill.icon;
          const isExecuting = executingId === skill.id;
          const isCritical = skill.permission === 'CRITICAL';

          return (
            <motion.div
              key={skill.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-[20px] border flex flex-col justify-between transition-all hover:border-white/15"
              style={{ background: '#181818', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div>
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        background: `${skill.color}15`,
                        borderColor: `${skill.color}30`,
                        color: skill.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        {skill.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#9CA3AF] block mt-0.5">
                        Tool ID: {skill.toolKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      Activo
                    </span>
                    {isCritical ? (
                      <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Aprobación Req.
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                        Auto-Ejecutable
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                  {skill.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  Última ejecución: <strong className="text-white/80">{skill.lastRun}</strong>
                </span>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isExecuting}
                  onClick={() => handleTestSkill(skill)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-50"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-3.5 h-3.5 text-[#4F8CFF] animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-[#4F8CFF]" />
                  )}
                  <span>{isExecuting ? 'Invocando...' : 'Probar Skill'}</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
