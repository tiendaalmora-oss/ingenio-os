-- MIGRACIÓN CRM: Añadir Etiquetas y Unicidad de Teléfono

-- 1. Añadir columna tags como un array de texto (por defecto vacío)
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Limpiar duplicados viejos antes de añadir la restricción UNIQUE
-- (Mantiene solo el contacto original creado primero para cada número)
DELETE FROM crm_contacts
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC) as rn
    FROM crm_contacts
  ) t
  WHERE t.rn > 1
);

-- 3. Añadir restricción UNIQUE al teléfono para prevenir race conditions futuras
ALTER TABLE crm_contacts ADD CONSTRAINT crm_contacts_phone_key UNIQUE (phone);
