"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, Package, Wrench, HelpCircle, ShieldAlert, 
  Tag, Brain, FileText, Share2, Puzzle, Plus, Save, Trash2, Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: 'empresa', label: 'Empresa', icon: Building, type: 'object' },
  { id: 'productos', label: 'Productos', icon: Package, type: 'array' },
  { id: 'servicios', label: 'Servicios', icon: Wrench, type: 'array' },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle, type: 'array' },
  { id: 'objeciones', label: 'Objeciones', icon: ShieldAlert, type: 'array' },
  { id: 'promociones', label: 'Promociones', icon: Tag, type: 'array' },
  { id: 'personalidad', label: 'Personalidad IA', icon: Brain, type: 'object' },
  { id: 'documentos', label: 'Documentos', icon: FileText, type: 'array' },
  { id: 'canales', label: 'Canales', icon: Share2, type: 'array' },
  { id: 'skills', label: 'Skills', icon: Puzzle, type: 'array' },
];

export function BusinessStudioUI() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [bundleData, setBundleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantId] = useState('ferreos'); // MVP tenant

  useEffect(() => {
    fetchBundle();
  }, []);

  const fetchBundle = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/business-studio/bundle', {
        headers: { 'x-tenant-id': tenantId }
      });
      const data = await res.json();
      setBundleData(data);
    } catch (error) {
      console.error("Error fetching bundle", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSection = async (sectionId: string, data: any) => {
    try {
      setIsSaving(true);
      const res = await fetch(`http://localhost:3000/business-studio/bundle/${sectionId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId 
        },
        body: JSON.stringify(data)
      });
      const updatedPrompt = await res.json();
      setBundleData(updatedPrompt);
    } catch (error) {
      console.error("Error saving section", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !bundleData) {
    return <div className="flex h-full items-center justify-center p-8"><div className="animate-pulse flex items-center gap-2"><Brain className="w-5 h-5 text-primary animate-bounce" /> Cargando Knowledge Bundle...</div></div>;
  }

  const currentData = bundleData[activeSection.id] || (activeSection.type === 'array' ? [] : {});

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-1">Business Studio</h1>
          <p className="text-muted-foreground text-sm">Centro de configuración del ecosistema. Los cambios se sincronizan en tiempo real con el KOS Loader.</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">Tenant: {tenantId.toUpperCase()}</Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sections Sidebar */}
        <div className="col-span-1 space-y-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection.id === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                    : 'bg-card/30 text-muted-foreground border-border/50 hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="col-span-1 md:col-span-3">
          <Card className="bg-card/40 border-border/50 backdrop-blur-sm shadow-xl min-h-[600px] flex flex-col">
            <CardHeader className="border-b border-border/30 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <activeSection.icon className="w-5 h-5 text-primary" />
                  {activeSection.label}
                </CardTitle>
                <CardDescription>
                  Configura y entrena al agente IA sobre tu {activeSection.label.toLowerCase()}.
                </CardDescription>
              </div>
              <Button onClick={() => fetchBundle()} variant="outline" size="sm" className="h-8">Recargar</Button>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeSection.type === 'array' ? (
                    <ArrayEditor 
                      sectionId={activeSection.id} 
                      data={currentData} 
                      onSave={(newData: any) => saveSection(activeSection.id, newData)}
                      isSaving={isSaving}
                    />
                  ) : (
                    <ObjectEditor 
                      sectionId={activeSection.id} 
                      data={currentData} 
                      onSave={(newData: any) => saveSection(activeSection.id, newData)}
                      isSaving={isSaving}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Generic Array Editor (CRUD for FAQs, Products, etc.)
function ArrayEditor({ sectionId, data, onSave, isSaving }: any) {
  const [items, setItems] = useState<any[]>(Array.isArray(data) ? data : []);

  const handleAdd = () => {
    setItems([...items, { id: Date.now().toString(), title: '', content: '' }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Registros ({items.length})</h3>
        <Button onClick={handleAdd} size="sm" className="gap-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"><Plus className="w-4 h-4" /> Agregar Nuevo</Button>
      </div>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-border/50 rounded-xl text-muted-foreground">
            No hay registros configurados en esta sección.
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id || idx} className="p-4 border border-border/50 rounded-xl bg-card/50 relative group">
              <button 
                onClick={() => handleRemove(idx)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="space-y-3 pr-8">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Título / Identificador</label>
                  <input 
                    type="text" 
                    value={item.title || ''} 
                    onChange={(e) => handleChange(idx, 'title', e.target.value)}
                    className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    placeholder="Ej. Precio de envío"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Contenido / Detalles</label>
                  <textarea 
                    value={item.content || ''} 
                    onChange={(e) => handleChange(idx, 'content', e.target.value)}
                    className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:border-primary/50"
                    placeholder="Ej. El envío es gratuito para compras mayores a $5000."
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-border/30 flex justify-end">
        <Button onClick={() => onSave(items)} disabled={isSaving} className="gap-2">
          {isSaving ? <span className="animate-spin text-lg">⚙</span> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

// Generic Object Editor (CRUD for Empresa, Personalidad, etc.)
function ObjectEditor({ sectionId, data, onSave, isSaving }: any) {
  const [content, setContent] = useState<string>(
    typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  );

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Configuración General</h3>
      </div>
      
      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Contexto del negocio (Instrucciones base)</label>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[400px] bg-background border border-border/50 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary/50 font-mono"
          placeholder={`Describe la ${sectionId}...`}
        />
      </div>

      <div className="pt-4 border-t border-border/30 flex justify-end">
        <Button 
          onClick={() => {
            try {
              const parsed = JSON.parse(content);
              onSave(parsed);
            } catch (e) {
              // If it's not valid JSON, save as plain string
              onSave(content);
            }
          }} 
          disabled={isSaving} 
          className="gap-2"
        >
          {isSaving ? <span className="animate-spin text-lg">⚙</span> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
