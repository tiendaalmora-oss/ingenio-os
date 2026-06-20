# 05 - WhatsApp Integration

```mermaid
graph TD;
    A[WhatsApp Client] --> B[WAHA Docker Instance]
    B -->|HTTP POST| C[/api/webhooks/whatsapp]
    C --> D[Parse fromMe & Multimedia]
    D --> E[Transcribe Audio via Groq/OpenAI]
    E --> F[Execute AI Processor synchronously]
```

*   **Identifiers**: Standard WhatsApp uses `@c.us`. Meta Ads clicks generate temporary `@lid` identifiers.
*   **Audio**: `ptt` and `audio` types are downloaded via WAHA and transcribed before hitting the AI Router.
