import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain, Search, Filter, Clock, User, Building2,
  ChevronRight, ArrowRight, Zap, Tag, AlertCircle,
  TrendingUp, Eye, RefreshCw, Database, Cpu, MessageSquare,
  ChevronDown, ChevronUp, BarChart3, Globe
} from 'lucide-react';

const API = 'http://localhost:3000';

// ── Types ────────────────────────────────────────────────────────────────────
interface AuditEntry {
  id: string;
  contactId: string;
  contactName: string;
  company: string | null;
  tenantId: string | null;
  field: string;
  previousValue: any;
  newValue: any;
  source: string;
  skill: string | null;
  confidence: number;
  conversationId: string | null;
  createdAt: string;
}

interface Stats {
  totalLeadsWithMemory: number;
  totalLearningEvents: number;
  fieldBreakdown: { field: string; count: number }[];
  recentActivity: AuditEntry[];
}

interface ContactMemory {
  contactId: string;
  contactName: string;
  phone: string | null;
  tenantId: string | null;
  memory: {
    name: string | null;
    company: string | null;
    interests: string[];
    objections: string[];
    leadStatus: string | null;
    tags: string[];
    lastInteraction: string | null;
    updatedAt: string;
  } | null;
  timeline: AuditEntry[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre', company: 'Empresa', interests: 'Intereses',
  objections: 'Objeciones', leadStatus: 'Estado', tags: 'Etiquetas',
};
const FIELD_COLORS: Record<string, string> = {
  name: '#6366f1', company: '#8b5cf6', interests: '#06b6d4',
  objections: '#f59e0b', leadStatus: '#10b981', tags: '#ec4899',
};
const SOURCE_ICONS: Record<string, any> = {
  hermes: <Cpu size={12} />, human: <User size={12} />,
  webhook: <Globe size={12} />, import: <Database size={12} />,
};

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
  return String(val);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function confColor(c: number): string {
  if (c >= 0.85) return '#10b981';
  if (c >= 0.6)  return '#f59e0b';
  return '#ef4444';
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: any) {
  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.05))',
      border: '1px solid rgba(99,102,241,.2)', borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#6366f1', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function FieldBadge({ field }: { field: string }) {
  const color = FIELD_COLORS[field] ?? '#64748b';
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>{FIELD_LABELS[field] ?? field}</span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 64, height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: confColor(value), transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 11, color: confColor(value), fontWeight: 600 }}>{pct}%</span>
    </div>
  );
}

