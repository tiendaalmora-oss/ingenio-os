"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, Trash2, Edit3, Check, X, Building2, Store, Package, Users, Settings, Tag, MessageCircle, AlertTriangle, Info, Bot, RefreshCw,
  Wrench, HelpCircle, ShieldAlert, Brain, FileText, Share2, Puzzle, ChevronRight
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

const SECTIONS = [
  { id: 'empresa',      label: 'Empresa',         icon: Building2,    type: 'object',   description: 'Información general del negocio' },
  { id: 'productos',    label: 'Productos',        icon: Package,      type: 'array',    description: 'Catálogo de productos' },
  { id: 'servicios',    label: 'Servicios',        icon: Wrench,       type: 'array',    description: 'Servicios que ofrecemos' },
  { id: 'precios',      label: 'Precios',          icon: Tag,          type: 'array',    description: 'Lista de precios' },
  { id: 'objeciones',   label: 'Objeciones',       icon: ShieldAlert,  type: 'array',    description: 'Cómo manejar objeciones' },
  { id: 'promociones',  label: 'Promociones',      icon: Tag,          type: 'array',    description: 'Ofertas y descuentos activos' },
  { id: 'faqs',         label: 'FAQs',             icon: HelpCircle,   type: 'array',    description: 'Preguntas frecuentes' },
  { id: 'personalidad', label: 'Personalidad',     icon: Brain,        type: 'object',   description: 'Tono y estilo de comunicación de la IA' },
  { id: 'restricciones',label: 'Restricciones',    icon: ShieldAlert,  type: 'array',    description: 'Lo que el agente NO debe hacer' },
  { id: 'documentos',  label: 'Documentos',        icon: FileText,     type: 'array',    description: 'Archivos y referencias' },
  { id: 'canales',      label: 'Canales',          icon: Share2,       type: 'array',    description: 'Canales de comunicación' },
  { id: 'skills',       label: 'Skills',           icon: Puzzle,       type: 'array',    description: 'Capacidades del agente' },
];

export function BusinessStudioUI() {
  const [bundleData, setBundleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('empresa');
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const { tenantId } = useTenant();

  useEffect(() => { fetchBundle(); }, []);

  const fetchBundle = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/business-studio/bundle', {
        headers: { 'x-tenant-id': tenantId }
      });
      const data = await res.json();
      setBundleData(data);
    } catch {
      setBundleData({});
    } finally {
      setIsLoading(false);
    }
  };

  const saveSection = async (sectionId: string, data: any) => {
    setIsSaving(sectionId);
    try {
      await fetch(`http://localhost:3000/business-studio/bundle/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify(data)
      });
      await fetchBundle();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#9CA3AF]">
          <Brain className="w-5 h-5 animate-pulse text-[#4F8CFF]" />
          <span className="text-sm">Cargando Knowledge Bundle...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-2">
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#4F8CFF] uppercase tracking-widest mb-2">Business Studio</p>
        <p className="text-[#9CA3AF] text-sm">
          Configura el conocimiento de tu agente. Cada cambio se sincroniza con el KOS Loader en tiempo real.
        </p>
      </div>

      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const isOpen = expandedSection === section.id;
        const currentData = bundleData?.[section.id] ?? (section.type === 'array' ? [] : '');

        return (
          <div
            key={section.id}
            className="rounded-[18px] overflow-hidden transition-all duration-200"
            style={{
              background: '#181818',
              border: `1px solid ${isOpen ? 'rgba(79,140,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {/* Accordion Header */}
            <button
              onClick={() => setExpandedSection(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: isOpen ? 'rgba(79,140,255,0.15)' : 'rgba(255,255,255,0.04)' }}
                >
                  <Icon className={`w-4 h-4 ${isOpen ? 'text-[#4F8CFF]' : 'text-[#9CA3AF]'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isOpen ? 'text-white' : 'text-[#9CA3AF]'}`}>{section.label}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{section.description}</p>
                </div>
              </div>
              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </motion.div>
            </button>

            {/* Accordion Body */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="px-5 pb-5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="pt-4">
                      {section.type === 'array' ? (
                        <ArrayEditor
                          data={currentData}
                          onSave={(d) => saveSection(section.id, d)}
                          isSaving={isSaving === section.id}
                        />
                      ) : (
                        <ObjectEditor
                          data={currentData}
                          onSave={(d) => saveSection(section.id, d)}
                          isSaving={isSaving === section.id}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ArrayEditor({ data, onSave, isSaving }: { data: any[]; onSave: (d: any) => void; isSaving: boolean }) {
  const [items, setItems] = useState<any[]>(Array.isArray(data) ? data : []);

  const add = () => setItems([...items, { id: Date.now().toString(), title: '', content: '' }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    setItems(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div
          className="py-8 text-center rounded-[14px] text-sm text-[#9CA3AF]"
          style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          Sin registros. Agrega el primero.
        </div>
      ) : (
        items.map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative rounded-[14px] p-4 space-y-3"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={() => remove(i)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#9CA3AF] hover:text-[#EF4444]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input
              value={item.title || ''}
              onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Título"
              className="w-full bg-transparent text-sm text-white placeholder:text-[#9CA3AF] outline-none border-b pb-2"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            />
            <textarea
              value={item.content || ''}
              onChange={(e) => update(i, 'content', e.target.value)}
              placeholder="Contenido o descripción..."
              rows={2}
              className="w-full bg-transparent text-sm text-[#9CA3AF] placeholder:text-[#9CA3AF] outline-none resize-none"
            />
          </motion.div>
        ))
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={add}
          className="flex items-center gap-2 text-xs text-[#4F8CFF] hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar
        </button>
        <SaveButton onClick={() => onSave(items)} loading={isSaving} />
      </div>
    </div>
  );
}

function ObjectEditor({ data, onSave, isSaving }: { data: any; onSave: (d: any) => void; isSaving: boolean }) {
  const [content, setContent] = useState(
    typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  );

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="w-full text-sm text-[#9CA3AF] outline-none resize-none rounded-[14px] p-4"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'var(--font-geist-mono)',
        }}
        placeholder="Describe esta sección o pega un JSON..."
      />
      <div className="flex justify-end">
        <SaveButton onClick={() => {
          try { onSave(JSON.parse(content)); }
          catch { onSave(content); }
        }} loading={isSaving} />
      </div>
    </div>
  );
}

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-[10px] text-white transition-all"
      style={{
        background: loading ? 'rgba(79,140,255,0.4)' : '#4F8CFF',
        boxShadow: '0 4px 14px rgba(79,140,255,0.25)',
      }}
    >
      {loading ? (
        <span className="animate-spin">⊙</span>
      ) : (
        <Save className="w-3.5 h-3.5" />
      )}
      Guardar
    </motion.button>
  );
}
