# 12 - Known Issues

1.  **Vercel Timeout Freeze**: `setTimeout` cannot be used for background tasks (like debouncers) without specific Edge runtime or WaitUntil configurations.
2.  **Meta Ads @lid**: Manual message injections failed because the code hardcoded `@c.us`. Fixed by querying `crm_conversations` to find the real JID.
3.  **OpenRouter Model Typos**: If `OPENROUTER_MODEL` doesn't exist, the router fails silently. Hard fallback to `anthropic/claude-3-haiku` is in place.
