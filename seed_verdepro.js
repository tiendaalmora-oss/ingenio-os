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

async function supabaseFetch(table, method = "GET", body = null, query = "") {
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const headers = {
    "apikey": supabaseServiceKey,
    "Authorization": `Bearer ${supabaseServiceKey}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : ""
  };
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  return await res.json();
}

async function runSeed() {
  console.log("🌱 Iniciando carga de datos de plantilla para VerdePro...");
  try {
    const productSlug = "verdepro";

    // 1. Create Creative Concepts
    const conceptsData = [
      { product_slug: productSlug, name: "Evitar mermas", description: "Enfocado en el dolor de tirar mercadería por mal stock." },
      { product_slug: productSlug, name: "Control rápido", description: "Enfocado en la velocidad para cobrar y no perder tiempo." },
      { product_slug: productSlug, name: "Gestión de compras", description: "Enfocado en la facilidad para abastecer la verdulería." }
    ];
    console.log("Insertando Conceptos Creativos...");
    const concepts = await supabaseFetch("creative_concepts", "POST", conceptsData);

    // 2. Create Creative Assets
    const assetsData = [
      { product_slug: productSlug, type: "hook", content: "¿Sabías que tirás el 15% de tus verduras por mal stock?" },
      { product_slug: productSlug, type: "hook", content: "La única app pensada por y para verduleros de barrio." },
      { product_slug: productSlug, type: "video", content: "https://res.cloudinary.com/demo/video/upload/verdepro_demo1.mp4" },
      { product_slug: productSlug, type: "video", content: "https://res.cloudinary.com/demo/video/upload/verdepro_demo2.mp4" },
      { product_slug: productSlug, type: "thumbnail", content: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500" },
      { product_slug: productSlug, type: "thumbnail", content: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500" }
    ];
    console.log("Insertando Assets Creativos...");
    const assets = await supabaseFetch("creative_assets", "POST", assetsData);

    // Get Landing Variants
    const landings = await supabaseFetch("landing_variants", "GET", null, "?product_slug=eq.verdepro");
    const landingBase = landings.find(l => l.name === "Respuesta Directa Base")?.id || null;
    const landingVsl = landings.find(l => l.type === "vsl")?.id || null;

    // 3. Create Creative Packages
    const packagesData = [
      {
        product_slug: productSlug,
        name: "VerdePro - Control Mermas",
        concept_id: concepts.find(c => c.name === "Evitar mermas").id,
        video_asset_id: assets.find(a => a.type === "video" && a.content.includes("demo1")).id,
        thumbnail_asset_id: assets.find(a => a.type === "thumbnail" && a.content.includes("15428")).id,
        hook_text: "¿Sabías que tirás el 15% de tus verduras por mal stock?",
        landing_variant_id: landingVsl,
        status: "WINNER",
        meta_ad_id: "ad_1001",
        meta_campaign_id: "camp_001",
        metrics: { ctr: 3.5, cpc: 0.12, hook_rate: 45, thumb_stop: 30, roas: 4.2 }
      },
      {
        product_slug: productSlug,
        name: "VerdePro - App para el cel",
        concept_id: concepts.find(c => c.name === "Control rápido").id,
        video_asset_id: assets.find(a => a.type === "video" && a.content.includes("demo2")).id,
        thumbnail_asset_id: assets.find(a => a.type === "thumbnail" && a.content.includes("16086")).id,
        hook_text: "La única app pensada por y para verduleros de barrio.",
        landing_variant_id: landingBase,
        status: "TESTING",
        meta_ad_id: "ad_1002",
        meta_campaign_id: "camp_001",
        metrics: { ctr: 1.8, cpc: 0.25, hook_rate: 22, thumb_stop: 15, roas: 1.1 }
      },
      {
        product_slug: productSlug,
        name: "VerdePro - Mayorista",
        concept_id: concepts.find(c => c.name === "Gestión de compras").id,
        video_asset_id: assets.find(a => a.type === "video" && a.content.includes("demo1")).id,
        thumbnail_asset_id: assets.find(a => a.type === "thumbnail" && a.content.includes("16086")).id,
        hook_text: "Dejá de contar plata en papelitos sucios.",
        landing_variant_id: landingBase,
        status: "DEAD",
        meta_ad_id: "ad_1003",
        meta_campaign_id: "camp_002",
        metrics: { ctr: 0.5, cpc: 0.85, hook_rate: 5, thumb_stop: 8, roas: 0 }
      }
    ];
    console.log("Insertando Paquetes Creativos...");
    await supabaseFetch("creative_packages", "POST", packagesData);

    // 4. Create Product Tasks
    const tasksData = [
      { product_slug: productSlug, title: "Revisar campañas de prueba en Meta Ads", completed: true },
      { product_slug: productSlug, title: "Conectar pasarela de pago para cobros recurrentes", completed: false },
      { product_slug: productSlug, title: "Grabar video tutorial de onboarding para verduleros", completed: false },
      { product_slug: productSlug, title: "Lanzar campaña de retargeting para visitantes", completed: false }
    ];
    console.log("Insertando Tareas Operativas...");
    await supabaseFetch("product_tasks", "POST", tasksData);

    console.log("✅ Carga de datos de plantilla VerdePro completada con éxito.");

  } catch (err) {
    console.error("❌ Error en la carga de datos:", err);
  }
}

runSeed();
