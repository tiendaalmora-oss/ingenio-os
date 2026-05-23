-- Ingenio OS v3.1 - MIGRACIÓN INCREMENTAL
-- Objetivo: Extender la base actual para el Single Operator System sin romper datos.

-- 1. Asegurar tabla base 'products' 
-- (Si ya existe, esto no hace nada. Si no existe, la crea)
CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    niche TEXT,
    status TEXT DEFAULT 'IDEA',
    priority TEXT DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.b Añadir columnas operacionales de v3.1 si la tabla 'products' ya existía previamente
ALTER TABLE products ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'IDEA';
ALTER TABLE products ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'NORMAL';

-- 2. Crear módulos operacionales satelitales para Product HQ (Solo si no existen)
CREATE TABLE IF NOT EXISTS product_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT UNIQUE REFERENCES products(slug) ON DELETE CASCADE,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    decision TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear Event System (Sistema nervioso operacional)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- Ejemplo: 'creative_winner', 'status_changed'
    product_slug TEXT REFERENCES products(slug) ON DELETE SET NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
