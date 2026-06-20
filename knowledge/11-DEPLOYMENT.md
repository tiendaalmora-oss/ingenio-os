# 11 - Deployment

*   **Frontend/API**: Hosted on Vercel. Deploys automatically on `git push` to `main`.
*   **WhatsApp Engine**: WAHA is hosted separately (likely a VPS or Railway) and pushes webhooks to the Vercel app.
*   **Database**: Supabase.
