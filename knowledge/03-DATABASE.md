# 03 - Database Schema

The system uses Supabase PostgreSQL. Key tables:

*   **crm_contacts**: Stores `phone` (unique), `name`, `status` ('bot', 'humano'), `funnel_id`, `current_step_id`, `tags` (text[]).
*   **crm_conversations**: Stores message history. `direction` ('inbound', 'outbound'), `type`, `content`, `metadata` (JSONB storing JID, transcript success, etc).
*   **funnels** & **funnel_steps**: Defines the state machine for the AI.
*   **bot_templates**: The exact text sent at each funnel step.
*   **products**: `slug`, `name`, `status`.
