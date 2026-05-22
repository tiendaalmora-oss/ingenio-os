"use client";

import React, { useState } from "react";

interface Integration {
  id: string;
  nombre: string;
  descripcion: string;
  rol: string;
  estado: "conectado" | "pendiente" | "desconectado";
  icono: string;
  accion: string;
  url?: string;
}

const INTEGRACIONES: Integration[] = [
  {
    id: "shopify",
    nombre: "Shopify",
    descripcion: "Checkout, pagos, entrega digital y gestión de órdenes.",
    rol: "Motor de ventas y cobro",
    estado: "desconectado",
    icono: "🛒",
    accion: "Conectar Shopify",
  },
  {
    id: "meta",
    nombre: "Meta Ads",
    descripcion: "Campañas publicitarias, creativos, cuentas y métricas de rendimiento.",
    rol: "Motor de tráfico pago",
    estado: "conectado",
    icono: "📢",
    accion: "Ver campañas",
    url: "/",
  },
  {
    id: "whatsapp",
    nombre: "WhatsApp Business",
    descripcion: "Atención al cliente, calificación de leads y cierre de ventas automático.",
    rol: "Canal de conversión",
    estado: "pendiente",
    icono: "💬",
    accion: "Configurar API",
  },
  {
    id: "n8n",
    nombre: "n8n Workflows",
    descripcion: "Orquestador de automatizaciones: ventas, onboarding, métricas y entrega.",
    rol: "Sistema nervioso central",
    estado: "desconectado",
    icono: "⚡",
    accion: "Agregar endpoint",
  },
  {
    id: "supabase",
    nombre: "Supabase",
    descripcion: "Base de datos PostgreSQL, autenticación y APIs en tiempo real.",
    rol: "Motor de datos",
    estado: "conectado",
    icono: "🗄️",
    accion: "Ver tablas",
  },
  {
    id: "openrouter",
    nombre: "OpenRouter",
    descripcion: "Acceso a múltiples modelos LLM: GPT-4, Claude, Gemini y más.",
    rol: "Cerebro IA premium",
    estado: "desconectado",
    icono: "🧠",
    accion: "Agregar API Key",
  },
  {
    id: "ollama",
    nombre: "Ollama (Local)",
    descripcion: "Modelos IA locales de bajo costo para research, clasificación y brainstorming.",
    rol: "IA local de velocidad",
    estado: "desconectado",
    icono: "🦙",
    accion: "Ver instrucciones",
  },
];

const ESTADO_CONFIG = {
  conectado: {
    label: "Conectado",
    dot: "bg-green-400",
    badge: "bg-green-900/30 text-green-400 border-green-900/50",
  },
  pendiente: {
    label: "Pendiente",
    dot: "bg-yellow-400 animate-pulse",
    badge: "bg-yellow-900/30 text-yellow-400 border-yellow-900/50",
  },
  desconectado: {
    label: "Desconectado",
    dot: "bg-zinc-600",
    badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
};

export function IntegrationsModule() {
  const [copiado, setCopiado] = useState<string | null>(null);

  const handleCopiarWebhook = (id: string) => {
    const webhookUrl = `https://os.ingeniodigital.shop/api/webhooks/${id}`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const conectadas = INTEGRACIONES.filter((i) => i.estado === "conectado").length;

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Centro de Integraciones</h2>
          <p className="text-zinc-400">
            Conectores externos del ecosistema Ingenio OS.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
          <span className="text-sm text-zinc-400">Estado del ecosistema:</span>
          <span className="text-sm font-bold text-white">
            {conectadas}/{INTEGRACIONES.length}
          </span>
          <span className="text-sm text-green-400">activas</span>
        </div>
      </div>

      {/* Flujo del negocio */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-8">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
          Flujo completo de ventas
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icono: "📢", label: "Meta Ads", id: "meta" },
            { icono: "→", label: "" },
            { icono: "💬", label: "WhatsApp", id: "whatsapp" },
            { icono: "→", label: "" },
            { icono: "🧠", label: "IA", id: "openrouter" },
            { icono: "→", label: "" },
            { icono: "🛒", label: "Shopify", id: "shopify" },
            { icono: "→", label: "" },
            { icono: "📦", label: "Entrega", id: "shopify" },
          ].map((step, i) => {
            if (step.label === "") {
              return (
                <span key={i} className="text-zinc-600 font-bold text-lg">
                  {step.icono}
                </span>
              );
            }
            const integ = INTEGRACIONES.find((x) => x.id === step.id);
            const estado = integ?.estado;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
                  estado === "conectado"
                    ? "bg-green-900/20 border-green-900/40 text-green-300"
                    : estado === "pendiente"
                    ? "bg-yellow-900/20 border-yellow-900/40 text-yellow-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                <span>{step.icono}</span>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid de integraciones */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INTEGRACIONES.map((integ) => {
          const cfg = ESTADO_CONFIG[integ.estado];
          return (
            <div
              key={integ.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-zinc-700 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{integ.icono}</span>
                  <div>
                    <div className="font-bold text-white">{integ.nombre}</div>
                    <div className="text-xs text-zinc-500">{integ.rol}</div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-5 flex-1 leading-relaxed">
                {integ.descripcion}
              </p>

              <div className="flex gap-2 mt-auto">
                {integ.estado === "conectado" && integ.url ? (
                  <a
                    href={integ.url}
                    className="flex-1 text-center text-sm bg-green-900/30 text-green-400 border border-green-900/50 px-3 py-2 rounded-lg hover:bg-green-900/50 transition-colors font-medium"
                  >
                    {integ.accion} ↗
                  </a>
                ) : (
                  <button className="flex-1 text-sm bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors font-medium">
                    {integ.accion}
                  </button>
                )}
                <button
                  onClick={() => handleCopiarWebhook(integ.id)}
                  title="Copiar URL de webhook"
                  className="px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
                >
                  {copiado === integ.id ? "✅" : "🔗"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
