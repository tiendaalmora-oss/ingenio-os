const fs = require('fs');
const dotenv = require('dotenv');

// Cargar variables
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function clearDB() {
  console.log("Iniciando borrado de DB via REST con UUID corrects...");

  const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  };

  // El id es un UUID, así que usamos not.eq a un UUID dummy
  const dummyUUID = "00000000-0000-0000-0000-000000000000";

  // También podemos usar Prefer: return=representation para ver qué se borró
  const reqHeaders = { ...headers, "Prefer": "return=representation" };

  // Landing Variants
  const res1 = await fetch(`${url}/rest/v1/landing_variants?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  console.log("landing_variants deleted status:", res1.status);
  
  const resVariants = await fetch(`${url}/rest/v1/variants?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  console.log("variants deleted status:", resVariants.status);

  // Creative Packages, assets, concepts
  await fetch(`${url}/rest/v1/creative_packages?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  await fetch(`${url}/rest/v1/creative_assets?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  await fetch(`${url}/rest/v1/creative_concepts?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  await fetch(`${url}/rest/v1/product_tasks?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });

  // Ideas
  const res2 = await fetch(`${url}/rest/v1/ideas?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  console.log("ideas deleted status:", res2.status);

  // Products
  const res3 = await fetch(`${url}/rest/v1/products?id=not.eq.${dummyUUID}`, { method: 'DELETE', headers: reqHeaders });
  console.log("products deleted status:", res3.status);

  console.log("DB cleaned");
}

clearDB();
