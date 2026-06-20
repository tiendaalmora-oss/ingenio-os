-- MIGRATION v11.0: Creative Factory Assets
-- Creates the normalized table to store ad creatives linked to a PVE hypothesis

CREATE TABLE IF NOT EXISTS pve_creative_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES pve_ideas(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'hook', 'image_concept', 'short_script', 'long_script'
    content TEXT NOT NULL,
    status TEXT DEFAULT 'testing', -- 'untested', 'testing', 'winner', 'loser'
    ctr NUMERIC DEFAULT 0.0,
    leads INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for rapid querying in the Creative Vault
CREATE INDEX IF NOT EXISTS idx_pve_creative_assets_idea ON pve_creative_assets(idea_id);
CREATE INDEX IF NOT EXISTS idx_pve_creative_assets_type ON pve_creative_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_pve_creative_assets_status ON pve_creative_assets(status);
