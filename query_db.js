const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.substring(0, idx).trim();
    const val = trimmed.substring(idx + 1).trim();
    process.env[key] = val;
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTable(tableName) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?product_slug=eq.verdepro&select=*`;
  const res = await fetch(url, {
    headers: {
      "apikey": supabaseServiceKey,
      "Authorization": `Bearer ${supabaseServiceKey}`
    }
  });
  if (!res.ok) {
    console.error(`Error checking ${tableName}:`, res.statusText);
    return [];
  }
  return await res.json();
}

async function run() {
  const tables = [
    "creative_concepts",
    "creative_assets",
    "creative_packages",
    "landing_variants",
    "product_tasks"
  ];
  for (const t of tables) {
    const data = await checkTable(t);
    console.log(`Table ${t} count for verdepro:`, data.length);
    if (data.length > 0) {
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
    }
  }
}

run();
