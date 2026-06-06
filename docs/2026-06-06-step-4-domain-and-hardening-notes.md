# Step 4 Domain And Hardening Notes — 6th June 2026

## Current Step

Step 4 is now active: launch hardening and docs alignment.

Step 3 is intentionally deferred until real connector and Dodo credentials are available. The skipped work is recorded in `docs/2026-06-06-real-connector-and-billing-verification.md`.

## Canonical Origins

- `https://feedbacks.dev`: marketing and documentation.
- `https://app.feedbacks.dev`: hosted dashboard, API, widget assets, public boards, and board directory.
- Self-hosted deployments: replace the hosted app origin with the operator's own dashboard domain through `NEXT_PUBLIC_APP_ORIGIN`.

## Files Aligned In This Pass

- `README.md`: hosted public boards and REST API examples now use `https://app.feedbacks.dev`.
- `packages/dashboard/src/app/page.tsx`: landing REST API snippet now uses `publicEnv.NEXT_PUBLIC_APP_ORIGIN`.
- `docs/DEPLOYMENT.md`: self-hosted examples should use the deployment's app origin, not the hosted marketing domain.
- `DESIGN.md`: product UI guidance now exists outside the launch plan and Impeccable memory.
- `PRODUCT.md`: Impeccable-compatible product context now mirrors the existing `.impeccable.md` design context.

## Security Posture Review

### Rate Limiting

Current state:

- `packages/dashboard/src/lib/rate-limit.ts` uses a database-backed `DELETE -> COUNT -> INSERT` flow.
- This is functional for launch-scale local and early hosted traffic.
- It is race-prone under high burst traffic because the check and insert are not atomic.

Decision:

- Keep the current implementation for this pass.
- Before heavier launch traffic, replace it with an atomic database function or bucketed counter model.

### Stored Integration Secrets

Current state:

- Webhook URLs and GitHub tokens are normalized server-side.
- GitHub tokens must never be shown in page text, logs, screenshots, or docs.
- Delivery logs should keep response bodies short and must not include secrets.

Decision:

- Keep the current product behavior for this pass.
- Before production signoff, re-check every integration screen and delivery-log payload for secret leakage.
- Future hardening should consider encrypted-at-rest connector secrets if this becomes a hosted SaaS default.

### Outbound Webhook Signatures

Current state:

- Incoming Dodo webhooks have signature and timestamp verification.
- Outbound Slack, Discord, generic, and GitHub deliveries do not expose a first-party verification signature for recipients.

Decision:

- Do not add outbound signatures in this pass.
- Before launch, decide whether generic webhooks need an optional per-endpoint signing secret and headers such as `X-Feedbacks-Timestamp` and `X-Feedbacks-Signature`.

### Migrations

Current state:

- `docs/DEPLOYMENT.md` lists the ordered migration chain.
- Live Supabase schema verification was not performed in this pass.

Decision:

- Keep the ordered migration chain as the source of truth.
- Re-run empty-database migration verification before launch, then compare live Supabase schema against repo migrations if credentials are available.

## Next Step 4 Work

1. Finish any remaining domain references in active docs or generated examples.
2. Re-run type-check and lint after code/docs alignment.
3. Run browser acceptance again after any UI-facing changes.
4. Revisit Step 3 as soon as real connector and Dodo credentials are available.
