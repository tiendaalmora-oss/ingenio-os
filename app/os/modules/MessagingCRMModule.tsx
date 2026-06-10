"use client";

import React, { useState, useEffect } from "react";
import { StepEditorModal } from "./StepEditorModal";

type Tab = "funnels" | "contacts" | "templates" | "conversion";

export function MessagingCRMModule() {
  const [activeTab, setActiveTab] = useState<Tab>("contacts");
  const [funnels, setFunnels] = useState<any[]>([]);
  const [activeFunnelId, setActiveFunnelId] = useState<string>("all");
  const [loadingFunnels, setLoadingFunnels] = useState(true);
  const [isCloning, setIsCloning] = useState(false);

  const fetchFunnels = async () => {
    try {
      const res = await fetch("/api/crm/funnels");
      const data = await res.json();
      if (data.success && data.funnels.length > 0) {
        setFunnels(data.funnels);
        // Mantenemos "all" por defecto en vez de forzar el primer embudo
      }
    } catch (err) {
      console.error("Error al cargar embudos", err);
    } finally {
      setLoadingFunnels(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, []);

  useEffect(() => {
    if (activeTab !== "contacts" && (activeFunnelId === "all" || activeFunnelId === "limbo")) {
      if (funnels.length > 0) {
        setActiveFunnelId(funnels[0].id);
      }
    }
  }, [activeTab, activeFunnelId, funnels]);

  const cloneFunnel = async (id: string, name: string) => {
    if (!name.trim()) return;
    setIsCloning(true);
    try {
      const res = await fetch("/api/crm/funnels/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnel_id: id, new_name: name })
      });
      if (res.ok) {
        fetchFunnels();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-73px)] overflow-hidden flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            💬 CRM & Embudos 
            {loadingFunnels && <span className="w-4 h-4 border-2 border-zinc-700 border-t-white rounded-full animate-spin ml-2"></span>}
          </h2>
          <p className="text-zinc-400">Control maestro de leads, etapas y mensajes automáticos.</p>
        </div>
        
        {funnels.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Embudo Activo:</span>
            <select
              value={activeFunnelId}
              onChange={(e) => setActiveFunnelId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
            >
              {activeTab === "contacts" && (
                <>
                  <option value="all">📥 Consola General (Todos)</option>
                  <option value="limbo">⏸ En el Limbo (Sin embudo)</option>
                </>
              )}
              <optgroup label="Embudos Específicos">
                {funnels.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre} ({f.producto})</option>
                ))}
              </optgroup>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2 flex-shrink-0 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("contacts")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "contacts" ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          👤 Contactos CRM
        </button>
        <button 
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "templates" ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          💬 Mensajes del Bot
        </button>
        <button 
          onClick={() => setActiveTab("funnels")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "funnels" ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          🗂 Estructura de Embudos
        </button>
        <button 
          onClick={() => setActiveTab("conversion")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "conversion" ? "bg-white text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          📊 Conversión
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {funnels.length === 0 && !loadingFunnels ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
            <span className="text-4xl mb-4">🗂</span>
            <p className="mb-4">No hay embudos creados. Ejecutá el SQL en Supabase para crear el embudo por defecto.</p>
            <button onClick={() => window.location.reload()} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">
              Recargar página
            </button>
          </div>
        ) : (
          <>
            {activeTab === "contacts" && <ContactsView activeFunnelId={activeFunnelId} funnels={funnels} />}
            {activeTab === "templates" && <TemplatesView activeFunnelId={activeFunnelId} funnels={funnels} onRefresh={fetchFunnels} />}
            {activeTab === "funnels" && <FunnelsView funnels={funnels} onRefresh={() => window.location.reload()} />}
            {activeTab === "conversion" && <ConversionView activeFunnelId={activeFunnelId} funnels={funnels} />}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================
   1. VISTA CONTACTOS
========================================= */
function ContactsView({ activeFunnelId, funnels }: { activeFunnelId: string, funnels: any[] }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStepFilter, setActiveStepFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'info'>('chat');
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const activeFunnel = funnels.find(f => f.id === activeFunnelId);
  const steps = activeFunnel?.funnel_steps || [];

  const fetchContacts = async () => {
    // Si no hay funnel_id, no hacemos return, ya que ahora puede ser "all"
    setLoading(true);
    try {
      let url = `/api/crm/contacts?funnel_id=${activeFunnelId}`;
      if (activeFunnelId !== 'all' && activeFunnelId !== 'limbo' && activeFunnel) {
        url += `&tag=${encodeURIComponent(`Interesado ${activeFunnel.producto}`)}`;
      }
      if (activeStepFilter) url += `&step_id=${activeStepFilter}`;
      if (search) url += `&search=${search}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setContacts(data.contacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [activeFunnelId, activeStepFilter]); // se remueve search para no hacer fetch en cada tecla, se hará onEnter

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  const handleClearTestNumbers = async () => {
    if (!confirm("¿Estás seguro que querés eliminar todos los números marcados como prueba en este embudo?")) return;
    try {
      const res = await fetch(`/api/crm/contacts?is_test=true&funnel_id=${activeFunnelId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Números de prueba eliminados.");
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openContact = async (c: any) => {
    setSelectedContact(c);
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/crm/contacts/${c.id}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        setConversations(data.conversations || []);
        setSidebarTab('chat');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const changeContactStep = async (contactId: string, newStepId: string) => {
    try {
      await fetch(`/api/crm/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_step_id: newStepId })
      });
      fetchContacts();
      if (selectedContact?.id === contactId) openContact({ ...selectedContact, current_step_id: newStepId });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTestMode = async (contactId: string, is_test: boolean) => {
    try {
      await fetch(`/api/crm/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_test })
      });
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedContact) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/crm/conversations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          message: replyMessage
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setReplyMessage("");
        // Agregar el nuevo mensaje a la UI temporalmente o recargar
        setConversations(prev => [...prev, data.conversation]);
        // Refrescar contactos por si cambió el estado a humano
        fetchContacts();
        if (selectedContact.status !== 'humano') {
          setSelectedContact({ ...selectedContact, status: 'humano' });
        }
      } else {
        alert("Error al enviar: " + data.error);
      }
    } catch (err) {
      console.error("Error enviando mensaje", err);
      alert("Error enviando mensaje");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      <div className={`flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
              <input 
                type="text" 
                placeholder="Buscar por nombre o teléfono..." 
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="bg-zinc-800 px-4 rounded-lg text-sm font-medium hover:bg-zinc-700">Buscar</button>
            </form>
            <button 
              onClick={handleClearTestNumbers}
              className="flex items-center gap-2 bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              🧹 Limpiar Números de Prueba
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button 
              onClick={() => setActiveStepFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!activeStepFilter ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}
            >
              Todos
            </button>
            {steps.map((s: any) => (
              <button 
                key={s.id}
                onClick={() => setActiveStepFilter(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${activeStepFilter === s.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                {s.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Cargando contactos...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No se encontraron contactos.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950/50 text-zinc-500 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 font-medium">Teléfono / Nombre</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Etapa Actual</th>
                  <th className="px-4 py-3 font-medium">Última Actividad</th>
                  <th className="px-4 py-3 font-medium text-right">Prueba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {contacts.map(c => {
                  const step = c.funnel_steps;
                  const statusBadge = c.status === 'humano'
                    ? { label: '⚡ Humano', cls: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' }
                    : !c.current_step_id
                    ? { label: '⏸ Sin embudo', cls: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30' }
                    : { label: '🤖 Bot', cls: 'bg-green-500/10 text-green-400 border-green-500/20' };
                  return (
                    <tr key={c.id} onClick={() => openContact(c)} className={`cursor-pointer transition-colors ${selectedContact?.id === c.id ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white font-mono">{c.phone}</div>
                        <div className="text-xs text-zinc-500">{c.name || "Sin nombre"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusBadge.cls}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          className="bg-transparent border border-zinc-700 rounded px-2 py-1 text-xs font-medium focus:outline-none max-w-[150px] truncate"
                          style={{ color: step?.color || '#fff' }}
                          value={c.current_step_id || ""}
                          onChange={(e) => { e.stopPropagation(); changeContactStep(c.id, e.target.value); }}
                        >
                          <option value="">Sin etapa</option>
                          {activeFunnelId === "all" || activeFunnelId === "limbo" ? (
                            funnels.map(f => (
                              <optgroup key={f.id} label={f.nombre}>
                                {(f.funnel_steps || []).map((s: any) => (
                                  <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                              </optgroup>
                            ))
                          ) : (
                            steps.map((s: any) => (
                              <option key={s.id} value={s.id} style={{ color: '#fff' }}>{s.nombre}</option>
                            ))
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {new Date(c.updated_at).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input 
                          type="checkbox" 
                          checked={c.is_test} 
                          onChange={(e) => { e.stopPropagation(); toggleTestMode(c.id, e.target.checked); }}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedContact && (
        <div className="w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden animate-slide-in">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <div>
                <h3 className="font-bold text-white">{selectedContact.phone}</h3>
                {selectedContact.status === 'humano' && (
                  <span className="text-xs font-semibold text-red-400 animate-pulse">⚡ Requiere atención humana</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedContact.status === 'humano' ? (
                <button
                  onClick={async () => {
                    await fetch(`/api/crm/contacts/${selectedContact.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'bot' }) });
                    fetchContacts();
                    setSelectedContact({ ...selectedContact, status: 'bot' });
                  }}
                  className="text-xs bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1 rounded-lg transition-colors"
                >
                  🤖 Devolver al Bot
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await fetch(`/api/crm/contacts/${selectedContact.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'humano' }) });
                    fetchContacts();
                    setSelectedContact({ ...selectedContact, status: 'humano' });
                  }}
                  className="text-xs bg-orange-600/50 hover:bg-orange-600 text-white font-semibold px-3 py-1 rounded-lg transition-colors border border-orange-600"
                >
                  ⏸ Pausar Bot
                </button>
              )}
              
              <button
                onClick={async () => {
                  if(!confirm("¿Eliminar este contacto permanentemente?")) return;
                  await fetch(`/api/crm/contacts/${selectedContact.id}`, { method: 'DELETE' });
                  fetchContacts();
                  setSelectedContact(null);
                }}
                className="text-xs bg-red-600/30 hover:bg-red-600 text-red-200 font-semibold p-1.5 rounded-lg transition-colors"
                title="Eliminar Contacto"
              >
                🗑️
              </button>

              <button onClick={() => setSelectedContact(null)} className="text-zinc-500 hover:text-white text-xl leading-none ml-2">&times;</button>
            </div>
          </div>
          <div className="flex border-b border-zinc-800 bg-zinc-950 px-4 pt-2 gap-4 flex-shrink-0">
            <button className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${sidebarTab === 'chat' ? 'border-zinc-300 text-white' : 'border-transparent text-zinc-500'}`} onClick={() => setSidebarTab('chat')}>Chat en Vivo</button>
            <button className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${sidebarTab === 'info' ? 'border-zinc-300 text-white' : 'border-transparent text-zinc-500'}`} onClick={() => setSidebarTab('info')}>Info & Eventos</button>
          </div>

          {sidebarTab === 'info' && (
            <>
              <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/50 flex-shrink-0 space-y-2">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Nombre</div>
                <div className="text-sm font-medium">{selectedContact.name || "-"}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mt-2">Etapa</div>
                <div className="text-sm font-medium flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedContact.funnel_steps?.color || '#999' }}></span>
                   {selectedContact.funnel_steps?.nombre || "Sin etapa"}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mt-2">Notas</div>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 resize-none focus:border-zinc-600 focus:outline-none"
                  rows={3}
                  defaultValue={selectedContact.notas || ""}
                  onBlur={(e) => {
                    fetch(`/api/crm/contacts/${selectedContact.id}`, { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notas: e.target.value }) });
                  }}
                  placeholder="Agregar notas del cliente..."
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/30">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Historial de Eventos</h4>
                {loadingEvents ? (
                  <div className="text-center text-zinc-500 text-xs">Cargando eventos...</div>
                ) : events.length === 0 ? (
                  <div className="text-center text-zinc-600 text-xs italic">No hay eventos registrados</div>
                ) : (
                  <div className="relative border-l border-zinc-800 ml-3 space-y-6 pb-4">
                    {events.map((e: any) => (
                      <div key={e.id} className="relative pl-5">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-zinc-800 border-2 border-zinc-950"></span>
                        <div className="text-xs text-zinc-500 mb-0.5">{new Date(e.created_at).toLocaleString('es-AR')}</div>
                        <div className="text-sm font-semibold text-white mb-1">{e.tipo.replace(/_/g, " ").toUpperCase()}</div>
                        <div className="text-xs text-zinc-400 bg-zinc-900/80 p-2 rounded border border-zinc-800/50">{e.descripcion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarTab === 'chat' && (
            <div className="flex-1 flex flex-col bg-[#0b141a] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar" style={{ backgroundImage: 'url("https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.95 }}>
                {loadingEvents ? (
                  <div className="text-center text-zinc-500 text-xs bg-zinc-900/80 rounded-lg p-2 self-center backdrop-blur-md">Cargando chat...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-zinc-500 text-xs bg-zinc-900/80 rounded-lg p-2 self-center backdrop-blur-md">No hay mensajes registrados</div>
                ) : (
                  conversations.map((msg: any) => {
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-md ${isOutbound ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}`}>
                           {msg.type !== 'text' && <span className="text-xs opacity-70 block mb-1 tracking-widest font-mono">[{msg.type.toUpperCase()}]</span>}
                           <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                           <div className="text-[10px] opacity-60 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {/* Chat Reply Input */}
              <div className="p-3 bg-[#1f2c34] flex-shrink-0 flex items-center gap-2">
                <form onSubmit={handleSendMessage} className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-[#2a3942] text-[#d1d7db] rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                    disabled={isSending}
                  />
                  <button 
                    type="submit" 
                    disabled={isSending || !replyMessage.trim()}
                    className="bg-[#00a884] text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center justify-center hover:bg-[#008f6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? "⌛" : "Enviar"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================
   2. VISTA TEMPLATES
========================================= */
function TemplatesView({ activeFunnelId, funnels, onRefresh }: { activeFunnelId: string, funnels: any[], onRefresh: () => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeFunnel = funnels.find(f => f.id === activeFunnelId);
  const steps = activeFunnel?.funnel_steps || [];

  const fetchTemplates = async (showLoading = true) => {
    if (!activeFunnelId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/crm/templates?funnel_id=${activeFunnelId}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(true);
  }, [activeFunnelId]);

  const updateStep = async (id: string, updates: any) => {
    try {
      await fetch(`/api/crm/steps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      onRefresh(); // Actualiza funnels en background sin parpadear
    } catch (err) {
      console.error(err);
    }
  };

  const updateTemplate = async (id: string, updates: any) => {
    try {
      await fetch(`/api/crm/templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      fetchTemplates(false);
    } catch (err) {
      console.error(err);
    }
  };

  const createMissingTemplate = async (step: any) => {
    try {
      await fetch(`/api/crm/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnel_id: activeFunnelId,
          step_id: step.id,
          trigger_key: step.key,
          nombre: `Mensaje: ${step.nombre}`,
          mensaje: "Escribe aquí el mensaje automático...",
          orden: step.orden
        })
      });
      fetchTemplates(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Mapeamos las plantillas a las etapas. Si una etapa no tiene plantilla, permitimos crearla.
  return (
    <div className="h-full overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl text-blue-200 text-sm flex gap-3 items-start">
          <span className="text-xl">ℹ️</span>
          <p>
            Aquí puedes configurar los mensajes automáticos que enviará el bot en cada etapa. 
            El bot usa el <strong>Trigger Key</strong> de la etapa para saber qué mensaje enviar.
            Puedes usar variables como <code>{"{nombre}"}</code> en el texto.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-10">Cargando mensajes...</div>
        ) : (
          steps.map((step: any) => {
            const template = templates.find(t => t.trigger_key === step.key);

            return (
              <div key={step.id} className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: step.color }}></span>
                    <h3 className="font-bold text-white">{step.nombre}</h3>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono border border-zinc-700">key: {step.key}</span>
                  </div>
                  {template && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500">Activo</span>
                      <input 
                        type="checkbox" 
                        checked={template.activo} 
                        onChange={(e) => updateTemplate(template.id, { activo: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {!template ? (
                     <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg">
                        <p className="text-zinc-500 text-sm mb-3">No hay mensaje configurado para esta etapa.</p>
                        <button 
                          onClick={() => createMissingTemplate(step)}
                          className="bg-white text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-zinc-200"
                        >
                          + Crear Plantilla de Mensaje
                        </button>
                     </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* Mensaje de la Plantilla */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Plantilla Oficial</label>
                        <textarea 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-200 font-mono resize-y min-h-[120px] focus:outline-none focus:border-zinc-600"
                          defaultValue={template.mensaje}
                          onBlur={(e) => {
                            if (e.target.value !== template.mensaje) {
                              updateTemplate(template.id, { mensaje: e.target.value });
                            }
                          }}
                        />
                      </div>

                      {/* Configuraciones de IA Guardián */}
                      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🤖</span>
                          <h4 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Guardián IA de Etapa</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-500">Objetivo para Avanzar (ai_goal)</label>
                            <textarea 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 resize-y focus:outline-none focus:border-zinc-600 h-20"
                              placeholder="Ej: El cliente debe confirmar que quiere recibir la demo..."
                              defaultValue={step.ai_goal || ""}
                              onBlur={(e) => {
                                if (e.target.value !== (step.ai_goal || "")) {
                                  updateStep(step.id, { ai_goal: e.target.value });
                                }
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-zinc-500">Intenciones Válidas (ai_valid_intents)</label>
                            <textarea 
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 resize-y focus:outline-none focus:border-zinc-600 h-20"
                              placeholder="Ej: quiero la demo, mandamela, pasame info..."
                              defaultValue={step.ai_valid_intents || ""}
                              onBlur={(e) => {
                                if (e.target.value !== (step.ai_valid_intents || "")) {
                                  updateStep(step.id, { ai_valid_intents: e.target.value });
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-zinc-500">FAQ Permitidas (ai_faq)</label>
                          <textarea 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 resize-y focus:outline-none focus:border-zinc-600 h-16"
                            placeholder="Ej: Sí, sirve para avícolas. No tiene mensualidad..."
                            defaultValue={step.ai_faq || ""}
                            onBlur={(e) => {
                              if (e.target.value !== (step.ai_faq || "")) {
                                updateStep(step.id, { ai_faq: e.target.value });
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* FIN Configuraciones de IA Guardián */}

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Última actualización de plantilla: {new Date(template.updated_at).toLocaleString('es-AR')}</span>
                        <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Se guarda automáticamente al quitar el foco</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}

/* =========================================
   3. VISTA ESTRUCTURA (Funnels)
========================================= */
function FunnelsView({ funnels, onRefresh }: { funnels: any[], onRefresh: () => void }) {
  const [isCloning, setIsCloning] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  const deleteStep = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que querés eliminar la etapa "${name}"?\n\nLos contactos que estén en esta etapa quedarán sin etapa asignada.`)) return;
    setIsDeletingStep(true);
    try {
      const res = await fetch(`/api/crm/steps/${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingStep(false);
    }
  };

  const cloneFunnel = async (id: string, name: string) => {
    if (!name.trim()) return;
    setIsCloning(true);
    try {
      const res = await fetch("/api/crm/funnels/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnel_id: id, new_name: name })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCloning(false);
    }
  };

  const updateFunnel = async (id: string, updates: any) => {
    try {
      await fetch(`/api/crm/funnels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 max-w-4xl mx-auto space-y-8">
      {funnels.map(funnel => (
        <div key={funnel.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: funnel.color }}></span>
                {funnel.nombre}
              </h3>
              <p className="text-zinc-400 text-sm">{funnel.descripcion} — Producto: <span className="font-mono text-zinc-300">{funnel.producto}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  const cloneName = prompt("Nombre para el nuevo embudo clonado:", `${funnel.nombre} (Copia)`);
                  if (cloneName) cloneFunnel(funnel.id, cloneName);
                }}
                disabled={isCloning}
                className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isCloning ? "⏳" : "📑 Duplicar"}
              </button>
              <div className="text-xs text-zinc-600 font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                ID: {funnel.id.split("-")[0]}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Etapas del Embudo (Secuencia)</h4>
            {funnel.funnel_steps.map((step: any, index: number) => (
              <div key={step.id} className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs">
                  {step.orden}
                </div>
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: step.color }}></div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{step.nombre}</div>
                  <div className="text-xs text-zinc-500">{step.descripcion}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingStep(step)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs"
                  >
                    ✏️ Editar Seguimientos
                  </button>
                  <button 
                    onClick={() => deleteStep(step.id, step.nombre)}
                    disabled={isDeletingStep}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs disabled:opacity-50"
                  >
                    🗑️
                  </button>
                  <div className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono ml-2">
                    {step.key}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg">🧠</span> Cerebro del Bot Experto (RAG)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Prompt de Personalidad (System Prompt)</label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono resize-y min-h-[120px] focus:outline-none focus:border-zinc-600"
                  placeholder="Ej: Sos un vendedor empático. Usá viñetas y emojis. Respondé corto y claro."
                  defaultValue={funnel.bot_prompt || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (funnel.bot_prompt || "")) {
                      updateFunnel(funnel.id, { bot_prompt: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Base de Conocimiento (Knowledge Base)</label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono resize-y min-h-[120px] focus:outline-none focus:border-zinc-600"
                  placeholder="Pegá aquí todas las especificaciones técnicas, compatibilidades, precios y reglas de venta del producto..."
                  defaultValue={funnel.knowledge_base || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (funnel.knowledge_base || "")) {
                      updateFunnel(funnel.id, { knowledge_base: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
            <div className="text-xs text-green-500 font-medium bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20 inline-block">
              Se guarda automáticamente al quitar el cursor del cuadro.
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
             <p className="text-xs text-zinc-500 italic">El constructor visual drag & drop estará disponible en la próxima actualización.</p>
          </div>
        </div>
      ))}

      {editingStep && (
        <StepEditorModal 
          step={editingStep} 
          onClose={() => setEditingStep(null)} 
          onRefresh={onRefresh} 
        />
      )}
    </div>
  );
}

/* =========================================
   4. VISTA CONVERSIÓN
========================================= */
function ConversionView({ activeFunnelId, funnels }: { activeFunnelId: string, funnels: any[] }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeFunnel = funnels.find(f => f.id === activeFunnelId);
  const steps = activeFunnel?.funnel_steps || [];

  useEffect(() => {
    const fetchContacts = async () => {
      if (!activeFunnelId) return;
      try {
        const res = await fetch(`/api/crm/contacts?funnel_id=${activeFunnelId}&is_test=false`);
        const data = await res.json();
        if (data.success) setContacts(data.contacts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [activeFunnelId]);

  if (loading) return <div className="p-8 text-center text-zinc-500">Calculando métricas...</div>;

  const totalLeads = contacts.length;
  
  // Calculate counts per step
  const stepCounts = steps.map((step: any) => {
    const count = contacts.filter(c => c.current_step_id === step.id).length;
    return { ...step, count };
  });

  return (
    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total Leads Reales</div>
          <div className="text-4xl font-black text-white">{totalLeads}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Tasa de Conversión (a Compra)</div>
          <div className="text-4xl font-black text-green-400">
            {totalLeads > 0 
              ? Math.round((contacts.filter(c => c.funnel_steps?.key === 'compro').length / totalLeads) * 100) 
              : 0}%
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Salud del Embudo</div>
          <div className="text-xl font-bold text-blue-400 mt-3 flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span> Activo
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-6 text-center">Pipeline de Distribución Actual</h3>
      <div className="flex flex-col gap-3">
        {stepCounts.map((s: any, idx: number) => {
          const percentage = totalLeads > 0 ? (s.count / totalLeads) * 100 : 0;
          return (
            <div key={s.id} className="relative w-full h-16 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center px-4 group">
              <div 
                className="absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-1000 ease-out" 
                style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: s.color }}
              ></div>
              <div className="relative z-10 flex w-full justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-zinc-950 border border-zinc-800 text-zinc-500">{s.orden}</span>
                  <span className="font-bold text-white">{s.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 shadow-inner">
                    {s.count} <span className="text-zinc-500 font-normal">leads</span>
                  </span>
                  <span className="text-xs text-zinc-500 font-mono w-12 text-right">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
