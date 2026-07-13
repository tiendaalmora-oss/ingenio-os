"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, MessageSquare, Puzzle, Users, CircleDollarSign, AlertCircle, RefreshCw } from "lucide-react";

export function AdminControlCenterUI() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/health/system-status');
      const data = await res.json();
      setHealthData(data);
    } catch (error) {
      console.error("Error fetching system status", error);
      // Fallback in case backend is totally down
      setHealthData({
        status: {
          waha: '🔴', hermes: '🔴', executiveLoop: '🔴', skillEngine: '🔴',
          knowledgeBundle: '🔴', postgresql: '🔴', webhook: '🔴', openai: '🔴',
          crm: '🔴', businessStudio: '🔴'
        },
        metrics: {
          conversaciones: 0, skills: 0, leads: 0, tokens: '0', costo: '$0', errores: 99
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !healthData) {
    return <div className="flex h-screen items-center justify-center bg-black text-white font-mono animate-pulse">CARGANDO ESTADO DEL SISTEMA...</div>;
  }

  const { status, metrics } = healthData;

  const getStatusColor = (val: string) => val === '🟢' ? 'text-green-500' : val === '🔴' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-white/20 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              <Server className="w-8 h-8" />
              SYSTEM CONTROL CENTER
            </h1>
            <p className="text-white/60 text-sm">Monitoreo de Infraestructura y Core Engines</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-white/20 text-white bg-white/5 font-mono">
              PING: 14ms
            </Badge>
            <button onClick={fetchHealth} className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* SYSTEM STATUS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold tracking-wider text-blue-400">STATUS</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(status).map(([key, val]: any) => (
              <Card key={key} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                  <span className="text-xs uppercase text-white/50 font-bold tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`text-2xl ${getStatusColor(val)} drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]`}>{val}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* METRICS */}
        <div className="space-y-4 mt-12">
          <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <BarChartIcon className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold tracking-wider text-purple-400">METRICS</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <MetricBox label="Conversaciones" value={metrics.conversaciones} icon={MessageSquare} />
            <MetricBox label="Skills" value={metrics.skills} icon={Puzzle} />
            <MetricBox label="Leads" value={metrics.leads} icon={Users} />
            <MetricBox label="Tokens" value={metrics.tokens} icon={null} />
            <MetricBox label="Costo" value={metrics.costo} icon={CircleDollarSign} />
            <MetricBox label="Errores" value={metrics.errores} icon={AlertCircle} color={metrics.errores > 0 ? 'text-red-500' : 'text-green-500'} />
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, color = "text-white" }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2">
      {Icon && <Icon className={`w-4 h-4 text-white/40 mb-1`} />}
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] uppercase text-white/50 tracking-widest">{label}</span>
    </div>
  );
}

// Simple icon for title
function BarChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
