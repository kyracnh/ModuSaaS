# AI module

Enable `NEXT_PUBLIC_PRESET=full` before building. Set `AI_PROVIDER` to openai/anthropic/google, `AI_MODEL` to a model supported by that provider, and the matching `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`. The default model is OpenAI-specific; change it when changing provider. No provider key is required by the rest of the app.

`POST /api/ai` accepts `{prompt, conversationId?, mode?}`. Mode is chat (streamed plain text), text, structured (validated summary/actions), or tools (a read-only clock example). Requests require auth and same-origin headers, validate 1–8000 characters, and cap context/output. The model is selected only on the server. AI SDK retries once; request AbortSignal propagates cancellation. Conversation IDs are always scoped to the signed-in user.

A per-user database lock reserves a daily request before contacting the provider. Failed/cancelled requests count toward the daily request quota; this prevents concurrent quota bypass. Token totals are recorded only when returned. Aborted requests can have unreported billable provider usage, and reservations interrupted by process death remain reserved. These are request limits, not guaranteed token/spend caps. For strict spend control, add provider budgets, reconciliation and weighted reservations. Never advertise hard token quotas from these request counters.

Optional `AI_INPUT_COST_PER_MILLION` and `AI_OUTPUT_COST_PER_MILLION` control cost estimates for the selected model. Defaults of zero mean unknown/unconfigured pricing, not that a provider is free. Estimates are not invoices. Update model prices as providers change.

The UI renders responses as plain text, provides a conversation list, streaming output, retry-as-new-request, format selection, cancellation and usage display. It does not execute model commands. Only a read-only tool is registered. Any future tool with side effects must authorize the authenticated user and require explicit user approval. Prompts/responses are persisted privately to support conversations but are not logged; document retention and deletion for your product. Embeddings/RAG/vector storage are not implemented.

Minimal reuse: add your prompt/schema in `src/modules/ai`, call the existing provider factory after `apiUser`, `feature`, `rateLimit` and `reserveUsage`, then persist usage on success/failure. See the existing route instead of copying unguarded SDK examples.
