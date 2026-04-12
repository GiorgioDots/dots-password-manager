# AGENTS.md

This file defines repository-specific guidance for coding agents working in this project.

## Scope

- Applies to the `dots-password-manager-v4` app.
- Prioritize minimal, targeted edits over broad refactors.

## Core Principles

- Preserve behavior parity with the legacy app, especially around auth, crypto, and DB compatibility.
- Keep UI changes consistent with existing shadcn + Tailwind patterns.
- Prefer safe defaults, explicit error messages, and backwards-compatible fallbacks.

## Security Rules

- Never log secrets or raw tokens.
- Treat values in `.env*` as sensitive.
- Do not hardcode credentials, DB URLs, JWT secrets, or crypto keys in source.
- Prefer environment variables over custom secret files when deployment platform constraints require it.

## Env and Config Conventions

- DB config must support both:
    - `DATABASE_URL`
    - Split vars: `DATABASE_PROTOCOL`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, optional `DATABASE_SSLMODE`
- Auth config must support env-based secrets (`JWT_SECRET`, `CRYPTO_BASE_64_KEY`).
- When touching secret loading or crypto logic, keep compatibility with legacy newline-terminated secret file content.

## Crypto Compatibility Guardrails

- Existing encrypted data must remain decryptable after env/config migrations.
- If key-material handling changes, add or update tests proving compatibility.
- Keep deterministic test vectors for encryption/decryption paths.

## Coding Standards

- Follow existing TypeScript style and import conventions.
- Avoid unrelated formatting churn.
- Keep route search typing strict for TanStack Router.
- Use small reusable UI components where appropriate.
- Do not use unary `void` to discard function return values; handle promises explicitly with `await` or `.catch(...)`.

## Form Standard (TanStack Form + shadcn Field)

- Build forms with `@tanstack/react-form` and shadcn `Field` primitives (`Field`, `FieldLabel`, `FieldError`).
- Define validation rules in `useForm({ validators: { ... } })` as the default approach.
- Prefer form-level validators that return `fields` errors for consistency across inputs.
- Do not use browser-native validation UI:
    - add `noValidate` on `<form>`
    - avoid `required` attributes when equivalent TanStack validation exists
- Wire each input to TanStack field handlers (`value`, `onChange`, `onBlur`).
- Reflect invalid state in both layers:
    - set `data-invalid` on `Field`
    - set `aria-invalid` on the input/control
- Render validation feedback with `FieldError` (prefer the `errors` prop when available).
- Disable all controls and submit actions while `isSubmitting` is true.
- Keep validation messages explicit and user-facing (no vague generic errors).

## Validation Checklist (run after meaningful code changes)

1. `npm run lint`
2. `npm run test` (or targeted test files for changed areas)
3. `npm run build` for production-impacting changes (SSR, routing, env, auth, crypto)

## Docker/Deployment Notes

- Production runtime entrypoint is `dist/server/server.js`.
- Keep Docker image multi-stage and production-focused.
- Ensure runtime reads env vars provided by the platform (`--env-file` locally, platform env config in cloud).

## Agent Workflow Expectations

- Re-read files before editing if user indicates they changed.
- If behavior-critical code is touched (auth/crypto/db), explain the risk and the compatibility strategy.
- Prefer concrete fixes with verification over speculative changes.
- When a user reports regression, reproduce or add regression tests whenever feasible.

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills: - task: "keep route search typing strict for TanStack Router"
load: "node_modules/@tanstack/router-core/skills/router-core/search-params/SKILL.md" - task: "route protection and redirects in (protected) routes"
load: "node_modules/@tanstack/router-core/skills/router-core/auth-and-guards/SKILL.md" - task: "server handlers in createFileRoute server blocks for /api routes"
load: "node_modules/@tanstack/start-client-core/skills/start-core/server-routes/SKILL.md" - task: "TanStack Start app setup with tanstackStart, routeTree.gen.ts, and document shell"
load: "node_modules/@tanstack/start-client-core/skills/start-core/SKILL.md" - task: "deploying Node.js or Docker production runtime"
load: "node_modules/@tanstack/start-client-core/skills/start-core/deployment/SKILL.md"

<!-- intent-skills:end -->
