const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_APP_SECRET = process.env.META_APP_SECRET;

async function run() {
  console.log("Token length:", META_ACCESS_TOKEN ? META_ACCESS_TOKEN.length : 0);
  
  const url = new URL("https://graph.facebook.com/v21.0/me/adaccounts");
  url.searchParams.set("access_token", META_ACCESS_TOKEN);
  
  if (META_APP_SECRET) {
    const proof = crypto.createHmac("sha256", META_APP_SECRET).update(META_ACCESS_TOKEN).digest("hex");
    url.searchParams.set("appsecret_proof", proof);
  }
  url.searchParams.set("fields", "name,account_id,account_status");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    console.log("META_RESPONSE:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }
}

run();
