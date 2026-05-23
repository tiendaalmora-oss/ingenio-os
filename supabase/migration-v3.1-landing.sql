-- Ingenio OS v3.1 - PARTE 2: LANDING FACTORY HQ

-- Tabla para gestionar las diferentes variantes de landing pages
CREATE TABLE IF NOT EXISTS landing_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: 'Direct Response v1', 'VSL Oferta'
    type TEXT NOT NULL DEFAULT 'direct_response', -- 'direct_response', 'vsl', 'whatsapp', etc.
    status TEXT DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
    is_main BOOLEAN DEFAULT false, -- Si es la landing principal que se muestra en la raíz
    config JSONB DEFAULT '{}'::jsonb, -- Para guardar copys, hooks o configuraciones rápidas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
