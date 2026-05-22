"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

const ecosystemData = [
  { month: "Ene", mrr: 4000, spend: 2400 },
  { month: "Feb", mrr: 4500, spend: 2200 },
  { month: "Mar", mrr: 5800, spend: 2800 },
  { month: "Abr", mrr: 7200, spend: 3100 },
  { month: "May", mrr: 8100, spend: 3100 },
];

const decisionMatrix = [
  {
    saas: "Carnigestion",
    mrr: 5200,
    spend: 1200,
    roas: 4.33,
    cac: 12,
    status: "healthy",
    action: "ESCALAR PRESUPUESTO",
    actionColor: "text-green-400 bg-green-900/30 border-green-500/50"
  },
  {
    saas: "LavaPro",
    mrr: 800,
    spend: 1000,
    roas: 0.80,
    cac: 45,
    status: "critical",
    action: "PAUSAR CAMPAÑA",
    actionColor: "text-red-400 bg-red-900/30 border-red-500/50"
  },
  {
    saas: "VerdePro",
    mrr: 2100,
    spend: 900,
    roas: 2.33,
    cac: 25,
    status: "warning",
    action: "OPTIMIZAR CREATIVOS",
    actionColor: "text-yellow-400 bg-yellow-900/30 border-yellow-500/50"
  }
];

export function MetricsModule() {
  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Motor de Decisiones Global</h2>
        <p className="text-zinc-400">Recomendaciones algorítmicas basadas en la salud del ecosistema.</p>
      </div>

      {/* Actionable Alerts */}
      <div className="grid md:grid-cols-3 gap-4">
        {decisionMatrix.map((item, i) => (
          <div key={i} className={`p-5 rounded-xl border bg-zinc-950 ${
            item.status === 'critical' ? 'border-red-900/50' : 
            item.status === 'healthy' ? 'border-green-900/50' : 'border-zinc-800'
          }`}>
            <div className="text-sm font-semibold text-zinc-500 mb-1">{item.saas}</div>
            <div className="flex justify-between items-baseline mb-4">
              <div className="text-2xl font-bold">${item.mrr} <span className="text-sm text-zinc-500 font-normal">MRR</span></div>
              <div className="text-sm">ROAS: {item.roas}x</div>
            </div>
            <div className={`px-3 py-2 rounded-lg text-xs font-bold border text-center ${item.actionColor}`}>
              {item.action}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Ecosystem Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Crecimiento del Ecosistema (MRR vs Inversión)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ecosystemData}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Legend />
                <Area type="monotone" dataKey="mrr" name="MRR Total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                <Area type="monotone" dataKey="spend" name="Inversión Ads" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Salud Financiera</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <div className="text-zinc-500 text-sm mb-1">MRR Global</div>
              <div className="text-4xl font-bold text-white">$8,100</div>
              <div className="text-green-400 text-sm mt-1">↑ 12.5% vs mes anterior</div>
            </div>
            <div className="w-full h-px bg-zinc-800"></div>
            <div>
              <div className="text-zinc-500 text-sm mb-1">Inversión Total en Ads</div>
              <div className="text-3xl font-bold text-white">$3,100</div>
              <div className="text-zinc-400 text-sm mt-1">Estable vs mes anterior</div>
            </div>
            <div className="w-full h-px bg-zinc-800"></div>
            <div>
              <div className="text-zinc-500 text-sm mb-1">ROAS Global Promedio</div>
              <div className="text-3xl font-bold text-white">2.61x</div>
              <div className="text-green-400 text-sm mt-1">Saludable</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
