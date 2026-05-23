-- Ingenio OS v5.0 - AGENTES IA (Fase 1)

-- Tabla de memoria operacional para los agentes IA
CREATE TABLE IF NOT EXISTS ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    ad_id TEXT NOT NULL, -- El meta_ad_id
    ad_name TEXT,
    hook_used TEXT,
    landing_used TEXT,
    metrics_snapshot JSONB NOT NULL, -- Snapshot de las métricas en el momento del análisis
    
    -- Respuesta estructurada del LLM
    ai_status TEXT NOT NULL, -- ESCALAR, OBSERVAR, APAGAR, FATIGA
    ai_diagnosis TEXT NOT NULL, -- "Buen CTR y ROAS creciente..."
    ai_risk TEXT NOT NULL, -- "Frecuencia aún saludable..."
    ai_action TEXT NOT NULL, -- "Duplicar variante..."
    ai_confidence INTEGER NOT NULL, -- ej: 87
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index para búsquedas rápidas por anuncio
CREATE INDEX IF NOT EXISTS idx_ai_analysis_ad_id ON ai_analysis(ad_id);
