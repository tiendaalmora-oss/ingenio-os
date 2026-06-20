# Ingenio OS - Master Context

This is the **single source of truth** for all AI agents operating on Ingenio OS.

## 1. Purpose of Ingenio OS
Ingenio OS is an automated operational system, CRM, and software distribution platform built primarily for selling, delivering, and managing software products (like VerdeOS). It is designed as a Single Operator System, eliminating multi-tenant overhead, to maximize automation via AI and WhatsApp.

## 2. Technology Stack
*   **Frontend & API**: Next.js 14 (App Router)
*   **Backend & DB**: Supabase (PostgreSQL)
*   **Messaging**: WAHA (WhatsApp HTTP API)
*   **AI Routing & NLP**: OpenRouter (Claude 3 Haiku / Opus) & Groq
*   **Hosting**: Vercel (for Next.js) and VPS/Docker (for WAHA)

## 3. Core Flows
*   **WhatsApp Flow**: Leads enter via Meta Ads with `@lid` or direct WhatsApp with `@c.us`. Webhooks are received at `/api/webhooks/whatsapp`.
*   **AI Flow**: Inbound messages are passed to `lib/ai/processor.ts`. The AI Router (`lib/ai/router.ts`) uses OpenRouter to classify the intent and assign a Funnel. If a Funnel is active, the Gatekeeper AI evaluates if the user can advance.
*   **CRM Flow**: Manual overrides and pipeline management happen via the Next.js UI (`/hq`).

## Critical Production Rules
*   **Never modify WhatsApp webhook logic without documenting the change.**
*   **Never modify CRM status transitions without documenting the change.**
*   **Never modify database schemas without updating 03-DATABASE.md.**
*   **Never change OpenRouter model routing without updating 06-AI-SYSTEM.md.**
*   **Always document new environment variables.**

## AI Agent Startup Procedure
Every AI agent must follow these steps before executing code changes:
1.  Read `MASTER_CONTEXT.md`
2.  Read the relevant module documentation (`0X-XXX.md`)
3.  Check `12-KNOWN-ISSUES.md`
4.  Check `13-DECISIONS.md`
5.  Only then propose changes.

## Architecture Confidence
*   **Next.js App Router**: Documented
*   **Supabase Schema**: Documented
*   **WhatsApp / WAHA Integration**: Documented
*   **AI Router & Processor**: Documented
*   **CRM HQ Interface**: Partially Documented
*   **Creative Lab / Meta Ads Scripts**: Unknown
