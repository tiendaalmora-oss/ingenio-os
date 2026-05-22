"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const mockTimeseries = [
  { date: "10 May", spend: 400, roas: 2.1 },
  { date: "11 May", spend: 300, roas: 2.4 },
  { date: "12 May", spend: 550, roas: 1.8 },
  { date: "13 May", spend: 450, roas: 2.9 },
  { date: "14 May", spend: 600, roas: 3.2 },
  { date: "15 May", spend: 500, roas: 3.8 },
  { date: "16 May", spend: 800, roas: 4.1 },
];

export function MetaOpsModule() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string>("");

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    setError(null);
    try {
      const res = await fetch("/api/meta-ads/accounts");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const acts = json.accounts || [];
      setAccounts(acts);
      if (acts.length > 0) {
        setAccountId(acts[0].id);
      }
    } catch (err: any) {
      setError("Error cargando cuentas de Meta: " + err.message);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchCampaigns = async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meta-ads/campaigns?accountId=${accountId}&datePreset=last_7d`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setCampaigns(json.data || []);
    } catch (err: any) {
      setError("Error cargando campañas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchCampaigns();
    }
  }, [accountId]);

  const selectedAccount = accounts.find((acc) => acc.id === accountId);

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Meta Ops Control</h2>
          <p className="text-zinc-400">Trading terminal para Meta Ads. Escala ganadores, apaga perdedores.</p>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          {loadingAccounts ? (
            <span className="text-zinc-500 text-sm animate-pulse">Cargando cuentas...</span>
          ) : accounts.length > 0 ? (
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 min-w-[280px]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency} - {acc.id})
                </option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              placeholder="act_ID de cuenta..." 
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 w-64"
            />
          )}
          <button 
            onClick={() => {
              if (accounts.length === 0) {
                fetchAccounts();
              } else {
                fetchCampaigns();
              }
            }}
            disabled={loading || loadingAccounts}
            className="bg-[#0668E1] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#0556bd] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Account Info Cards */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Nombre de Cuenta</span>
            <div className="text-lg font-bold text-white truncate">{selectedAccount.name}</div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">{selectedAccount.id}</div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Inversión Histórica</span>
            <div className="text-2xl font-mono font-bold text-white">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: selectedAccount.currency || 'USD' }).format(parseFloat(selectedAccount.amount_spent || '0') / 100)}
            </div>
            <span className="text-xs text-zinc-400 mt-1 block">Moneda: {selectedAccount.currency}</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Estado de Cuenta</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedAccount.account_status === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-lg font-bold text-white">
                {selectedAccount.account_status === 1 ? 'Activa' : 
                 selectedAccount.account_status === 2 ? 'Deshabilitada' : 
                 selectedAccount.account_status === 3 ? 'Pendiente de Pago' : 'Inactiva'}
              </span>
            </div>
            <span className="text-xs text-zinc-400 mt-1 block">Balance pendiente: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: selectedAccount.currency || 'USD' }).format(parseFloat(selectedAccount.balance || '0') / 100)}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Global Performance Timeseries */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Tendencia Global de la Cuenta (Gasto vs ROAS)</h3>
            <span className="text-xs text-zinc-500">Últimos 7 Días</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTimeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}x`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="spend" name="Gasto Diario" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Campaigns Table */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Campañas Activas</h3>
            {loading && <span className="text-xs text-blue-400 animate-pulse">Sincronizando vía Graph API...</span>}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Campaña</th>
                <th className="px-6 py-4 font-semibold text-right">Gasto</th>
                <th className="px-6 py-4 font-semibold text-right">CPA</th>
                <th className="px-6 py-4 font-semibold text-right">ROAS</th>
                <th className="px-6 py-4 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {campaigns.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No hay campañas activas en esta cuenta. Seleccione una cuenta y sincronice.
                  </td>
                </tr>
              ) : (
                campaigns.map((c, i) => {
                  const roas = c.purchase_roas?.[0]?.value ? parseFloat(c.purchase_roas[0].value) : 0;
                  const spend = parseFloat(c.spend || "0");
                  const purchases = c.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;
                  const cpa = purchases > 0 ? spend / purchases : 0;
                  
                  return (
                    <tr key={c.campaign_id || i} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {c.campaign_name}
                        <div className="text-xs text-zinc-500 font-normal mt-1 text-mono">{c.campaign_id}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">${spend.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono">${cpa.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono font-bold px-2 py-1 rounded ${
                          roas > 3 ? 'text-green-400 bg-green-400/10' : 
                          roas > 1.5 ? 'text-yellow-400 bg-yellow-400/10' : 
                          'text-red-400 bg-red-400/10'
                        }`}>
                          {roas > 0 ? roas.toFixed(2) + "x" : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="flex items-center justify-end gap-2 text-xs">
                          <span className={`w-2 h-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          {c.status === 'ACTIVE' ? 'ACTIVA' : c.status || 'ACTIVA'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
