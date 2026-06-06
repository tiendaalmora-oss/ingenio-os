import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const payload = {
    "id": "false_254635793186937@lid_A5CE95CCA132F227237EB53C57797D63",
    "timestamp": 1780719748,
    "from": "254635793186937@lid",
    "fromMe": false,
    "source": "app",
    "to": "584226371748@c.us",
    "body": "Hola",
    "hasMedia": false,
    "media": null,
    "ack": 1,
    "ackName": "SERVER",
    "location": null,
    "vCards": [],
    "_data": { "id": {} }
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/crm_conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      contact_id: "5d689faa-a108-4f07-80a6-094c1637868b",
      direction: "inbound",
      type: "text",
      content: "Hola",
      metadata: payload
    })
  });
  const data = await res.json();
  console.log("Insert result:", JSON.stringify(data, null, 2));
}

run();
