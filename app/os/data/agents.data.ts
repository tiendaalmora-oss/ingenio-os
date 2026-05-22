export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: "ready" | "building" | "future";
  description: string;
  capabilities: string[];
}

export const mockAgents: AIAgent[] = [
  {
    id: "a1",
    name: "Research AI",
    role: "Analista de Mercado",
    status: "future",
    description: "Analiza nichos, busca competidores y detecta pain points en foros y redes.",
    capabilities: ["Extracción Web", "Análisis de Sentimiento", "Matriz de Competidores"]
  },
  {
    id: "a2",
    name: "Copy AI",
    role: "Copywriter Direct Response",
    status: "future",
    description: "Genera hooks, copys de anuncios y textos para landings basados en el nicho.",
    capabilities: ["Generación de Hooks", "Variantes de Copy A/B", "Copy de Landing Page"]
  },
  {
    id: "a3",
    name: "Landing AI",
    role: "Frontend Engineer",
    status: "future",
    description: "Toma el copy y genera automáticamente la landing page usando los componentes base.",
    capabilities: ["Generación de JSX", "Paletas de Colores", "Generación de Imágenes"]
  },
  {
    id: "a4",
    name: "Metrics AI",
    role: "Data Analyst",
    status: "future",
    description: "Monitorea campañas de Meta Ads y sugiere decisiones de scaling o killing.",
    capabilities: ["Monitoreo de ROAS", "Detección de Anomalías", "Reportes Diarios"]
  }
];
