-- Ingenio OS v3.1 Operational Schema
-- Orientado a Single Operator System, sin sobreingeniería multi-tenant.

-- 1. Products
CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    niche TEXT,
    status TEXT DEFAULT 'IDEA', -- IDEA, VALIDANDO, CONSTRUYENDO, LANZADO, GANADOR, DESCARTADO
    priority TEXT DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Product Notes
CREATE TABLE IF NOT EXISTS product_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT UNIQUE REFERENCES products(slug) ON DELETE CASCADE,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Product Links
CREATE TABLE IF NOT EXISTS product_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Product Decisions
CREATE TABLE IF NOT EXISTS product_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    decision TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Product Tasks (Checklist)
CREATE TABLE IF NOT EXISTS product_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Events (Operational Event System)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- Ej: 'creative_winner', 'landing_published', 'status_changed'
    product_slug TEXT REFERENCES products(slug) ON DELETE SET NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) - Al ser Single Operator, podemos dejar RLS deshabilitado 
-- si solo accedemos vía Server Actions o API Keys secretas, pero es buena práctica activarlo
-- permitiendo todo para el usuario autenticado (anon/authenticated).
-- Para este caso operacional de un solo dueño, simplificaremos permitiendo el acceso.
