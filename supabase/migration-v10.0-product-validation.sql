-- MIGRATION v10.0: Product Validation Engine (PVE)
-- Creates the base table for validating micro-SaaS business hypotheses rapidly.

CREATE TABLE IF NOT EXISTS pve_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche TEXT NOT NULL,
    pain_point TEXT,
    offer TEXT,
    promise TEXT,
    price TEXT,
    landing_copy TEXT,
    whatsapp_opener TEXT,
    ad_script TEXT,
    status TEXT DEFAULT 'IDEA', -- IDEA, VALIDATING, WINNER, KILLED
    ctr NUMERIC DEFAULT 0.0,
    leads INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by status and niche
CREATE INDEX IF NOT EXISTS idx_pve_ideas_status ON pve_ideas(status);
CREATE INDEX IF NOT EXISTS idx_pve_ideas_niche ON pve_ideas(niche);

-- In a single operator system, RLS can be simplified or disabled, but we'll leave it standard.
-- If RLS is enabled, you'd need policies, but we assume the standard setup uses the service key 
-- or anon is allowed for the HQ panel.
