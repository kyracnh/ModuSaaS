# Initial public release gates

- [ ] Validate fresh clone and generated minimal/standard installs on supported Node 24 platforms.
- [ ] Pass lint, formatting, strict typing, unit, integration and desktop/mobile E2E suites.
- [ ] Verify SMTP verification/recovery/invitation expiry and member-removal safeguards.
- [ ] Review threat model, proxy IP handling, body limits, rate-limit retention, backup/restore and deletion policy.
- [ ] Verify Stripe test mode end-to-end (checkout, portal, invoices, cancellation, replay/out-of-order webhooks, concurrent checkout safeguards).
- [ ] Verify configured OpenAI, Anthropic and Google models, streaming cancellation and usage reconciliation.
- [ ] Verify private S3 upload/download/delete and persistent local file permissions.
- [ ] Verify production Node + Docker Compose health and PostgreSQL/upload persistence across restarts.
- [ ] Complete remaining required component/form templates or explicitly reduce advertised release scope.
- [ ] Review direct/transitive dependency licenses and vulnerabilities, capture real product screenshots.
- [ ] Review CI on GitHub, version pins and release documentation; no credentials in tracked files.
- [ ] Publish only with explicit maintainer authorization. Local implementation does not imply deployment or npm publication.

IMPLEMENTATION_STATUS.md records which checks were actually run in this environment.
