"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { auditSingleEntity } from "@/lib/radar/auditEngine";

export default function CreativeRadarClient({ slug, product }: { slug: string, product: any }) {
  const [ads, setAds] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [analyzingAdId, setAnalyzingAdId] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/meta-ads/accounts");
      const json = await res.json();
      const acts = json.accounts || [];
      setAccounts(acts);
      if (acts.length > 0 && !accountId) {
        setAccountId(acts[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchRadarAds = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/meta-ads/radar/${slug}?accountId=${accountId}`);
      const json = await res.json();
      setAds(json.data || []);
      setAiResults({}); // clear old analysis on refresh
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAd = async (ad: any) => {
    setAnalyzingAdId(ad.ad_id);
    try {
      const res = await fetch("/api/ai/analyze-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad, slug })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiResults(prev => ({ ...prev, [ad.ad_id]: data.analysis }));
      }
    } catch (err) {
      console.error("Error analyzing ad:", err);
    } finally {
      setAnalyzingAdId(null);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchRadarAds();
    }
  }, [slug, accountId]);

  const handleSidebarSelect = (mod: string) => {
    window.location.href = `/?module=${mod}`;
  };

  const getAiState = (ad: any, auditRecs: any[]) => {
    const hasCritical = auditRecs.some(r => r.severity === 'critical');
    const hasFatigue = auditRecs.some(r => r.id.includes('freq'));
    const isScale = auditRecs.some(r => r.severity === 'opportunity');
    const spend = parseFloat(ad.spend || '0');
    
    if (spend < 50) return { label: 'SIN DATA', color: 'bg-zinc-500', text: 'text-zinc-400', border: 'border-zinc-500' };
    if (hasFatigue) return { label: 'FATIGA', color: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' };
    if (hasCritical) return { label: 'APAGAR', color: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
    if (isScale) return { label: 'ESCALAR', color: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' };
    return { label: 'OBSERVAR', color: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  };

  const calculateScore = (ad: any, auditRecs: any[]) => {
    let score = 50;
    const ctr = parseFloat(ad.ctr || '0');
    const roas = ad.purchase_roas?.[0]?.value ? parseFloat(ad.purchase_roas[0].value) : 0;
    
    if (ctr > 2) score += 20;
    if (ctr < 1) score -= 20;
    if (roas > 3) score += 30;
    if (roas > 1.5 && roas <= 3) score += 10;
    
    auditRecs.forEach(rec => {
      if (rec.severity === 'critical') score -= 25;
      if (rec.id.includes('freq')) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  };

  return (
    <main className="bg-zinc-950 text-white min-h-screen flex overflow-hidden">
      <Sidebar activeModule={"creative_radar"} onSelect={handleSidebarSelect} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <TopBar title={`Creative Radar 📡 : ${product?.name || slug}`} />

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold mb-1">Radar Operacional</h2>
              <p className="text-sm text-zinc-400">Inteligencia basada en métricas a nivel creativo individual.</p>
            </div>
            <div className="flex gap-4 items-center">
              {accounts.length > 0 && (
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 min-w-[200px]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={fetchRadarAds} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded text-sm transition-colors">
                🔄 Refrescar Insights
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Gasto Hoy</span>
              <div className="text-xl font-mono text-white mt-1">$2,510.50</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Ventas</span>
              <div className="text-xl font-mono text-white mt-1">50</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">ROAS Prom.</span>
              <div className="text-xl font-mono text-green-400 mt-1">2.8x</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 border-t-2 border-t-green-500">
              <span className="text-[10px] text-green-500/80 font-bold tracking-widest uppercase">Listos p/ Escalar</span>
              <div className="text-xl font-mono text-green-400 mt-1">2</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 border-t-2 border-t-purple-500">
              <span className="text-[10px] text-purple-500/80 font-bold tracking-widest uppercase">Fatiga Detectada</span>
              <div className="text-xl font-mono text-purple-400 mt-1">1</div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-zinc-500 animate-pulse py-8">Analizando señales operacionales...</div>
            ) : ads.map((ad) => {
              const audits = auditSingleEntity(ad, 'ad');
              const state = getAiState(ad, audits);
              const score = calculateScore(ad, audits);
              const spend = parseFloat(ad.spend || "0");
              const ctr = parseFloat(ad.ctr || "0");
              const roas = ad.purchase_roas?.[0]?.value ? parseFloat(ad.purchase_roas[0].value) : 0;
              const purchases = ad.actions?.find((a:any) => a.action_type === 'purchase')?.value || 0;
              const isAnalyzing = analyzingAdId === ad.ad_id;
              const llmResult = aiResults[ad.ad_id];
              
              let aiText = "Rendimiento estándar. Mantener observación.";
              let aiClass = "text-zinc-400";
              if (state.label === 'ESCALAR') {
                aiText = "Score alto. Oportunidad matemática de escalar.";
                aiClass = "text-green-400";
              } else if (state.label === 'FATIGA') {
                aiText = `Frecuencia alta detectada (${ad.frequency}). Posible agotamiento.`;
                aiClass = "text-purple-400";
              } else if (state.label === 'APAGAR') {
                aiText = "Score crítico. Posible pérdida de dinero.";
                aiClass = "text-red-400";
              }

              return (
                <div key={ad.ad_id} className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-800/40 transition-colors border-l-4 ${state.border}`}>
                  <div className="grid grid-cols-12 gap-6 items-start">
                    {/* INFO PRINCIPAL: ESTADO MATEMÁTICO */}
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-current bg-opacity-10 ${state.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${state.color}`}></span>
                          {state.label}
                        </span>
                        <div className="w-20 bg-zinc-800 rounded-full h-1.5 flex-1 max-w-[80px]">
                          <div className={`h-1.5 rounded-full ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{score}</span>
                      </div>
                      
                      <div className={`text-xs font-medium leading-relaxed mb-4 ${aiClass}`}>
                        {aiText}
                      </div>

                      <button 
                        onClick={() => handleAnalyzeAd(ad)}
                        disabled={isAnalyzing}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-zinc-800 text-cyan-400 border border-cyan-900/30 px-3 py-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <span className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></span>
                        ) : "🤖"}
                        {isAnalyzing ? "Analizando..." : "Analizar con IA"}
                      </button>
                    </div>

                    {/* GENEALOGÍA: HOOK & LANDING */}
                    <div className="col-span-12 md:col-span-4 border-l border-zinc-800 pl-6">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Contexto Creativo</div>
                      
                      <div className="mb-3">
                        <span className="text-[10px] text-zinc-500 block">Anuncio Real</span>
                        <div className="text-sm text-zinc-300 font-medium truncate">{ad.ad_name}</div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-[10px] text-zinc-500 block">Hook Utilizado (Creative Lab)</span>
                        <div className="text-xs text-white bg-zinc-950 p-2 rounded border border-zinc-800 line-clamp-2">
                          {ad.creative_package?.hook ? `"${ad.creative_package.hook}"` : <span className="text-zinc-500 italic">No enlazado en BD</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">Landing conectada:</span>
                        <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">{ad.creative_package?.landing || 'N/A'}</span>
                      </div>
                    </div>

                    {/* MÉTRICAS SECUNDARIAS */}
                    <div className="col-span-12 md:col-span-5 border-l border-zinc-800 pl-6">
                       <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">Métricas Meta Ads</div>
                       
                       <div className="grid grid-cols-4 gap-4">
                         <div>
                           <div className="text-[10px] text-zinc-500">Gasto</div>
                           <div className="font-mono text-sm">${spend.toFixed(0)}</div>
                         </div>
                         <div>
                           <div className="text-[10px] text-zinc-500">ROAS</div>
                           <div className={`font-mono text-sm font-bold ${roas > 2 ? 'text-green-400' : roas > 0 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                             {roas > 0 ? `${roas.toFixed(2)}x` : '-'}
                           </div>
                         </div>
                         <div>
                           <div className="text-[10px] text-zinc-500">Compras</div>
                           <div className="font-mono text-sm">{purchases}</div>
                         </div>
                         <div>
                           <div className="text-[10px] text-zinc-500">CPA</div>
                           <div className="font-mono text-sm">${purchases > 0 ? (spend/purchases).toFixed(0) : '0'}</div>
                         </div>
                         
                         <div>
                           <div className="text-[10px] text-zinc-500">CTR</div>
                           <div className={`font-mono text-sm ${ctr > 2 ? 'text-green-400' : ctr < 1 ? 'text-red-400' : 'text-zinc-300'}`}>{ctr.toFixed(2)}%</div>
                         </div>
                         <div>
                           <div className="text-[10px] text-zinc-500">Freq.</div>
                           <div className={`font-mono text-sm ${parseFloat(ad.frequency) > 3 ? 'text-purple-400' : 'text-zinc-300'}`}>{parseFloat(ad.frequency).toFixed(2)}</div>
                         </div>
                         <div>
                           <div className="text-[10px] text-zinc-500">CPC</div>
                           <div className="font-mono text-sm">${parseFloat(ad.cpc || '0').toFixed(2)}</div>
                         </div>
                         <div>
                           <div className="text-[10px] text-zinc-500">Camp.</div>
                           <div className="text-[10px] text-zinc-500 truncate max-w-[80px]" title={ad.campaign_name}>{ad.campaign_name}</div>
                         </div>
                       </div>
                    </div>

                  </div>

                  {/* BLOQUE LLM (Aparece al analizar) */}
                  {llmResult && (
                    <div className="mt-5 pt-5 border-t border-zinc-800/80 animate-fade-in bg-zinc-950/30 -mx-5 px-5 pb-1 rounded-b-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🤖</span>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Interpretación IA</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ml-auto ${
                          llmResult.status === 'ESCALAR' ? 'bg-green-500/20 text-green-400' :
                          llmResult.status === 'APAGAR' ? 'bg-red-500/20 text-red-400' :
                          llmResult.status === 'FATIGA' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          RECOMENDACIÓN: {llmResult.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="col-span-2 space-y-3">
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">DIAGNÓSTICO</span>
                            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">{llmResult.diagnosis}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">RIESGO IDENTIFICADO</span>
                            <p className="text-sm text-zinc-400 leading-relaxed">{llmResult.risk}</p>
                          </div>
                        </div>
                        <div className="space-y-3 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 font-bold block mb-1">ACCIÓN SUGERIDA</span>
                            <p className="text-sm text-cyan-400 font-medium leading-relaxed bg-cyan-900/10 p-3 rounded-lg border border-cyan-900/30">{llmResult.action}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 mr-2">Confianza IA</span>
                            <span className="font-mono text-lg text-white font-bold">{llmResult.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </main>
  );
}
