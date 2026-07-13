"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, MessageSquare, Users, BrainCircuit, Puzzle, Bot, 
  Database, GitMerge, Zap, BarChart, Plug, Store, Settings,
  Activity, CheckCircle2, AlertTriangle, TrendingUp, DollarSign,
  Smartphone, Server, Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'conversaciones', label: 'Conversaciones', icon: MessageSquare },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'knowledge', label: 'Knowledge Center', icon: BrainCircuit },
  { id: 'skills', label: 'Skills', icon: Puzzle },
  { id: 'agentes', label: 'Agentes', icon: Bot },
  { id: 'memory', label: 'Memory Center', icon: Database },
  { id: 'funnels', label: 'Funnels', icon: GitMerge },
  { id: 'automatizaciones', label: 'Automatizaciones', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'integraciones', label: 'Integraciones', icon: Plug },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function MissionControlUI() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar - Inspired by Linear / Stripe */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col justify-between backdrop-blur-sm">
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Ingenio AI</span>
            <Badge variant="outline" className="ml-auto text-[9px] uppercase tracking-widest border-primary/30 text-primary bg-primary/10">CORE</Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary shadow-[inset_2px_0_0_0_rgba(var(--primary),1)]' 
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border border-transparent hover:border-border/50">
              <Avatar className="w-9 h-9 border border-border/50">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">FOS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none mb-1">FerreOS</span>
                <span className="text-xs text-muted-foreground">Plan Premium</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        {/* Subtle gradient background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        
        <div className="p-8 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab !== 'dashboard' && (
                <div className="flex flex-col items-center justify-center h-[60vh] border border-dashed border-border/50 rounded-2xl bg-card/20">
                  <h2 className="text-2xl font-light text-muted-foreground mb-2">Sección en construcción</h2>
                  <p className="text-sm text-muted-foreground/70">Módulo: {activeTab}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-1">Mission Control</h1>
          <p className="text-muted-foreground text-sm">Monitoreo en tiempo real del ecosistema Ingenio AI.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          SYSTEM ONLINE
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Conversaciones Activas" value="142" trend="+12%" icon={MessageSquare} />
        <MetricCard title="Agentes Funcionando" value="5" icon={Bot} />
        <MetricCard title="Skills Ejecutadas" value="1,204" trend="+43%" icon={Puzzle} />
        <MetricCard title="Estado del Loop" value="HEALTHY" icon={Activity} highlight="text-green-500" />
      </div>

      {/* Commercial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Leads Nuevos (Hoy)" value="28" trend="+5%" icon={Users} />
        <MetricCard title="Tasa de Conversión" value="8.4%" trend="+1.2%" icon={TrendingUp} />
        <MetricCard title="Ventas Cerradas" value="$4,250" trend="+18%" icon={DollarSign} />
        <MetricCard title="Alertas IA" value="0" icon={AlertTriangle} highlight="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Status */}
        <Card className="col-span-1 bg-card/40 border-border/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow label="WhatsApp Gateway" status="Operational" />
            <StatusRow label="Hermes LLM" status="Operational" />
            <StatusRow label="KOS Loader" status="Operational" />
            <StatusRow label="CRM Sync" status="Operational" />
            <StatusRow label="Skill Engine" status="Operational" />
          </CardContent>
        </Card>

        {/* AI Consumption Metrics */}
        <Card className="col-span-2 bg-card/40 border-border/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Uso de Inteligencia Artificial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tokens Procesados (Este mes)</p>
                <p className="text-3xl font-light font-mono">1.24M</p>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full w-[45%]" />
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">45% del plan</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Costos IA Generados</p>
                <p className="text-3xl font-light font-mono">$18.42</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Dentro del margen operativo esperado
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-lg bg-secondary/30 border border-secondary flex items-center gap-4">
               <Network className="w-8 h-8 text-primary opacity-80" />
               <div>
                 <h4 className="text-sm font-medium">Executive Loop Multi-Tenant</h4>
                 <p className="text-xs text-muted-foreground mt-1">El KOS Loader está alimentando dinámicamente el prompt del sistema. 5 agentes activos en 3 tenants distintos.</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, highlight }: any) {
  return (
    <Card className="bg-card/40 border-border/50 hover:border-primary/30 transition-colors shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="p-1.5 rounded-md bg-secondary/50 text-muted-foreground">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl font-semibold tracking-tight ${highlight || 'text-foreground'}`}>{value}</h3>
          {trend && (
            <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, status }: any) {
  const isOk = status === 'Operational';
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono">{status}</span>
        <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}
