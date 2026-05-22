"use client";

import React, { useState } from "react";

interface NodoFlujo {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  estado: "activo" | "construccion" | "pendiente";
  herramienta: string;
}

interface Flujo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "ventas" | "operaciones" | "metricas";
  estado: "activo" | "construccion" | "pendiente";
  nodos: NodoFlujo[];
  webhookUrl?: string;
}

const FLUJOS: Flujo[] = [
  {
    id: "ventas-lowticket",
    nombre: "Venta Low-Ticket Automatizada",
    descripcion:
      "Desde el anuncio hasta la entrega digital sin intervención humana.",
    tipo: "ventas",
    estado: "construccion",
    webhookUrl: "https://os.ingeniodigital.shop/api/webhooks/ventas-lowticket",
    nodos: [
      {
        id: "ads",
        icono: "📢",
        titulo: "Meta Ads",
        descripcion: "Lead hace clic en el anuncio",
        estado: "activo",
        herramienta: "Meta Ads",
      },
      {
        id: "whatsapp",
        icono: "💬",
        titulo: "WhatsApp Bot",
        descripcion: "Mensaje automático de bienvenida y calificación",
        estado: "pendiente",
        herramienta: "WhatsApp API",
      },
      {
        id: "ia",
        icono: "🤖",
        titulo: "Asistente IA",
        descripcion: "Responde dudas, objecciones y cierra la venta",
        estado: "pendiente",
        herramienta: "OpenRouter / Ollama",
      },
      {
        id: "shopify",
        icono: "🛒",
        titulo: "Checkout Shopify",
        descripcion: "Envío del link de pago y procesamiento",
        estado: "pendiente",
        herramienta: "Shopify",
      },
      {
        id: "entrega",
        icono: "📦",
        titulo: "Entrega Digital",
        descripcion: "Acceso automático al producto digital post-pago",
        estado: "pendiente",
        herramienta: "Shopify + n8n",
      },
    ],
  },
  {
    id: "onboarding",
    nombre: "Onboarding de Cliente",
    descripcion:
      "Secuencia automatizada de bienvenida, configuración y activación.",
    tipo: "operaciones",
    estado: "pendiente",
    webhookUrl: "https://os.ingeniodigital.shop/api/webhooks/onboarding",
    nodos: [
      {
        id: "pago",
        icono: "💳",
        titulo: "Pago Confirmado",
        descripcion: "Shopify webhook dispara el flujo",
        estado: "pendiente",
        herramienta: "Shopify",
      },
      {
        id: "welcome",
        icono: "👋",
        titulo: "Mensaje de Bienvenida",
        descripcion: "WhatsApp automático con acceso y próximos pasos",
        estado: "pendiente",
        herramienta: "WhatsApp API",
      },
      {
        id: "supabase",
        icono: "🗄️",
        titulo: "Registro en Base de Datos",
        descripcion: "Alta del cliente en Supabase",
        estado: "pendiente",
        herramienta: "Supabase",
      },
    ],
  },
  {
    id: "metricas-auto",
    nombre: "Reporte de Métricas Automático",
    descripcion: "Resumen diario de ROAS, CPA y conversiones por producto.",
    tipo: "metricas",
    estado: "pendiente",
    webhookUrl: "https://os.ingeniodigital.shop/api/webhooks/metricas-auto",
    nodos: [
      {
        id: "meta-pull",
        icono: "📊",
        titulo: "Pull de Meta Ads",
        descripcion: "n8n extrae métricas de la API de Meta cada 24hs",
        estado: "pendiente",
        herramienta: "Meta Ads API + n8n",
      },
      {
        id: "calculo",
        icono: "🧮",
        titulo: "Cálculo de ROAS y CPA",
        descripcion: "Procesamiento y clasificación por producto",
        estado: "pendiente",
        herramienta: "n8n",
      },
      {
        id: "alerta",
        icono: "🔔",
        titulo: "Alerta por WhatsApp",
        descripcion: "Resumen diario de ganadores y perdedores",
        estado: "pendiente",
        herramienta: "WhatsApp API",
      },
    ],
  },
];

const TIPO_CONFIG = {
  ventas: "bg-green-900/30 text-green-400 border-green-900/50",
  operaciones: "bg-blue-900/30 text-blue-400 border-blue-900/50",
  metricas: "bg-purple-900/30 text-purple-400 border-purple-900/50",
};

const TIPO_LABEL = {
  ventas: "Ventas",
  operaciones: "Operaciones",
  metricas: "Métricas",
};

const ESTADO_NODO = {
  activo: "bg-green-500",
  construccion: "bg-yellow-500 animate-pulse",
  pendiente: "bg-zinc-600",
};

export function WorkflowsModule() {
  const [flujoActivo, setFlujoActivo] = useState<string>(FLUJOS[0].id);
  const [copiado, setCopiado] = useState(false);

  const flujo = FLUJOS.find((f) => f.id === flujoActivo)!;

  const handleCopiarWebhook = () => {
    if (flujo.webhookUrl) {
      navigator.clipboard.writeText(flujo.webhookUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Flujos de Automatización</h2>
        <p className="text-zinc-400">
          Orquestación de procesos operativos vía n8n, WhatsApp y Shopify.
        </p>
      </div>

      {/* Selector de flujos */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {FLUJOS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFlujoActivo(f.id);
              setCopiado(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              flujoActivo === f.id
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
            }`}
          >
            {f.nombre}
          </button>
        ))}
      </div>

      {/* Detalle del flujo activo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">{flujo.nombre}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  TIPO_CONFIG[flujo.tipo]
                }`}
              >
                {TIPO_LABEL[flujo.tipo]}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  flujo.estado === "activo"
                    ? "bg-green-900/30 text-green-400 border-green-900/50"
                    : flujo.estado === "construccion"
                    ? "bg-yellow-900/30 text-yellow-400 border-yellow-900/50"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {flujo.estado === "activo"
                  ? "Activo"
                  : flujo.estado === "construccion"
                  ? "En construcción"
                  : "Pendiente"}
              </span>
            </div>
            <p className="text-zinc-400 text-sm">{flujo.descripcion}</p>
          </div>
          <button
            onClick={handleCopiarWebhook}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ml-4"
          >
            {copiado ? "✅ Copiado" : "🔗 Copiar Webhook URL"}
          </button>
        </div>

        {/* Pipeline visual */}
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {flujo.nodos.map((nodo, idx) => (
            <React.Fragment key={nodo.id}>
              <div className="flex-shrink-0 w-44 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">{nodo.icono}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      ESTADO_NODO[nodo.estado]
                    }`}
                  />
                </div>
                <div className="font-semibold text-white text-sm leading-tight">
                  {nodo.titulo}
                </div>
                <div className="text-xs text-zinc-500 leading-relaxed">
                  {nodo.descripcion}
                </div>
                <div className="mt-auto pt-2 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {nodo.herramienta}
                  </span>
                </div>
              </div>
              {idx < flujo.nodos.length - 1 && (
                <div className="flex-shrink-0 self-center text-zinc-600 text-xl font-bold mt-1">
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Instrucciones de setup */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
          Pasos para activar este flujo en n8n
        </div>
        <ol className="space-y-3">
          {[
            "Copiar la URL de webhook de este flujo (botón arriba a la derecha).",
            "Abrir n8n y crear un nuevo workflow con nodo Webhook.",
            "Pegar la URL copiada como endpoint de entrada.",
            "Conectar los nodos según el pipeline visual mostrado arriba.",
            "Configurar las credenciales de cada integración en n8n.",
            "Activar el workflow y hacer una prueba de disparo manual.",
          ].map((paso, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {paso}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
