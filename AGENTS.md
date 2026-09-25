# Repository guidance

Repository-wide defaults; follow the user's current request when it changes the task scope. More specific `AGENTS.md` instructions apply to their subtree; `AGENTS.override.md` takes precedence in the same directory.

## Working agreement

- Communicate in Traditional Chinese unless requested otherwise. Read-only reviews produce findings with file locations and practical impact, without edits.
- Write project documentation prose in English. Include non-English text only when an exact runtime or provider value is needed for an operation, and identify its source in code.
- For implementation or optimization, finish the requested change, verify its behavior, and fix related failures before handing off. Resolve routine choices within the authorized scope; ask when missing information materially changes the outcome.
- Inspect `git status` before editing, preserve unrelated work, and stage only intended files. Keep ignored `audit/` evidence; it is historical context, not the current issue list.
- Commit or deploy when requested. Deployment includes the necessary commit and push. Report changes, verification, remaining limitations, and commit/deployment status; distinguish local checks from production checks.

## Project context and task references

Next.js App Router, React, TypeScript, native CSS; Node.js 24 and npm (`npm ci`). English routes have no prefix; Chinese routes use `/zh-tw` and `/zh-cn`. See [README.md](README.md#project-layout) for the directory map.

Read the guide relevant to the change, rather than loading every guide:

- UI and interaction changes: [style guide](docs/STYLE_GUIDE.md), including CSS ownership, cascade, typography and motion tokens.
- Service boundaries, portfolio data or operations: [technical architecture](docs/TECHNICAL_ARCHITECTURE.md).
- Email and subscription changes: [Resend integration](docs/RESEND_INTEGRATION.md); coordination and recovery use [Redis runtime](docs/TECHNICAL_ARCHITECTURE.md#redis-runtime) and [subscription reconciliation](docs/TECHNICAL_ARCHITECTURE.md#subscription-reconciliation).
- Payment changes: [Stripe integration](docs/STRIPE_INTEGRATION.md).

Keep README concise and detailed procedures in `docs/`. Update the relevant guide when behavior or commands change.

## Implementation constraints

- Use `getLocalizedPath` / `getLanguageAlternates` in `lib/i18n.ts` and `createRootMetadata` / `createPageMetadata` in `lib/site-config.ts`. Links and sharing metadata must resolve to the correct language and page.
- Keep static copy in server components and client boundaries small. Reuse `lib/escape-html.ts`, `HoneypotField`, submission hooks and `postJson`; preserve each form's submission, idempotency and retry semantics.
- Preserve deliberate language, layout and form variants. Preserve verified research and monthly portfolio snapshots unless a content update is requested; these are not live prices.
- Preserve existing text colors in every state, including opacity, unless a color change is requested. Reuse semantic tokens and preserve the CSS import order in `app/globals.css`.
- Keep menu visibility, focus and scroll restoration synchronized. Touch hover resets must retain active and keyboard-focus feedback.

## Service boundaries

- Keep credentials and service modules server-side, including `server-only` boundaries. The Node test loader does not enforce Next.js boundaries. Use `.env.example`; never print or commit secrets, private email payloads or preference tokens. Verify current cloud configuration rather than trusting historical resource IDs.
- Route Redis commands through `executeRedisCommand`. Preserve shared subscriber locks and durable journals. Lease expiry does not resolve an unknown provider outcome: do not clear unresolved records or replay ambiguous welcome events. Unsubscribe retains the shared lock and unresolved journal while bypassing the journal gate.
- Confirm payment through server-side Stripe Session verification; URL parameters cannot establish success. Preserve pending and unverified states.
- Routine tests mock provider writes. Real email, production subscriber changes and live payments require authorization for those actions; deployment does not authorize test transactions.

## Verification and review

For non-deployment work, run only checks relevant to the changed behavior; do not run the full `npm run verify` or complete browser suites unless the user explicitly requests them. Local unit tests mock service operations; Playwright starts an isolated server without Resend/Redis credentials. Fix failures related to the change without repeatedly seeking permission. Tool and sandbox permissions still apply.

| Change | Completion checks |
| --- | --- |
| Documentation only, without deployment | Links, anchors, references and `git diff --check`; no application suite |
| Application code or configuration, without deployment | Focused type, lint, format, unit or browser checks for the affected files and behavior, then `git diff --check` |
| Shared UI, without deployment | Targeted browser checks for affected languages, layouts and interactions; include enlarged text, keyboard, touch or reduced motion when relevant |
| Deployment | `npm run verify` (types, lint, unit tests, Chromium and production build), plus `npm run test:webkit` for shared UI changes; then `git diff --check` |

Install missing browser binaries with `npx playwright install chromium webkit`. Once checks pass, repeat only when subsequent changes or unresolved failures justify it. Add behavioral regression coverage for changed risks; update source-structure assertions during refactors without weakening user-visible coverage. For animation fixes, check intermediate visual states and repeated/interrupted input, not merely whether an animation was created. WebKit automation does not establish physical iPhone behavior.

Reviews should prioritize demonstrable violations of the constraints above, with precise locations and consequences. Leave formatting to lint; intentional variants are not defects solely because they duplicate markup.

## Deployment completion

Use the existing GitHub Actions and Vercel Git integration. Push authorized releases to `main`; new branches use `codex/` unless requested otherwise. Preserve `vercel.json`'s exact-commit CI gate, package integrity checks and browser suite. Keep the gate outside `npm run build` and runner-specific workarounds in the workflow; fix failed checks rather than bypassing them.

Deployment is complete only after GitHub Actions succeeds, Vercel is `READY`, the deployed commit and production aliases match, and affected routes pass read-only production smoke checks.

## Maintaining this file

Keep only durable project constraints, task-specific references and executable completion criteria. Consolidate duplicated rules; put detailed procedures in the linked guides. Add nested instructions only for genuine subtree differences. After changing instruction files, verify the active instruction sources in a fresh Codex run from the intended directory.

References: [AGENTS.md configuration](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Rethinking skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
