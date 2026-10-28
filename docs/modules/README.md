# Module guide

## Authentication

`src/modules/auth/auth.ts` configures Better Auth's Prisma adapter, server-validated sessions, 12–128 character passwords, database-backed sensitive-route limits and optional OAuth. `requireUser` protects Server Components; `apiUser` protects APIs. Better Auth handles password hashing, session cookies, auth CSRF and token expiry. Mutation APIs enforce the configured same origin. Do not trust client user IDs.

Set SMTP to enable verification on signup. Recovery uses Better Auth's expiring token flow. With no email provider, local signup does not require verification; production must configure SMTP. Already-registered unverified accounts require a verification email request. Account deletion requires a password/recent authentication, rejects owners of workspaces, active provider subscriptions, and accounts with uploaded files. OAuth-only account deletion is an extension area. No custom cryptography.

## Teams

Enable the standard/full preset. Better Auth organization APIs own invitation expiry, owner safeguards and role changes. The workspace UI creates/switches/renames teams, invites members and removes members. Invitations require SMTP and signed-in acceptance at `/invite/:id` using the recipient's account. Resource reads require membership; writes require owner/admin. Individual resources always have organizationId=null. Team projects currently use the free team limit; individual Pro billing does not upgrade a team. Role-change and owner-transfer UI remains future work; use maintained Better Auth APIs.

## Billing

Full preset + `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`. Configure Stripe to send supported checkout/subscription/invoice events to `/api/webhooks/stripe`. Use Stripe CLI locally and HTTPS publicly. Plan prices come only from server configuration. Checkout redirects do not grant entitlements.

Webhooks verify the raw-body signature, lock per customer, reread canonical subscription state and record event IDs transactionally. Retries are safe; out-of-order event snapshots are never applied. Stripe customer creation uses a stable idempotency key. Multiple simultaneous checkout sessions can still create duplicate subscriptions; enforce provider-side policies and review before public billing release. Provider secrets are never returned to the client. Portal includes supported invoice history and cancellation controls. Trial policy can be configured in Stripe; no local trial configuration UI exists.

## Email

`sendEmail` uses SMTP and React Email's renderer. It escapes content using React, emits text alternatives and does not log email URLs or tokens. Verification/reset/invitation call the real transport. Contact delivery requires CONTACT_EMAIL plus SMTP; notification preferences persist independently and do not schedule messages. Welcome/billing-specific email templates are not yet included. Mailpit's local API is for development only and must never be exposed publicly.

## Files

Full preset. `STORAGE_PROVIDER=local` uses an ignored private `.data/uploads` directory; S3 uses a private bucket and server-side SDK credentials or the hosting platform's credential chain. Configure endpoint/region/bucket for compatible storage. Owners download through authenticated attachment routes. SVG/HTML/executables are rejected; the server validates a size bound, MIME allowlist and initial file signatures. This is not malware scanning or complete file-format validation. Configure request-body limits at the reverse proxy too; an attacker must not be able to bypass upload limits with chunked payloads.

Local filesystem storage requires persistent disks and is unsuitable for ephemeral/serverless filesystems. Use S3 there. Delete files before account deletion; no background orphan cleanup is provided.

## Notifications and extension points

Standard/full presets store notifications transactionally when projects are created. Listing/marking read are scoped to the signed-in user. Polling/UI reload replaces real-time infrastructure. Analytics, error tracking, jobs, caches and search provider adapters remain future work; core logging exposes a request identifier and error type rather than prompts, credentials or SQL errors. Clean expired request limits, old usage and notifications according to your retention policy before large-scale operation.
