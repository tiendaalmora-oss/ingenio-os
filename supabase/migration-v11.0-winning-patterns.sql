-- MIGRACIÓN INGENIO OS: Winning Patterns Engine
-- Crea la tabla para almacenar los patrones de marketing ganadores de productos validados.

CREATE TABLE IF NOT EXISTS winning_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche TEXT NOT NULL,
    ad_text TEXT NOT NULL,
    primary_pain TEXT NOT NULL,
    secondary_pain TEXT,
    promise TEXT NOT NULL,
    emotion TEXT NOT NULL,
    awareness_level TEXT NOT NULL,
    sales INTEGER DEFAULT 0,
    ctr REAL DEFAULT 0.0,
    roas REAL DEFAULT 0.0,
    winner_score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index para búsquedas rápidas por nicho
CREATE INDEX IF NOT EXISTS idx_winning_patterns_niche ON winning_patterns(niche);
