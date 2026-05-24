-- Ingenio OS v8.0 - MOTOR DE GENERACIÓN CREATIVA
-- Añadir campos para guardar la investigación comercial de IA y el branding dinámico.

-- 1. Extender tabla 'ideas' con branding y creative_brief
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS creative_brief JSONB DEFAULT '{}'::jsonb;

-- 2. Extender tabla 'products' con branding y creative_brief
ALTER TABLE products ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS creative_brief JSONB DEFAULT '{}'::jsonb;
