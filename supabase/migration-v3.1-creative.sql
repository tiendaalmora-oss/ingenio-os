-- Ingenio OS v3.1 - PARTE 3: CREATIVE LAB HQ

-- Tabla 1: Hipótesis creativas y ángulos (Concepts)
CREATE TABLE IF NOT EXISTS creative_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: "Caos Operativo", "Miedo a perder plata"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla 2: Registro físico de assets brutos
CREATE TABLE IF NOT EXISTS creative_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'hook', 'video', 'thumbnail', 'copy'
    content TEXT NOT NULL, -- Texto (para hooks/copies) o URL física (para media)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla 3: Creative Packages (EL NÚCLEO)
CREATE TABLE IF NOT EXISTS creative_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: "Package #14"
    concept_id UUID REFERENCES creative_concepts(id) ON DELETE SET NULL,
    video_asset_id UUID REFERENCES creative_assets(id) ON DELETE SET NULL,
    thumbnail_asset_id UUID REFERENCES creative_assets(id) ON DELETE SET NULL,
    hook_text TEXT,
    copy_text TEXT,
    landing_variant_id UUID REFERENCES landing_variants(id) ON DELETE SET NULL, -- Referencia cruzada a la landing!
    status TEXT DEFAULT 'TESTING', -- TESTING, WINNER, DEAD, ARCHIVED
    metrics JSONB DEFAULT '{"ctr": 0, "cpc": 0, "hook_rate": 0, "thumb_stop": 0, "roas": 0}'::jsonb,
    parent_id UUID REFERENCES creative_packages(id) ON DELETE SET NULL, -- Genealogía: De dónde fue clonado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
