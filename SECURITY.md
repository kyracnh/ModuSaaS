# Security policy

This is an engineering preview, not a security-audited production release. Do not use real customer data without your own security review.

Report vulnerabilities privately through GitHub Security Advisories for this repository when available. If private reporting is unavailable, contact a maintainer privately before disclosing details; do not post secrets or exploit instructions in public issues. No response-time SLA is promised.

Keep dependencies current, require HTTPS and SMTP in production, sanitize forwarded IP headers at your edge, scope database/S3 permissions, back up persistent data, and never enable development diagnostics publicly. See docs/modules/README.md and docs/deployment/README.md for known limitations.
