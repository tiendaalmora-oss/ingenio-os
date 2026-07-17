"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, RefreshCw, Circle, User,
  Phone, Tag, Clock, ChevronRight, Send, Inbox,
  AlertCircle, CheckCircle2, Filter
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

const API = 'http://localhost:3000';
const POLL_MS = 8000;

type Conversation = {
  id: string;
  status: string;
  contactName: string;
  contactPhone: string | null;
  leadStatus: string | null;
  messageCount: number;
  lastMessage: { content: string; direction: string; timestamp: string } | null;
};

type Message = {
  id: string;
  direction: string;
  type: string;
  content: string;
  role: string | null;
  timestamp: string;
};

type ConvDetail = {
  id: string;
  status: string;
  contact: {
    id: string;
    name: string;
    phone: string | null;
    leadStatus: string | null;
    interests: string[];
    objections: string[];
    tags: string[];
    lastInteraction: string | null;
  };
  activeFunnel: { funnelId: string; step: string } | null;
  messageCount: number;
};

const STATUS_COLOR: Record<string, string> = {
  NEW: '#F59E0B',
  ACTIVE: '#22C55E',
  RESOLVED: '#6B7280',
};

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ConversationHubUI() {
  const { tenantId } = useTenant();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConvDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch list ──────────────────────────────────────────
  const fetchList = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: '1', limit: '30' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API}/conversations?${params}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const json = await res.json();
      setConversations(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // ── Auto-poll list ──────────────────────────────────────
  useEffect(() => {
    fetchList();
    const id = setInterval(fetchList, POLL_MS);
    return () => clearInterval(id);
  }, [fetchList]);

  // ── Fetch detail + messages when selecting ──────────────
  const selectConversation = async (id: string) => {
    setSelectedId(id);
    setMessagesLoading(true);
    try {
      const [detailRes, msgRes] = await Promise.all([
        fetch(`${API}/conversations/${id}`, { headers: { 'x-tenant-id': tenantId } }),
        fetch(`${API}/conversations/${id}/messages?limit=100`, { headers: { 'x-tenant-id': tenantId } }),
      ]);
      const [d, m] = await Promise.all([detailRes.json(), msgRes.json()]);
      setDetail(d);
      setMessages(m.data ?? []);
    } catch {
      setDetail(null);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // ── Auto-scroll to bottom of messages ──────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full gap-0 -m-8 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Sidebar: Conversation List ─────────────── */}
      <div
        className="flex flex-col w-[320px] flex-shrink-0 h-full border-r overflow-hidden"
        style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Conversation Hub</p>
              <p className="text-xs text-[#9CA3AF]">{total} conversaciones</p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchList(); }}
              className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar contacto..."
              className="w-full pl-8 pr-3 py-2 text-xs text-white placeholder:text-[#9CA3AF] outline-none rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1.5">
            {['', 'NEW', 'ACTIVE', 'RESOLVED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: statusFilter === s ? 'rgba(79,140,255,0.2)' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === s ? '#4F8CFF' : '#9CA3AF',
                  border: `1px solid ${statusFilter === s ? 'rgba(79,140,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {s || 'Todos'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-[#9CA3AF]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-xs">Cargando...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
              <Inbox className="w-8 h-8 text-[#9CA3AF]" />
              <p className="text-sm text-[#9CA3AF]">Sin conversaciones</p>
              <p className="text-xs text-[#6B7280]">Los chats de WhatsApp aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            conversations.map((conv, i) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => selectConversation(conv.id)}
                className="w-full text-left px-4 py-3 transition-all hover:bg-white/5 border-b"
                style={{
                  borderColor: 'rgba(255,255,255,0.04)',
                  background: selectedId === conv.id ? 'rgba(79,140,255,0.08)' : 'transparent',
                  borderLeft: selectedId === conv.id ? '2px solid #4F8CFF' : '2px solid transparent',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white mt-0.5"
                    style={{ background: 'rgba(79,140,255,0.2)' }}
                  >
                    {conv.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-white truncate">{conv.contactName}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: STATUS_COLOR[conv.status] ?? '#6B7280' }}
                        />
                        {conv.lastMessage && (
                          <span className="text-[10px] text-[#6B7280]">
                            {relativeTime(conv.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#9CA3AF] truncate">
                      {conv.lastMessage
                        ? `${conv.lastMessage.direction === 'INBOUND' ? '←' : '→'} ${conv.lastMessage.content}`
                        : 'Sin mensajes'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.leadStatus && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(79,140,255,0.15)', color: '#4F8CFF' }}>
                          {conv.leadStatus}
                        </span>
                      )}
                      <span className="text-[10px] text-[#6B7280]">{conv.messageCount} msgs</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0D0D0D' }}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{ background: 'rgba(79,140,255,0.08)', border: '1px solid rgba(79,140,255,0.15)' }}
            >
              <MessageSquare className="w-7 h-7 text-[#4F8CFF]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Selecciona una conversación</p>
              <p className="text-xs text-[#9CA3AF]">El historial completo de mensajes aparecerá aquí.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            {detail && (
              <div
                className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: 'rgba(79,140,255,0.2)' }}>
                  {detail.contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{detail.contact.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{detail.contact.phone ?? 'Sin teléfono'}</p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: `${STATUS_COLOR[detail.status]}20`,
                    color: STATUS_COLOR[detail.status],
                  }}
                >
                  {detail.status}
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-32 gap-2 text-[#9CA3AF]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Cargando mensajes...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-[#9CA3AF]">
                  <p className="text-xs">Sin mensajes en esta conversación.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[72%] rounded-[16px] px-4 py-2.5"
                        style={{
                          background: isOutbound ? '#4F8CFF' : '#1C1C1C',
                          border: isOutbound ? 'none' : '1px solid rgba(255,255,255,0.06)',
                          borderBottomRightRadius: isOutbound ? 4 : 16,
                          borderBottomLeftRadius: isOutbound ? 16 : 4,
                        }}
                      >
                        {msg.role === 'tool' && (
                          <p className="text-[10px] text-white/60 mb-1 font-mono">⚙ skill</p>
                        )}
                        <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                        <p className="text-[10px] mt-1 text-white/50 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* ── Lead Panel ─────────────────────────────── */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="w-[260px] flex-shrink-0 h-full overflow-y-auto border-l"
            style={{ background: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="p-5 space-y-5">
              <div>
                <p className="text-[10px] font-semibold text-[#4F8CFF] uppercase tracking-widest mb-3">Lead Info</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                    <span className="text-xs text-white truncate">{detail.contact.name}</span>
                  </div>
                  {detail.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                      <span className="text-xs text-[#9CA3AF]">{detail.contact.phone}</span>
                    </div>
                  )}
                  {detail.contact.leadStatus && (
                    <div className="flex items-center gap-2">
                      <Circle className="w-3.5 h-3.5 text-[#4F8CFF] flex-shrink-0" />
                      <span className="text-xs text-[#4F8CFF] font-medium">{detail.contact.leadStatus}</span>
                    </div>
                  )}
                  {detail.contact.lastInteraction && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" />
                      <span className="text-xs text-[#9CA3AF]">
                        {new Date(detail.contact.lastInteraction).toLocaleDateString('es')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {detail.contact.interests.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Intereses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.contact.interests.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.contact.objections.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Objeciones</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.contact.objections.map((o, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.contact.tags.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.contact.tags.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#9CA3AF' }}>
                        <Tag className="inline w-2.5 h-2.5 mr-1" />{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.activeFunnel && (
                <div>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Embudo Activo</p>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(79,140,255,0.08)', border: '1px solid rgba(79,140,255,0.15)' }}>
                    <p className="text-xs text-[#4F8CFF] font-medium truncate">{detail.activeFunnel.funnelId}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">Step: {detail.activeFunnel.step}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Estadísticas</p>
                <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#9CA3AF]">Mensajes totales</span>
                    <span className="text-[10px] text-white font-medium">{detail.messageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[#9CA3AF]">Estado</span>
                    <span className="text-[10px] font-medium" style={{ color: STATUS_COLOR[detail.status] }}>
                      {detail.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
