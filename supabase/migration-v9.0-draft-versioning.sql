-- Ingenio OS v9.0 - MOTOR DE GENERACIÓN CREATIVA & VERSIONADO
-- Añadir campos para guardar borradores HTML, HTML publicado y el historial de versiones.

-- 1. Extender tabla 'landing_variants' con borradores
ALTER TABLE landing_variants ADD COLUMN IF NOT EXISTS draft_html TEXT;
ALTER TABLE landing_variants ADD COLUMN IF NOT EXISTS published_html TEXT;

-- 2. Crear tabla 'landing_versions' para el historial y rollback
CREATE TABLE IF NOT EXISTS landing_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES landing_variants(id) ON DELETE CASCADE,
    content_html TEXT NOT NULL,
    prompt_used TEXT, -- El prompt de IA que generó esta versión (si aplica)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
