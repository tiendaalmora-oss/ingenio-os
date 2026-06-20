# 13 - Architecture Decisions

1.  **Synchronous Webhooks**: Decided to remove the 15-second debouncer in the WhatsApp webhook to guarantee immediate execution before Vercel freezes the lambda.
2.  **HTML over React for Landings**: Merged HTML landing pages directly to ensure <1s load times for Meta Ads traffic.
