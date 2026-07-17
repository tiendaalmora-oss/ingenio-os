"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, X, Phone, Building2,
  Zap, Clock, MessageSquare, Tag, ChevronRight,
  TrendingUp, AlertCircle, CheckCircle2, Star
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

const API = 'http://localhost:3000';
const POLL_MS = 10000;

const STAGES = ['Nuevo', 'Contactado', 'Interesado', 'Demo', 'Oferta', 'Venta', 'Cliente'];

const STAGE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  Nuevo:      { bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF', border: 'rgba(107,114,128,0.2)' },
  Contactado: { bg: 'rgba(59,130,246,0.12)',  text: '#60A5FA', border: 'rgba(59,130,246,0.2)' },
  Interesado: { bg: 'rgba(245,158,11,0.12)',  text: '#FBBF24', border: 'rgba(245,158,11,0.2)' },
  Demo:       { bg: 'rgba(139,92,246,0.12)',  text: '#A78BFA', border: 'rgba(139,92,246,0.2)' },
  Oferta:     { bg: 'rgba(249,115,22,0.12)',  text: '#FB923C', border: 'rgba(249,115,22,0.2)' },
  Venta:      { bg: 'rgba(34,197,94,0.12)',   text: '#4ADE80', border: 'rgba(34,197,94,0.2)'  },
  Cliente:    { bg: 'rgba(79,140,255,0.12)',  text: '#4F8CFF', border: 'rgba(79,140,255,0.2)' },
};

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  company: string | null;
  leadStatus: string;
  kanbanStage: string;
  score: number;
  interests: string[];
  objections: string[];
  tags: string[];
  lastInteraction: string | null;
  hoursSinceLastContact: number | null;
  conversationCount: number;
  interactionCount: number;
  activeFunnelId: string | null;
  activeFunnelStep: string | null;
  pendingTasks: number;
  lastMessageContent: string | null;
  lastMessageDirection: string | null;
};

