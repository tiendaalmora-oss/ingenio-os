# 06 - AI System

```mermaid
graph TD;
    A[Raw Message] --> B[AI Processor]
    B --> C{Has Funnel?}
    C -->|No| D[AI Router]
    D --> E[Anthropic Claude 3 Haiku]
    C -->|Yes| F[AI Gatekeeper]
    F --> G[Evaluate Intent to Advance]
```

*   **Router**: Located in `lib/ai/router.ts`. Uses `OPENROUTER_MODEL`.
*   **Gatekeeper**: Evaluates if the user's intent fulfills the requirement to advance to the next funnel step.
