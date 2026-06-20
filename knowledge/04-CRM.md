# 04 - CRM Flow

```mermaid
graph LR;
    A[Inbound Message] --> B[crm_contacts Insert/Update]
    B --> C[AI Classification]
    C --> D[Funnel Step Assigned]
    D --> E[Status: bot]
    E --> F{Escalation?}
    F -->|Yes| G[Status: humano]
    F -->|No| H[Auto-advance]
```

The CRM is accessible via the Next.js frontend at `/hq`. Manual advances via the UI trigger `/api/crm/contacts/[id]/route.ts` which correctly resolves the WhatsApp JID from conversation history.
