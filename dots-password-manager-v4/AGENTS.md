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