function DiffCard({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const prevFmt = formatValue(entry.previousValue);
  const newFmt  = formatValue(entry.newValue);

  return (
    <div style={{
      background: 'rgba(15,23,42,.6)', border: '1px solid rgba(99,102,241,.15)',
      borderRadius: 12, padding: '14px 16px', marginBottom: 8,
      transition: 'border-color .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,.15)')}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <FieldBadge field={entry.field} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 12, marginLeft: 'auto' }}>
          <span style={{ color: '#64748b' }}>{SOURCE_ICONS[entry.source] ?? <Cpu size={12}/>}</span>
          <span>{entry.skill ?? entry.source}</span>
          <span style={{ color: '#475569' }}>·</span>
          <span>{timeAgo(entry.createdAt)}</span>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* diff preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {entry.previousValue !== null ? (
          <span style={{
            background: 'rgba(239,68,68,.12)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)',
            borderRadius: 6, padding: '3px 10px', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>− {prevFmt}</span>
        ) : (
          <span style={{ color: '#475569', fontSize: 12, fontStyle: 'italic' }}>nuevo</span>
        )}
        <ArrowRight size={14} color="#475569" />
        <span style={{
          background: 'rgba(16,185,129,.12)', color: '#34d399', border: '1px solid rgba(16,185,129,.2)',
          borderRadius: 6, padding: '3px 10px', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>+ {newFmt}</span>
        <div style={{ marginLeft: 'auto' }}>
          <ConfidenceBar value={entry.confidence} />
        </div>
      </div>

      {/* expanded details */}
      {expanded && (
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.06)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>ANTES</div>
            <div style={{
              background: 'rgba(239,68,68,.06)', borderRadius: 8, padding: '8px 12px',
              fontSize: 12, color: '#f87171', wordBreak: 'break-word',
            }}>{prevFmt === '—' ? 'Sin valor previo' : prevFmt}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>DESPUÉS</div>
            <div style={{
              background: 'rgba(16,185,129,.06)', borderRadius: 8, padding: '8px 12px',
              fontSize: 12, color: '#34d399', wordBreak: 'break-word',
            }}>{newFmt}</div>
          </div>
          {entry.conversationId && (
            <div style={{ gridColumn: '1/-1', fontSize: 11, color: '#475569' }}>
              Conversación: <span style={{ color: '#6366f1' }}>{entry.conversationId.slice(0,8)}…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MemoryCenterUI() {
  const [view, setView]           = useState<'timeline'|'leads'|'companies'>('timeline');
  const [stats, setStats]         = useState<Stats | null>(null);
  const [timeline, setTimeline]   = useState<AuditEntry[]>([]);
  const [total, setTotal]         = useState(0);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch]       = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [loading, setLoading]     = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMemory | null>(null);
  const [loadingContact, setLoadingContact]   = useState(false);

  // ── Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/memory/stats`);
      setStats(await r.json());
    } catch {}
  }, []);

  // ── Fetch timeline
  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '60' });
      if (search)       params.set('search', search);
      if (fieldFilter)  params.set('field', fieldFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      const r = await fetch(`${API}/memory/timeline?${params}`);
      const d = await r.json();
      setTimeline(d.data ?? []);
      setTotal(d.total ?? 0);
    } catch {}
    setLoading(false);
  }, [search, fieldFilter, sourceFilter]);

  // ── Fetch companies
  const fetchCompanies = useCallback(async () => {
    try {
      const r = await fetch(`${API}/memory/company`);
      const d = await r.json();
      setCompanies(d.companies ?? []);
    } catch {}
  }, []);

  // ── Fetch single contact
  const fetchContact = useCallback(async (contactId: string) => {
    setLoadingContact(true);
    try {
      const r = await fetch(`${API}/memory/contact/${contactId}`);
      setSelectedContact(await r.json());
    } catch {}
    setLoadingContact(false);
  }, []);

  useEffect(() => { fetchStats(); fetchTimeline(); fetchCompanies(); }, []);
  useEffect(() => { fetchTimeline(); }, [search, fieldFilter, sourceFilter]);

  // Polling every 10s
  useEffect(() => {
    const id = setInterval(() => { fetchStats(); fetchTimeline(); }, 10000);
    return () => clearInterval(id);
  }, [fetchStats, fetchTimeline]);

  const FIELDS = ['name','company','interests','objections','leadStatus','tags'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', color: '#f1f5f9' }}>

      {/* Header */}
      <div style={{
        padding: '20px 28px 0', borderBottom: '1px solid rgba(99,102,241,.15)',
        background: 'linear-gradient(180deg,rgba(99,102,241,.06),transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Brain size={20} color="#fff" /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>Memory Center</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Auditoría de aprendizaje de Hermes</p>
            </div>
          </div>
          <button onClick={() => { fetchStats(); fetchTimeline(); fetchCompanies(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,.1)',
              border: '1px solid rgba(99,102,241,.3)', borderRadius: 8, padding: '6px 14px',
              color: '#818cf8', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            <StatCard icon={<Brain size={20} color="#fff"/>} label="Leads con memoria" value={stats.totalLeadsWithMemory} />
            <StatCard icon={<Zap size={20} color="#fff"/>}   label="Eventos de aprendizaje" value={stats.totalLearningEvents} />
            <StatCard icon={<BarChart3 size={20} color="#fff"/>} label="Campos más activos"
              value={stats.fieldBreakdown[0]?.field ? FIELD_LABELS[stats.fieldBreakdown[0].field] ?? stats.fieldBreakdown[0].field : '—'}
              sub={stats.fieldBreakdown[0] ? `${stats.fieldBreakdown[0].count} cambios` : ''} />
            <StatCard icon={<Clock size={20} color="#fff"/>} label="Última actualización"
              value={stats.recentActivity[0] ? timeAgo(stats.recentActivity[0].createdAt) : '—'}
              sub={stats.recentActivity[0]?.contactName ?? ''} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'timeline', label: 'Timeline', icon: <Clock size={14}/> },
            { id: 'leads',    label: 'Por Lead', icon: <User size={14}/> },
            { id: 'companies',label: 'Por Empresa', icon: <Building2 size={14}/> },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: view === t.id ? '#818cf8' : '#64748b',
                borderBottom: view === t.id ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all .2s',
              }}>{t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ── TIMELINE view ── */}
        {view === 'timeline' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Filters bar */}
            <div style={{
              padding: '14px 28px', display: 'flex', gap: 10, alignItems: 'center',
              background: 'rgba(15,23,42,.4)', borderBottom: '1px solid rgba(255,255,255,.05)',
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar en memoria…"
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 12, height: 36,
                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>

              <select value={fieldFilter} onChange={e => setFieldFilter(e.target.value)}
                style={{
                  height: 36, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8, color: '#94a3b8', fontSize: 13, padding: '0 12px', outline: 'none',
                }}>
                <option value="">Todos los campos</option>
                {FIELDS.map(f => <option key={f} value={f}>{FIELD_LABELS[f]}</option>)}
              </select>

              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                style={{
                  height: 36, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8, color: '#94a3b8', fontSize: 13, padding: '0 12px', outline: 'none',
                }}>
                <option value="">Todas las fuentes</option>
                <option value="hermes">Hermes</option>
                <option value="human">Humano</option>
                <option value="webhook">Webhook</option>
              </select>

              <span style={{ marginLeft: 'auto', color: '#475569', fontSize: 12 }}>
                {total} eventos
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: '#475569', paddingTop: 60 }}>
                  <Brain size={32} style={{ opacity: .3 }} />
                  <div style={{ marginTop: 12, fontSize: 14 }}>Cargando memoria…</div>
                </div>
              ) : timeline.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', paddingTop: 60 }}>
                  <Brain size={48} style={{ opacity: .2 }} />
                  <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600 }}>Sin eventos de aprendizaje aún</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Envía un mensaje de WhatsApp para que Hermes aprenda</div>
                </div>
              ) : (
                <>
                  {/* Group by date */}
                  {Object.entries(
                    timeline.reduce((acc: any, e) => {
                      const d = new Date(e.createdAt).toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
                      (acc[d] = acc[d] || []).push(e);
                      return acc;
                    }, {})
                  ).map(([date, entries]: any) => (
                    <div key={date} style={{ marginBottom: 28 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
                        fontSize: 12, color: '#475569', textTransform: 'capitalize',
                      }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                        <span style={{ background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 20, padding: '3px 12px', color: '#818cf8' }}>
                          {date}
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
                      </div>
                      {entries.map((e: AuditEntry) => (
                        <div key={e.id}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button onClick={() => fetchContact(e.contactId)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: 12, fontWeight: 600 }}>
                              {e.contactName !== e.contactId ? e.contactName : e.contactId.slice(0,12)+'…'}
                            </button>
                            {e.company && <span style={{ color: '#475569' }}>· {e.company}</span>}
                          </div>
                          <DiffCard entry={e} />
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── LEADS view ── */}
        {view === 'leads' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left: contact list from stats recent */}
            <div style={{
              width: 300, borderRight: '1px solid rgba(255,255,255,.06)',
              overflowY: 'auto', padding: '16px 12px',
            }}>
              <div style={{ fontSize: 11, color: '#475569', padding: '0 8px', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Leads con memoria
              </div>
              {stats?.recentActivity.map(a => (
                <button key={a.contactId} onClick={() => fetchContact(a.contactId)}
                  style={{
                    width: '100%', textAlign: 'left', background: selectedContact?.contactId === a.contactId ? 'rgba(99,102,241,.15)' : 'transparent',
                    border: selectedContact?.contactId === a.contactId ? '1px solid rgba(99,102,241,.3)' : '1px solid transparent',
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer', marginBottom: 4,
                    transition: 'all .15s',
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{a.contactName}</div>
                  {a.company && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{a.company}</div>}
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{timeAgo(a.createdAt)}</div>
                </button>
              ))}
            </div>

            {/* Right: contact detail */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              {loadingContact ? (
                <div style={{ textAlign: 'center', paddingTop: 80, color: '#475569' }}>Cargando…</div>
              ) : selectedContact ? (
                <>
                  {/* Memory card */}
                  <div style={{
                    background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.06))',
                    border: '1px solid rgba(99,102,241,.25)', borderRadius: 16, padding: 24, marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}><User size={22} color="#fff" /></div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{selectedContact.contactName}</h3>
                        {selectedContact.memory?.company && (
                          <div style={{ color: '#8b5cf6', fontSize: 13, marginTop: 4 }}>
                            <Building2 size={12} style={{ marginRight: 4 }} />
                            {selectedContact.memory.company}
                          </div>
                        )}
                        {selectedContact.phone && <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{selectedContact.phone}</div>}
                      </div>
                    </div>

                    {selectedContact.memory && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                          { label: 'Intereses', value: selectedContact.memory.interests, color: FIELD_COLORS.interests },
                          { label: 'Objeciones', value: selectedContact.memory.objections, color: FIELD_COLORS.objections },
                          { label: 'Estado', value: [selectedContact.memory.leadStatus ?? '—'], color: FIELD_COLORS.leadStatus },
                          { label: 'Etiquetas', value: selectedContact.memory.tags, color: FIELD_COLORS.tags },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {value.length ? value.map((v, i) => (
                                <span key={i} style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>{v}</span>
                              )) : <span style={{ color: '#475569', fontSize: 12 }}>—</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timeline for this contact */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} /> Historial de aprendizaje ({selectedContact.timeline.length} eventos)
                  </div>
                  {selectedContact.timeline.map(e => <DiffCard key={e.id} entry={e} />)}
                </>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 80, color: '#475569' }}>
                  <Eye size={36} style={{ opacity: .3 }} />
                  <div style={{ marginTop: 12 }}>Selecciona un lead para ver su memoria</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMPANIES view ── */}
        {view === 'companies' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            {companies.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80, color: '#475569' }}>
                <Building2 size={36} style={{ opacity: .3 }} />
                <div style={{ marginTop: 12 }}>Sin empresas en memoria todavía</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                {companies.sort((a,b) => (b.leads.length - a.leads.length)).map((co: any) => (
                  <div key={co.company} style={{
                    background: 'rgba(15,23,42,.7)', border: '1px solid rgba(139,92,246,.2)',
                    borderRadius: 16, padding: 20,
                    transition: 'border-color .2s, transform .2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,92,246,.5)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(139,92,246,.2)'; e.currentTarget.style.transform='none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Building2 size={18} color="#fff" /></div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{co.company}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{co.leads.length} lead{co.leads.length !== 1 ? 's' : ''}</div>
                      </div>
                      {co.lastActivity && (
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>
                          {timeAgo(co.lastActivity)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {co.leads.slice(0, 3).map((lead: any) => (
                        <button key={lead.contactId} onClick={() => { setView('leads'); fetchContact(lead.contactId); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                            background: 'rgba(255,255,255,.04)', border: 'none', borderRadius: 8,
                            padding: '8px 12px', cursor: 'pointer', width: '100%',
                          }}>
                          <User size={12} color="#64748b" />
                          <span style={{ fontSize: 12, color: '#cbd5e1' }}>{lead.name ?? lead.contactId.slice(0,14)+'…'}</span>
                          <ChevronRight size={12} color="#475569" style={{ marginLeft: 'auto' }} />
                        </button>
                      ))}
                      {co.leads.length > 3 && (
                        <div style={{ fontSize: 11, color: '#475569', padding: '4px 12px' }}>
                          +{co.leads.length - 3} más…
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
