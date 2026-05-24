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
  console.log("Iniciando borrado de DB via REST...");

  const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  };

  const res1 = await fetch(`${url}/rest/v1/variants?id=gt.0`, { method: 'DELETE', headers });
  console.log("Variants deleted:", res1.status);

  const res2 = await fetch(`${url}/rest/v1/ideas?id=gt.0`, { method: 'DELETE', headers });
  console.log("Ideas deleted:", res2.status);

  const res3 = await fetch(`${url}/rest/v1/products?id=gt.0`, { method: 'DELETE', headers });
  console.log("Products deleted:", res3.status);

  console.log("DB cleaned");
}

clearDB();
