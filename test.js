async function run() { 
  require('dotenv').config({path: '.env.local'});
  const url = 'https://openrouter.ai/api/v1/chat/completions'; 
  const apiKey = process.env.OPENROUTER_API_KEY;
  const body = { 
    model: 'google/gemini-2.5-flash', 
    messages: [
      {
        role: 'system', 
        content: `Eres un Gatekeeper... ETAPA ACTUAL: validacion
OBJETIVO: Tu único objetivo en esta etapa es ESCUCHAR ACTIVAMENTE... proponerle la solución... cerrando con una pregunta de doble opción...

¿El último mensaje del usuario cumple con el OBJETIVO de esta etapa y requiere avanzar a la siguiente?
- Si la respuesta es SÍ: Devuelve un JSON con accion="avanzar" y respuesta_ia="".
- Si la respuesta es NO: Devuelve un JSON con accion="responder" y redacta en respuesta_ia lo que el bot debe contestar.`
      }, 
      {
        role: 'user', 
        content: 'Avícola'
      }
    ], 
    response_format: { type: 'json_object' } 
  }; 
  
  const res = await fetch(url, { 
    method: 'POST', 
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' }, 
    body: JSON.stringify(body) 
  }); 
  console.log(await res.text()); 
} 
run();