type LeadDetail = Lead & {
  conversations: Array<{
    id: string;
    status: string;
    messageCount: number;
    activeFunnel: { funnelId: string; step: string } | null;
    messages: Array<{
      id: string;
      direction: string;
      content: string;
      role: string | null;
      timestamp: string;
    }>;
  }>;
  tasks: any[];
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle
            cx="12" cy="12" r="9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 56.5} 56.5`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

function TimeAgo({ hours }: { hours: number | null }) {
  if (hours === null) return <span className="text-[10px] text-[#6B7280]">Sin contacto</span>;
  const urgent = hours > 48;
  const text = hours < 1 ? 'Ahora' : hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  return (
    <span className="text-[10px] flex items-center gap-1" style={{ color: urgent ? '#EF4444' : '#9CA3AF' }}>
      {urgent && <AlertCircle className="w-2.5 h-2.5" />}
      {text}
    </span>
  );
}

export function CrmUI() {
  const { tenantId } = useTenant();
  const [kanban, setKanban] = useState<Record<string, Lead[]>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [movingLead, setMovingLead] = useState<string | null>(null);

  // ── Fetch Kanban ──────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`${API}/crm/leads?${params}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const json = await res.json();
      setKanban(json.kanban ?? {});
      setTotal(json.total ?? 0);
    } catch {
      setKanban({});
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads();
    const id = setInterval(fetchLeads, POLL_MS);
    return () => clearInterval(id);
  }, [fetchLeads]);

  // ── Open Lead Detail ──────────────────────────────────
  const openLead = async (leadId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/crm/leads/${leadId}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const data = await res.json();
      setSelectedLead(data);
      setActiveConvId(data.conversations?.[0]?.id ?? null);
    } catch {
      setSelectedLead(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Move Stage ────────────────────────────────────────
  const moveStage = async (leadId: string, newStage: string) => {
    setMovingLead(leadId);
    try {
      await fetch(`${API}/crm/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ stage: newStage }),
      });
      await fetchLeads();
      if (selectedLead?.id === leadId) await openLead(leadId);
    } finally {
      setMovingLead(null);
    }
  };

  return (
    <div className="flex flex-col h-full -m-8 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Header ───────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}
      >
        <div>
          <p className="text-sm font-semibold text-white">CRM Inteligente</p>
          <p className="text-xs text-[#9CA3AF]">{total} leads · Auto-alimentado desde WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar lead..."
              className="pl-8 pr-4 py-2 text-xs text-white placeholder:text-[#9CA3AF] outline-none rounded-xl w-52"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <button
            onClick={() => { setLoading(true); fetchLeads(); }}
            className="text-[#9CA3AF] hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Kanban Board ─────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 h-full p-4 min-w-max">
          {STAGES.map(stage => {
            const leads = kanban[stage] ?? [];
            const colors = STAGE_COLOR[stage];
            return (
              <div
                key={stage}
                className="flex flex-col w-64 flex-shrink-0 h-full rounded-[18px] overflow-hidden"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Column header */}
                <div className="px-3 py-3 flex-shrink-0 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        {stage}
                      </span>
                    </div>
                    <span className="text-xs text-[#6B7280] font-medium">{leads.length}</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {loading ? (
                    <div className="flex justify-center pt-6">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#9CA3AF]" />
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-center">
                      <p className="text-[10px] text-[#6B7280]">Sin leads</p>
                    </div>
                  ) : (
                    leads.map((lead, i) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => openLead(lead.id)}
                        className="rounded-[14px] p-3 cursor-pointer transition-all hover:scale-[1.02]"
                        style={{
                          background: '#181818',
                          border: '1px solid rgba(255,255,255,0.06)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        {/* Name + score */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{lead.name}</p>
                            {lead.company && (
                              <p className="text-[10px] text-[#9CA3AF] truncate mt-0.5">{lead.company}</p>
                            )}
                          </div>
                          <ScoreBadge score={lead.score} />
                        </div>

                        {/* Phone */}
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <Phone className="w-2.5 h-2.5 text-[#6B7280]" />
                            <span className="text-[10px] text-[#9CA3AF]">{lead.phone}</span>
                          </div>
                        )}

                        {/* Last message preview */}
                        {lead.lastMessageContent && (
                          <p className="text-[10px] text-[#6B7280] truncate mb-2 italic">
                            {lead.lastMessageDirection === 'INBOUND' ? '← ' : '→ '}
                            {lead.lastMessageContent}
                          </p>
                        )}

                        {/* Footer stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5 text-[#6B7280]" />
                              <span className="text-[10px] text-[#6B7280]">{lead.conversationCount}</span>
                            </div>
                            {lead.activeFunnelId && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-[#4F8CFF]" />
                              </div>
                            )}
                            {lead.pendingTasks > 0 && (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-[#F59E0B]" />
                                <span className="text-[10px] text-[#F59E0B]">{lead.pendingTasks}</span>
                              </div>
                            )}
                          </div>
                          <TimeAgo hours={lead.hoursSinceLastContact} />
                        </div>

                        {/* Interests tags */}
                        {lead.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lead.interests.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                                {t}
                              </span>
                            ))}
                            {lead.interests.length > 2 && (
                              <span className="text-[9px] text-[#6B7280]">+{lead.interests.length - 2}</span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lead Detail Drawer ────────────────────── */}
      <AnimatePresence>
        {(selectedLead || detailLoading) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
              style={{
                width: '720px',
                background: '#111111',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '-32px 0 80px rgba(0,0,0,0.6)',
              }}
            >
              {detailLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#4F8CFF]" />
                </div>
              ) : selectedLead ? (
                <>
                  {/* Drawer header */}
                  <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b flex-shrink-0"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #4F8CFF, #6d58ff)' }}>
                          {selectedLead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{selectedLead.name}</p>
                          {selectedLead.company && (
                            <p className="text-xs text-[#9CA3AF]">{selectedLead.company}</p>
                          )}
                        </div>
                        <ScoreBadge score={selectedLead.score} />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        {selectedLead.phone && (
                          <span className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                            <Phone className="w-3 h-3" />{selectedLead.phone}
                          </span>
                        )}
                        <TimeAgo hours={selectedLead.hoursSinceLastContact} />
                        <span className="text-xs text-[#9CA3AF]">{selectedLead.interactionCount} mensajes</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLead(null)} className="text-[#9CA3AF] hover:text-white p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stage mover */}
                  <div className="px-6 py-3 border-b flex-shrink-0 overflow-x-auto"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex gap-2 min-w-max">
                      {STAGES.map(s => {
                        const isActive = selectedLead.kanbanStage === s;
                        const colors = STAGE_COLOR[s];
                        return (
                          <button
                            key={s}
                            onClick={() => !isActive && moveStage(selectedLead.id, s)}
                            disabled={movingLead === selectedLead.id}
                            className="text-xs px-3 py-1.5 rounded-full transition-all font-medium"
                            style={{
                              background: isActive ? colors.bg : 'rgba(255,255,255,0.04)',
                              color: isActive ? colors.text : '#6B7280',
                              border: `1px solid ${isActive ? colors.border : 'rgba(255,255,255,0.06)'}`,
                            }}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden flex">
                    {/* Left: Memory + Info */}
                    <div className="w-64 flex-shrink-0 overflow-y-auto border-r p-5 space-y-5"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

                      {/* Hermes Memory Summary */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#4F8CFF] uppercase tracking-widest mb-2">
                          Memoria Hermes
                        </p>
                        <div className="rounded-xl p-3 space-y-1.5"
                          style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.15)' }}>
                          <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
                            {selectedLead.interests.length > 0
                              ? `Interesado en: ${selectedLead.interests.join(', ')}.`
                              : 'Sin intereses detectados aún.'}
                            {selectedLead.objections.length > 0
                              ? ` Objeciones: ${selectedLead.objections.join(', ')}.`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {/* Interests */}
                      {selectedLead.interests.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Intereses</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedLead.interests.map((t, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Objections */}
                      {selectedLead.objections.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Objeciones</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedLead.objections.map((o, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                                {o}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {selectedLead.tags.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Tags</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedLead.tags.filter(t => !t.startsWith('owner:')).map((t, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Funnel */}
                      {selectedLead.activeFunnelId && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">
                            Automatización Activa
                          </p>
                          <div className="rounded-xl p-3"
                            style={{ background: 'rgba(79,140,255,0.08)', border: '1px solid rgba(79,140,255,0.15)' }}>
                            <p className="text-[10px] text-[#4F8CFF] font-medium truncate">{selectedLead.activeFunnelId}</p>
                            <p className="text-[9px] text-[#9CA3AF] mt-0.5">Step: {selectedLead.activeFunnelStep}</p>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Estadísticas</p>
                        <div className="space-y-2 rounded-xl p-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {[
                            ['Conversaciones', selectedLead.conversationCount],
                            ['Mensajes totales', selectedLead.interactionCount],
                            ['Tareas pendientes', selectedLead.tasks?.length ?? 0],
                          ].map(([label, val]) => (
                            <div key={label as string} className="flex justify-between">
                              <span className="text-[10px] text-[#9CA3AF]">{label}</span>
                              <span className="text-[10px] text-white font-medium">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Conversation Hub embebido */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Conv selector */}
                      {selectedLead.conversations.length > 1 && (
                        <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto flex-shrink-0"
                          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          {selectedLead.conversations.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setActiveConvId(c.id)}
                              className="text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
                              style={{
                                background: activeConvId === c.id ? 'rgba(79,140,255,0.2)' : 'rgba(255,255,255,0.04)',
                                color: activeConvId === c.id ? '#4F8CFF' : '#9CA3AF',
                                border: `1px solid ${activeConvId === c.id ? 'rgba(79,140,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                              }}
                            >
                              Conv #{c.id.slice(-4)} · {c.messageCount} msgs
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        {selectedLead.conversations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full gap-3">
                            <MessageSquare className="w-8 h-8 text-[#6B7280]" />
                            <p className="text-xs text-[#9CA3AF]">Sin conversaciones con este lead</p>
                          </div>
                        ) : (
                          (() => {
                            const conv = selectedLead.conversations.find(c => c.id === activeConvId)
                              ?? selectedLead.conversations[0];
                            return conv?.messages.map((msg, i) => {
                              const isOut = msg.direction === 'OUTBOUND';
                              return (
                                <motion.div
                                  key={msg.id}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: Math.min(i * 0.015, 0.4) }}
                                  className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className="max-w-[75%] rounded-[14px] px-4 py-2.5"
                                    style={{
                                      background: isOut ? '#4F8CFF' : '#1C1C1C',
                                      border: isOut ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                      borderBottomRightRadius: isOut ? 4 : 14,
                                      borderBottomLeftRadius: isOut ? 14 : 4,
                                    }}
                                  >
                                    {msg.role === 'tool' && (
                                      <p className="text-[9px] text-white/50 mb-1 font-mono">⚙ skill</p>
                                    )}
                                    <p className="text-xs text-white leading-relaxed">{msg.content}</p>
                                    <p className="text-[9px] mt-1 text-white/40 text-right">
                                      {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </motion.div>
                              );
                            });
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
