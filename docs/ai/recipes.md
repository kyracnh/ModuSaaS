# Short development recipes

Read AGENTS.md, then only the module involved. Reuse existing services before generating replacements.

| Task                 | Start here                                                                | Minimum change                                                                                             |
| -------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Dashboard page       | src/app/dashboard, config/app.ts                                          | Add page; requireUser for private reads; add centralized nav entry                                         |
| Database entity      | prisma/schema.prisma                                                      | Add model/indexes/owner scope; create migration; regenerate client                                         |
| CRUD feature         | modules/projects/{schema,service}.ts, api/projects, forms/project-manager | Copy the vertical pattern; enforce owner/tenant scope on every query; test cross-user writes               |
| API handler          | server/http.ts                                                            | route wrapper, apiUser, validated body, same-origin mutations, predictable AppError                        |
| Validated form       | forms/auth-form.tsx, ui/field.tsx                                         | useForm + zodResolver, FieldLabel/id, FieldError, async pending/error feedback; validate again on server   |
| AI endpoint          | modules/ai/service.ts, api/ai                                             | Require feature/auth, quota reservation, bounded input/output, abort and usage tracking                    |
| Paid feature         | modules/billing/service.ts                                                | Check verified active/trialing subscription server-side; never trust checkout redirects or client plan IDs |
| Tenant resource      | modules/projects/service.ts                                               | Resolve membership first, admin/owner for writes, include organizationId in every query                    |
| Integration provider | modules/storage/service.ts                                                | Add typed adapter; validate config at invocation; reject unconfigured routes                               |
| Branding             | config/app.ts, app/globals.css, public                                    | Change brand/tokens/assets and public build env; rebuild                                                   |

Example agent prompt: “Add a Notes CRUD resource using the existing Projects vertical slice. Preserve server-side owner/tenant isolation. Add a migration and authorization tests. Run lint, typecheck, unit/integration tests and build. Do not replace the auth/database foundation.”

Example form usage:

```tsx
<Field data-invalid={!!errors.name}>
  <FieldLabel htmlFor="name">Name</FieldLabel>
  <Input id="name" {...register("name")} />
  <FieldError>{errors.name?.message}</FieldError>
</Field>
```

Detailed form templates currently include auth, recovery, profile, password, project CRUD, workspace creation/settings, invitation, file upload and billing. Contact and persistent notification-preference forms are in src/components/forms and settings. Never substitute fake submission handlers.
