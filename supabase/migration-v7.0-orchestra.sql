-- Ingenio OS v7.0 - ORQUESTA DE LANZAMIENTO
-- Añadir campos para perfilar ideas y configurar la entrega del producto.

-- 1. Extender tabla 'ideas' con campos de perfilado
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS desires TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS offer TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS product_description TEXT;

-- 2. Extender tabla 'products' con campos de ficha comercial y entrega
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS checkout_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_manual TEXT DEFAULT '';
