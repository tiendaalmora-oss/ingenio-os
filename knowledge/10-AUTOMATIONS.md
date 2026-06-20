# 10 - Automations

*   **Background Processing**: Previously used a `setTimeout` debouncer, but due to Vercel's serverless architecture freezing execution, all message processing must be strictly synchronous within the webhook lifecycle.
*   **Cron Jobs**: *Pendiente de documentar*.
