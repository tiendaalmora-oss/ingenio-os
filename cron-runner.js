const http = require('http');

console.log("[CRON RUNNER] Iniciando el reloj interno de Drip Engine...");

// Ejecutar cada 10 minutos (10 * 60 * 1000 ms)
const INTERVAL = 10 * 60 * 1000;

setInterval(() => {
  console.log("[CRON RUNNER] Llamando a /api/cron/drip-engine...");
  
  const req = http.get('http://localhost:3000/api/cron/drip-engine', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`[CRON RUNNER] Respuesta (${res.statusCode}):`, data);
    });
  });

  req.on('error', (err) => {
    console.error("[CRON RUNNER] Error al ejecutar cron:", err.message);
  });
}, INTERVAL);
