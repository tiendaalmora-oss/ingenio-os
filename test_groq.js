const fs = require('fs');

async function run() {
  const apiKey = fs.readFileSync('C:\\Users\\Compumar\\Google Atigravity\\groq.txt', 'utf8').trim();
  
  // Download a sample OGG file
  const resMedia = await fetch("https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg");
  const buffer = await resMedia.arrayBuffer();
  
  const blob = new Blob([buffer], { type: "audio/ogg" });
  const formData = new FormData();
  formData.append("file", blob, "audio.ogg");
  formData.append("model", "whisper-large-v3-turbo");
  
  console.log("Transcribing with Groq Whisper...");
  
  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`
    },
    body: formData
  });
  
  if (!res.ok) {
    console.error("Error Groq Whisper:", await res.text());
    return;
  }
  
  const data = await res.json();
  console.log("Transcription successful:", data.text);
}

run();
