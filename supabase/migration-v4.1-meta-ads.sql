-- Ingenio OS v4.1 - CONEXIÓN NIVEL ANUNCIO (Creative Radar)

-- 1. Agregamos las referencias a la API de Meta Ads dentro de los Creative Packages
ALTER TABLE creative_packages
ADD COLUMN IF NOT EXISTS meta_ad_id TEXT,
ADD COLUMN IF NOT EXISTS meta_campaign_id TEXT;

-- 2. (MOCK) Asociamos algunos packages existentes a los IDs mock de prueba para que el Radar pueda unir los mundos.
-- NOTA: Esto solo afectará a los packages que ya existan.
UPDATE creative_packages
SET meta_ad_id = 'ad_1001', meta_campaign_id = 'camp_001'
WHERE id IN (
  SELECT id FROM creative_packages 
  WHERE status = 'WINNER' OR name ILIKE '%winner%'
  LIMIT 1
);

UPDATE creative_packages
SET meta_ad_id = 'ad_1002', meta_campaign_id = 'camp_001'
WHERE id IN (
  SELECT id FROM creative_packages 
  WHERE status = 'TESTING'
  LIMIT 1
);

UPDATE creative_packages
SET meta_ad_id = 'ad_1003', meta_campaign_id = 'camp_002'
WHERE id IN (
  SELECT id FROM creative_packages 
  WHERE status = 'DEAD' OR name ILIKE '%prueba%'
  LIMIT 1
);
