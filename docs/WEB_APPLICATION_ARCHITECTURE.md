# Web Application Architecture

Use this guide to design, review and operate the application. Architecture principles define the standard. Project decisions explain selected approaches and their limits. Operational procedures define verification, data updates and releases. A working implementation does not establish compliance or justify an exception.

## Navigation

- [Architecture principles](#architecture-principles): references, types, boundaries, state, data, rendering, forms and verification.
- [Project decisions](#project-decisions): [technology stack](#technology-stack), domain contracts and conditions for reconsideration.
- [Operational procedures](#operational-procedures): tests, portfolio updates, performance checks and releases.

## Architecture Principles

Apply these principles before choosing an implementation. Distinguish a source recommendation from a project requirement or an example.

### Architecture References

Use the categories below within their assigned responsibilities. Official documentation governs supported behavior. Within a category, prefer earlier references when guidance conflicts in the same domain and context. CI/CD and SEO references govern their own domains; templates provide examples only. Web standards, accessibility requirements and supported framework behavior constrain every choice.

#### Official Documentation

| Reference                                                                      | Responsibility                                                                                  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) | Type-system behavior, narrowing, generics and language constructs.                              |
| [React](https://react.dev/learn)                                               | Component behavior, rendering, state, hooks and React APIs.                                     |
| [Next.js](https://nextjs.org/docs)                                             | App Router conventions, server/client execution, caching, routing, metadata and framework APIs. |
| [MDN Web Docs](https://developer.mozilla.org/)                                 | HTML, CSS, JavaScript, browser APIs and compatibility.                                          |
| [web.dev](https://web.dev/)                                                    | Web performance, Core Web Vitals, accessibility and browser-facing implementation guidance.     |

MDN and web.dev explain web-platform practice; normative web standards take precedence. Check APIs against the installed framework version. Use the bundled Next.js documentation when available. A general React example does not override a Next.js routing contract.

#### Best Practices

| Reference                                                                                                                 | Responsibility                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)                                           | Practical React typing for props, events, hooks, context and refs.                                         |
| [Bulletproof React](https://bulletproof-react-app.netlify.app/) · [Source](https://github.com/alan2207/bulletproof-react) | Feature organization, dependency boundaries, API access, state ownership, testing, errors and performance. |
| [Josh W. Comeau](https://www.joshwcomeau.com/)                                                                            | Rendering, hydration, React performance and CSS implementation mechanics.                                  |
| [Robin Wieruch](https://www.robinwieruch.de/)                                                                             | Composition, forms, mutations and client/server data-fetching workflows.                                   |
| [vercel-labs](https://www.skills.sh/vercel-labs)                                                                          | Task-specific React/Next.js optimization, composition, interface review and writing guidance.              |
| [Build Web Apps](https://www.codex-marketplace.com/plugins/build-web-apps)                                                | Applicable frontend implementation, testing, debugging and component workflows.                            |

The selected vercel-labs skills are `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines` and `next-best-practices`. Their installed paths and provenance are recorded under [Installed Agent Skills](#installed-agent-skills). A directory listing is not an instruction to install every skill. The linked Build Web Apps marketplace is a third-party catalog; use the installed plugin's actual skill instructions to determine capabilities and execution requirements.

Apply each skill only to its stated task and framework context. Examples and defaults are conditional guidance, not universal requirements. These references do not redefine the visual system or override official API behavior. Agent execution rules remain in [AGENTS.md](../AGENTS.md).

#### SEO

| Reference                                                     | Responsibility                                                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [Google Search Central](https://developers.google.com/search) | Google crawling, indexing, canonicalization, localized pages, structured data and search policies. |
| [Semrush Blog](https://www.semrush.com/blog/)                 | Supporting SEO research, content planning and practical audit techniques.                          |

Google's documentation takes precedence for Google Search behavior and eligibility. Semrush advice does not establish a ranking requirement or require a paid subscription. Verify changes against served pages and search-provider evidence; local tests do not prove indexing or ranking improvements.

#### Templates

| Reference                                                                                   | Responsibility                                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [Next.js Portfolio Starter Kit](https://vercel.com/templates/next.js/portfolio-starter-kit) | Portfolio and publishing implementation examples.     |
| [Next.js App Router Playground](https://vercel.com/templates/next.js/app-directory)         | Examples of App Router features and routing behavior. |

Templates illustrate implementation options. They do not prescribe this project's dependencies, visual design or architecture. Check source versions and adopt only examples that satisfy the principles above.

The [Design System](DESIGN_SYSTEM.md) owns visual rules; [Integrations](INTEGRATIONS.md) owns provider configuration and recovery. Cite the specific section supporting an adopted rule. Label conditional recommendations and project choices. Record a departure's requirement, alternatives, trade-off, verification and review trigger. Existing code, migration effort or a passing build alone is not sufficient justification.

### CI/CD References and Principles

These references govern workflow execution and release controls. They complement the official documentation and best-practice references above without changing their responsibilities.

| Priority | Reference                                                                                                                                              | Responsibility                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 1        | [GitHub Actions documentation](https://docs.github.com/en/actions)                                                                                     | Supported syntax, event behavior, permissions, runners, caching, security and deployment controls. |
| 2        | [Awesome Copilot CI/CD guidance](https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md) | Practical workflow organization, efficiency, testing, diagnostics and release-review checklists.   |

Official platform behavior takes precedence over conflicting checklist advice. Awesome Copilot is supporting instruction material, not a platform specification or an installed Agent Skill. Verify example versions and applicability before adoption. Container signing, self-hosted runners, broad runtime matrices and additional deployment tools require a demonstrated need.

Apply the following requirements when reviewing CI/CD:

- Grant only the permissions each job needs. Keep PR code separate from privileged deployment contexts. Pass untrusted values through quoted environment variables rather than interpolating them into shell programs. Never expose provider credentials in test artifacts.
- Lock action dependencies using a [workflow dependency lockfile](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles) where supported, or verified full commit SHAs. The lockfile feature is in public preview; verify availability before adoption. Review dependency updates; mutable version tags alone do not provide immutable execution inputs. Follow GitHub's [secure use reference](https://docs.github.com/en/actions/reference/security/secure-use).
- Declare meaningful triggers, job dependencies, timeouts and concurrency. Cancellation must not leave an uncontrolled deployment. Required result jobs must reject missing, failed or unexpectedly skipped prerequisites.
- Install from the package lock. Treat caches as disposable acceleration, not verification evidence. Restrict cache reuse to compatible inputs and trust boundaries.
- Test the release candidate and retain diagnostic evidence with bounded retention. Reusing results requires verified source identity, complete coverage, compatible configuration and a freshness limit. A matching source tree does not prove identical runner images or rebuilt artifacts.
- Measure queue, setup, build and test time separately before changing parallelism. Balance elapsed time, runner usage and complete coverage. Consolidate builds only when platform and environment compatibility are established.
- Bind release authorization to the intended commit and destination. Verify the deployed revision and live alias after publication. Use environment protections when Actions performs deployment; when another platform deploys, verify its equivalent controls. GitHub environments alone do not protect an external deployment. See [deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).

Project decisions and operational procedures below record implementation choices, not exceptions to these requirements. Repository files cannot establish live branch protection, secret access or provider settings; verify those separately and report inaccessible settings as unverified.

### Type and Component Contracts

Use types to describe valid inputs and states without concealing uncertainty:

- Prefer inference for initialized values and inline handlers. Declare types at public boundaries and where inference loses meaning.
- Model absent values with explicit unions. Use discriminated unions for mutually exclusive states and reducer actions.
- Inherit native element props with React's component-prop utilities. Preserve native attributes, events and refs in wrappers.
- Use specific DOM element types for refs. In React 19+, prefer refs as props; use older patterns only for version compatibility.
- Give Context a meaningful default or use a nullable value with a checked consumer hook. Prefer a clear missing-provider error over an unsupported assertion.
- Define custom-hook return contracts. Use tuples when positions convey meaning; use objects for larger named interfaces.
- Treat external data as unknown until runtime validation succeeds. Type assertions do not validate JSON, FormData, storage or provider responses.

The Cheatsheet permits assertions in justified cases; it does not support using them to bypass an unverified boundary. Sources: [props](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example/), [hooks](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks/), [events](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/), [context](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/) and [refs](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/).

### Application Boundaries

Organize domain behavior by feature. Keep feature components, API declarations, types, state, tests and styles near their consumers. Add directories when they clarify ownership, not to reproduce a template.

Dependencies point from application composition to features and shared modules. Shared modules must not depend on features or application code. Compose peer features at the application layer; pass data or behavior through explicit contracts. Prefer direct imports over barrels that obscure boundaries or combine server and client modules.

Keep credentials and privileged operations behind server-only boundaries. Separate transport validation, domain workflows and provider adapters. A component library owns presentation and interaction mechanics, not business outcomes.

Source: [Bulletproof React project structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).

### Code and Components

Give each component a cohesive responsibility. Extract independent UI units from large components rather than accumulating nested rendering functions. Use children or slots when composition reduces an overloaded prop interface. Render callbacks remain appropriate when a consumer needs supplied data.

Create shared abstractions after identifying repeated responsibilities. Wrap third-party components when doing so establishes a stable application contract. Avoid speculative wrappers and abstractions that erase meaningful differences.

Use consistent naming, explicit side-effect boundaries and automated formatting. Comments explain constraints and trade-offs. They should not repeat the implementation.

Sources: [Bulletproof React components](https://github.com/alan2207/bulletproof-react/blob/master/docs/components-and-styling.md) and [project standards](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-standards.md).

### State Ownership

Choose state ownership by lifetime and consumers:

| State        | Ownership rule                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Component    | Keep transient interaction state with its consumers. Lift it to the nearest shared owner when required.                    |
| Application  | Share genuinely application-wide state through a scoped provider or store. Consider update frequency and subscriber scope. |
| Server cache | Keep remote resource identity, freshness, invalidation and mutation reconciliation separate from local UI state.           |
| Form         | Own field values, validation, pending state and submission results within the form workflow.                               |
| URL          | Store navigation state that must survive reloads, history navigation or sharing in validated route/search parameters.      |

Compute values from authoritative inputs when they need no independent lifetime. Do not duplicate the same state across stores without an explicit synchronization contract. Consider composition and lifting state before Context or a global store.

Use a dedicated client-cache library when remote data needs browser-side caching and revalidation. Select a global store or form library for demonstrated requirements, not because an example imports it.

Server module scope is shared across requests. Keep request-specific and user-specific mutable data in request-local scope, explicit arguments or request-scoped context. Shared service clients and immutable configuration may live at module scope if they do not retain mutable request data.

Distinguish request deduplication from cross-request caching. Use framework-supported request memoization where repeated reads justify it. For cross-request caches, define identity, access scope, lifetime, size bounds and invalidation. Include every input that changes the result in the cache key. Never reuse private results across authorization boundaries.

Supporting rules: installed [server request isolation](../.agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md) and [request deduplication](../.agents/skills/vercel-react-best-practices/rules/server-cache-react.md).

Source: [Bulletproof React state management](https://github.com/alan2207/bulletproof-react/blob/master/docs/state-management.md).

### API Contracts and Data Fetching

Use a configured API client for shared transport behavior. Export feature-owned request declarations instead of embedding endpoint logic in rendering code. Define request and consumed-response types, runtime validation, a fetcher and failure behavior.

Bulletproof React recommends a fetching/cache hook alongside client request declarations. Apply that recommendation to client-managed remote resources. For server-owned reads, define server functions and explicit caching and revalidation behavior instead. Do not introduce a browser cache for data that never needs client-side fetching.

Start independent requests concurrently. Sequence requests only when data dependencies or workflow guarantees require it. Place loading and error boundaries around independently useful content. Define mutation effects on cached data, retry safety and pending UI.

Sources: [Bulletproof React API layer](https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md) and [Robin Wieruch's data-fetching patterns](https://www.robinwieruch.de/react-data-fetching-patterns/).

### Rendering and Hydration

Distinguish React Server Components, server-side rendering and hydration. Server Components execute on the server. Client Components can still contribute server-rendered HTML before becoming interactive in the browser.

Place client boundaries where state, effects or browser APIs require them. The module dependency graph determines the boundary. Passing server-rendered children through a client wrapper does not convert those children into client modules.

Keep the initial server and client render consistent. Defer browser-only decisions until mounting when they cannot be resolved consistently on the server. Do not hide avoidable mismatches with hydration-warning suppression. Two-pass rendering is a targeted technique with rendering and layout costs, not a universal loading strategy.

Sources: [Josh W. Comeau on Server Components](https://www.joshwcomeau.com/react/server-components/) and [hydration](https://www.joshwcomeau.com/react/the-perils-of-rehydration/).

### Forms and Mutations

Choose controlled inputs, uncontrolled inputs or Actions according to validation and workflow needs. Specify field errors, submission errors, pending state and success behavior. Client validation improves feedback; the server must validate inputs before changing data.

Input validation does not establish permission. Treat Route Handlers and Server Actions as directly callable endpoints. At each protected mutation boundary, authenticate the caller and authorize the requested operation and resource. Do not rely solely on middleware, layouts or page guards. Validate capability tokens where they grant authority.

For anonymous endpoints, define the permitted operation, accepted inputs, abuse controls and retry behavior. Public access is an explicit contract; it does not remove server validation or permit unrelated mutations.

Supporting rule: installed [Server Action authorization](../.agents/skills/vercel-react-best-practices/rules/server-auth-actions.md).

For Action-based forms, use `useActionState` when the result belongs in UI state. Use `useFormStatus` inside the relevant form subtree for pending feedback. For event-driven forms, define equivalent lifecycle and failure contracts. Do not assume Action hooks track arbitrary fetch calls.

Prevent duplicate submissions while work is pending. Preserve recoverable input after failure. Reset only when the outcome warrants it. Where native submission is supported, preserve it before hydration. Where JavaScript is required, prevent unintended native submission and explain the unavailable state.

Sources: [Bulletproof React form state](https://github.com/alan2207/bulletproof-react/blob/master/docs/state-management.md#form-state), [Robin Wieruch's validation](https://www.robinwieruch.de/react-form-validation/) and [pending actions](https://www.robinwieruch.de/react-form-loading-pending-action/).

### Errors and Observability

Distinguish expected validation failures, transport failures and unexpected rendering errors. Report actionable feedback without exposing credentials, private payloads or raw provider errors.

Place error boundaries around independently recoverable UI. A root fallback alone should not remove unrelated navigation and content. Handle request and event-handler errors within their workflows; rendering boundaries do not cover every failure source.

Track unexpected production errors with sufficient context and readable source maps. Monitoring delivery and source-map resolution require separate verification from local error handling.

Source: [Bulletproof React error handling](https://github.com/alan2207/bulletproof-react/blob/master/docs/error-handling.md).

### Testing and Performance Principles

Prioritize integration tests for feature behavior, focused unit tests for isolated logic and end-to-end tests for critical journeys. Assert observable outcomes rather than internal state or implementation names. Prefer network interception to replacing fetch so request behavior remains under test.

Optimize state placement and composition before adding memoization. Use memoization for expensive calculations or reference stability that affects consumers. Split code at useful route or feature boundaries; excessive fragmentation can increase request overhead.

Use styling compatible with the rendering environment. Build-time CSS avoids runtime style generation; dynamic values can use CSS custom properties. Measure assets, rendering and user-facing performance before claiming an improvement.

Sources: [Bulletproof React testing](https://github.com/alan2207/bulletproof-react/blob/master/docs/testing.md), [performance](https://github.com/alan2207/bulletproof-react/blob/master/docs/performance.md), [Josh W. Comeau on memoization](https://www.joshwcomeau.com/react/usememo-and-usecallback/) and [CSS in Server Components](https://www.joshwcomeau.com/react/css-in-rsc/).

## Project Decisions

These decisions select approaches for this application's requirements. They do not modify the principles above or certify implementation compliance. Reconsider a decision when its stated assumptions change. Provider procedures belong in [Integrations](INTEGRATIONS.md); visual specifications belong in [Design System](DESIGN_SYSTEM.md).

### Technology Stack

This stack defines each tool's role. Architecture principles govern how the tools work together; operational procedures define how to run and verify them. Use each tool's official documentation for its supported APIs. Listing order does not establish precedence across unrelated responsibilities.

| Category                   | Technology                                                              | Resolved Version                                            | Responsibility                                                                              |
| -------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Runtime                    | [Node.js](https://nodejs.org/)                                          | 24.22.1 LTS                                                 | Run development tools, builds and Node.js server code.                                      |
| Language                   | [TypeScript](https://www.typescriptlang.org/)                           | 6.0.3                                                       | Check static types and define code contracts. Validate external data at runtime separately. |
| UI                         | [React](https://react.dev/)                                             | 19.3.1                                                      | Compose components and manage rendering and interaction state.                              |
| Framework                  | [Next.js](https://nextjs.org/)                                          | 16.4.2                                                      | Provide App Router routing, server/client rendering, metadata and builds.                   |
| Styling                    | [Tailwind CSS](https://tailwindcss.com/)                                | 4.3.3                                                       | Apply utility classes and expose design tokens to component styles.                         |
| Code quality               | [ESLint](https://eslint.org/)                                           | 9.39.5                                                      | Enforce static analysis, framework rules and dependency boundaries.                         |
| Formatting                 | [Prettier](https://prettier.io/)                                        | 3.9.10                                                      | Format source files consistently, including supported Tailwind class ordering.              |
| Git hooks                  | [Husky](https://typicode.github.io/husky/)                              | 9.1.7                                                       | Run configured local Git checks. Hooks do not replace CI.                                   |
| Unit and integration tests | [Vitest](https://vitest.dev/)                                           | 5.0.5                                                       | Run unit and integration tests with assertions and mocks.                                   |
| Component testing          | [Testing Library](https://testing-library.com/)                         | React 16.3.3; DOM 10.4.2; jest-dom 7.0.1; user-event 14.6.8 | Query and interact with rendered components through user-facing behavior.                   |
| Network mocking            | [MSW](https://mswjs.io/)                                                | 3.0.3                                                       | Intercept test HTTP requests and simulate provider responses and failures.                  |
| End-to-end tests           | [Playwright](https://playwright.dev/)                                   | 1.64.1                                                      | Automate browser journeys and verify rendered behavior.                                     |
| Browser coverage           | [Chromium](https://www.chromium.org/) and [WebKit](https://webkit.org/) | Chromium 156.0.8078.4; WebKit 27.2                          | Exercise the application across the two configured browser engines.                         |

[Chrome for Developers](https://developer.chrome.com/) provides Chrome tooling and documentation; it is not a separate application dependency or test engine. Playwright's WebKit with device emulation does not establish behavior on a physical iPhone.

[package.json](../package.json) defines dependencies, scripts and the Node.js requirement; [package-lock.json](../package-lock.json) locks dependency versions. Use Node.js 24.22.1 LTS and npm 12.2.1. Versions below describe this checkout, not the deployed release. Browser versions come from the Playwright manifest; platform overrides may select a different build. Component and visual responsibilities belong in the [Design System](DESIGN_SYSTEM.md); service responsibilities and official references belong in [Integrations](INTEGRATIONS.md#service-responsibilities-and-references). Its [templates](INTEGRATIONS.md#templates) provide conditional implementation examples, not architecture requirements.

Keep test responsibilities distinct: Vitest runs component integrations, Testing Library drives their UI and MSW controls their network responses. Existing Node-runner tests remain a separate suite. See [test workflow](#test-workflow) for file patterns, environments and browser scope, and [project standards](#project-standards) for linting and formatting rules.

#### Dependency Versions

Verified on 22 October 2026 against the lockfile and publisher metadata. These are resolved versions, not semver ranges. Update this table with dependency changes. Vite 8.3.5 belongs to the test toolchain; Next.js owns application builds. shadcn/ui components are local source files and have no single installed library version. Hosted services and fonts do not inherit their SDK version.

| Package                             | Version | Scope       |
| ----------------------------------- | ------- | ----------- |
| `@base-ui/react`                    | 1.9.0   | Runtime     |
| `@mdx-js/loader`                    | 3.1.1   | Runtime     |
| `@mdx-js/react`                     | 3.1.1   | Runtime     |
| `@next/mdx`                         | 16.4.2  | Runtime     |
| `@sentry/core`                      | 11.8.0  | Runtime     |
| `@sentry/nextjs`                    | 11.8.0  | Runtime     |
| `@tanstack/react-table`             | 9.3.1   | Runtime     |
| `@upstash/redis`                    | 1.39.0  | Runtime     |
| `@vercel/analytics`                 | 2.0.1   | Runtime     |
| `@vercel/speed-insights`            | 2.0.0   | Runtime     |
| `class-variance-authority`          | 0.7.1   | Runtime     |
| `clsx`                              | 2.1.1   | Runtime     |
| `lucide-react`                      | 1.61.0  | Runtime     |
| `next`                              | 16.4.2  | Runtime     |
| `next-themes`                       | 0.4.6   | Runtime     |
| `react`                             | 19.3.1  | Runtime     |
| `react-dom`                         | 19.3.1  | Runtime     |
| `react-email`                       | 6.11.3  | Runtime     |
| `recharts`                          | 3.10.1  | Runtime     |
| `resend`                            | 6.34.1  | Runtime     |
| `stripe`                            | 23.0.1  | Runtime     |
| `tailwind-merge`                    | 3.7.0   | Runtime     |
| `@eslint/js`                        | 9.39.5  | Development |
| `@mdx-js/mdx`                       | 3.1.1   | Development |
| `@next/eslint-plugin-next`          | 16.4.2  | Development |
| `@playwright/test`                  | 1.64.1  | Development |
| `@react-email/ui`                   | 6.11.3  | Development |
| `@tailwindcss/postcss`              | 4.3.3   | Development |
| `@testing-library/dom`              | 10.4.2  | Development |
| `@testing-library/jest-dom`         | 7.0.1   | Development |
| `@testing-library/react`            | 16.3.3  | Development |
| `@testing-library/user-event`       | 14.6.8  | Development |
| `@types/mdx`                        | 2.0.14  | Development |
| `@types/node`                       | 24.19.2 | Development |
| `@types/react`                      | 19.3.0  | Development |
| `@types/react-dom`                  | 19.3.0  | Development |
| `@vitest/eslint-plugin`             | 1.6.28  | Development |
| `eslint`                            | 9.39.5  | Development |
| `eslint-config-prettier`            | 10.1.8  | Development |
| `eslint-import-resolver-typescript` | 4.4.5   | Development |
| `eslint-plugin-check-file`          | 3.3.2   | Development |
| `eslint-plugin-import-x`            | 4.17.1  | Development |
| `eslint-plugin-jest-dom`            | 5.10.1  | Development |
| `eslint-plugin-jsx-a11y`            | 6.10.2  | Development |
| `eslint-plugin-playwright`          | 2.12.1  | Development |
| `eslint-plugin-react-hooks`         | 7.1.1   | Development |
| `eslint-plugin-testing-library`     | 7.16.2  | Development |
| `globals`                           | 17.13.0 | Development |
| `husky`                             | 9.1.7   | Development |
| `jsdom`                             | 30.1.3  | Development |
| `lighthouse`                        | 13.5.0  | Development |
| `lint-staged`                       | 17.6.0  | Development |
| `msw`                               | 3.0.3   | Development |
| `prettier`                          | 3.9.10  | Development |
| `prettier-plugin-tailwindcss`       | 0.8.1   | Development |
| `tailwindcss`                       | 4.3.3   | Development |
| `typescript`                        | 6.0.3   | Development |
| `typescript-eslint`                 | 8.72.0  | Development |
| `vitest`                            | 5.0.5   | Development |
| `yaml`                              | 2.9.1   | Development |

| Tool                           | Version           |
| ------------------------------ | ----------------- |
| npm                            | 12.2.1            |
| GitHub Actions checkout        | 7.0.1             |
| GitHub Actions setup-node      | 7.1.0             |
| GitHub Actions upload-artifact | 7.0.2             |
| Stripe API request version     | 2026-09-30.endive |

The Actions workflow pins full upstream commit SHAs. CI installs npm 12.2.1 explicitly; Vercel uses `npx --yes npm@12.2.1 ci`. npm 12 blocks dependency install scripts unless approved. `allowScripts` permits only reviewed versions of esbuild, unrs-resolver and fsevents. Review new scripts before adding an approval; do not use blanket approval.

#### Upgrade Constraints

- Node stays on the user-selected 24 LTS line; Node 26 Current is not the target. Node types stay on the matching 24 series.
- TypeScript remains 6.0.3 because typescript-eslint 8.72.0 declares support below 6.1.0. TypeScript 7.0.2 is not a supported combination.
- ESLint and `@eslint/js` remain on 9.39.5 because jsx-a11y 6.10.2 does not declare ESLint 10 support. Preserve accessibility checks instead of forcing the dependency tree. ESLint 9 is deprecated upstream; revisit this constraint when compatible tooling is available.
- Sentry Core stays at 11.8.0 to match Sentry Next.js 11.8.0, rather than independently upgrading Core to 11.9.0.
- MSW 3 uses `onUnhandledFrame`. The shared test callback records unexpected traffic and throws; `defaults.error()` only logs in this version. The regression test verifies that unmatched requests never reach a real local server.
- The development dependency chain through braces has an unresolved high-severity advisory, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). npm reports five affected packages through micromatch, fast-glob and the lint plugins. Do not downgrade Next.js tooling or remove checks to silence the report.

These are explicit compatibility constraints, not a claim that every package uses its highest published version. Recheck publisher peer dependencies before removing them.

### AI Agents

[AGENTS.md](../AGENTS.md#ai-agents) owns AI-assisted development references and repository execution rules. ChatGPT guidance covers collaboration, OpenAI developer documentation covers supported tool and API behavior, and the AGENTS.md format organizes repository instructions. These references support development; they do not define application architecture or establish an AI product requirement.

### Installed Agent Skills

Use project skills as supporting guidance within the reference priorities above:

| Skill                                                                                 | Scope                                                                                     |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [next-best-practices](../.agents/skills/next-best-practices/SKILL.md)                 | Next.js routes, Server Component boundaries, data access, metadata, assets and hydration. |
| [vercel-react-best-practices](../.agents/skills/vercel-react-best-practices/SKILL.md) | React and Next.js performance.                                                            |
| [vercel-composition-patterns](../.agents/skills/vercel-composition-patterns/SKILL.md) | Component composition and reusable interfaces.                                            |
| [web-design-guidelines](../.agents/skills/web-design-guidelines/SKILL.md)             | Web interface review.                                                                     |
| [writing-guidelines](../.agents/skills/writing-guidelines/SKILL.md)                   | Clear technical writing.                                                                  |

`next-best-practices` was installed from [vercel-labs/openreview](https://github.com/vercel-labs/openreview/tree/672deb21e70e471e0536d5ad7a67c14b8359e97e/.agents/skills/next-best-practices) at commit `672deb21e70e471e0536d5ad7a67c14b8359e97e`. [skills-lock.json](../skills-lock.json) records its source and content hash. Check examples against the installed Next.js version and official documentation before applying them. Installing a skill does not establish architecture compliance.

### Framework and Module Ownership

Use Next.js App Router and TypeScript for localized research pages and server-side reader services. Server-rendered content supports readable initial responses; client islands isolate interactions. This choice trades framework dependence for integrated routing, metadata and rendering.

| Location                            | Responsibility                                                         |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `src/app` and `src/app/_components` | Routes, metadata, page composition and cross-feature integration.      |
| `src/features`                      | Portfolio, memos, contact, subscriptions and support workflows.        |
| `src/components` and `src/lib`      | Shared UI, utilities and service clients without feature dependencies. |

ESLint enforces import boundaries and runtime cycles, including aliases and literal dynamic imports. Type-only cycles are excluded. Shared modules and features must not import application modules. Peer features communicate through application composition.

Shared Resend acknowledgement checks live in `src/lib/resend-contracts.ts`; Contact and Subscriptions import them without crossing feature boundaries. Email sends and contact/segment writes require a nonempty provider ID. Segment removals also require `deleted: true`; welcome events require the expected event name and object type. A successful HTTP status alone does not establish a completed operation.

Malformed write acknowledgements mark subscriber operations uncertain. Preserve leases and journals for reconciliation, stop subsequent mutations and avoid compensating an unknown outcome. Webhook completion is recorded only after a valid unsubscribe acknowledgement or the explicitly accepted missing-contact response. Email retries retain their original payload and idempotency key; an acknowledged subscription remains valid when its welcome event needs reconciliation. Follow the [webhook recovery](INTEGRATIONS.md#webhook-recovery) and [Redis backup and restore](INTEGRATIONS.md#backup-and-restore) runbooks for delivery outages and data recovery. Reconcile newer consent, suppression and uncertain operations before resuming writes.

Provider and token modules use `server-only`. Next.js enforces the server/client boundary during builds. The Node test loader bypasses that marker for server tests and does not type-check; run TypeScript separately. See [verification responsibilities](#verification-responsibilities).

### State and Request Decisions

The selected ownership model separates navigation, presentation and provider state:

| Concern               | Decision and reason                                                                                                                                          | Reconsider when                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Appearance            | One `next-themes` provider owns theme persistence and initialization across routes.                                                                          | Appearance needs independent scopes or additional persisted modes.                                     |
| Disclosures and menus | Feature/local state owns visibility; Base UI owns primitive interaction mechanics.                                                                           | Multiple independent consumers need the same state.                                                    |
| Portfolio sorting     | Validated URL parameters own sorting so links, reloads and history preserve the selection.                                                                   | The table adds navigation state such as filters or pagination.                                         |
| Reader forms          | Feature-owned API functions use shared `postJson` transport and explicit submission states. Retry identity and service outcomes remain part of the workflow. | Field dependencies, validation duplication or mutation coordination warrant a form library or Actions. |
| Research data         | Server-owned, versioned records supply rendered pages and bounded client props.                                                                              | Data freshness requires client revalidation or live subscriptions.                                     |
| Remote resource cache | No general client query cache is selected for these server-owned reads and command submissions.                                                              | A feature needs browser-side resource caching, invalidation or optimistic updates.                     |

A transport helper is not a resource cache. If client-managed remote reads are added, use the [API contracts](#api-contracts-and-data-fetching) policy rather than extending local state into an ad hoc cache.

`contact-api.ts` and `subscription-api.ts` declare feature requests. `postJson` applies deadlines, HTTP failure handling and optional idempotency headers. A successful command returns completion, not an asserted response object. Consumed response bodies require runtime validation.

### Presentation and Style Loading

Use server-compatible content components and explicit client boundaries for interactions. Pass server-rendered children through the shared theme provider. `ClientForm` disables JavaScript-dependent controls until handlers attach. Native Support submission remains available before hydration.

Tailwind and CSS Modules supply build-time styles compatible with Server Components. The root imports `globals.css`; tokens serve utilities and owned styles. Use finite component variants for shared appearance and CSS Modules for complex motion. Dynamic geometry may use inline values. Reconsider styling tools only against rendering compatibility, maintainability and measured delivery costs.

`next-themes` owns `data-theme` and the `mfa:theme:v1` preference. Explicit light/dark choices persist; system appearance is the initial default. The Design System owns colors, typography, layout, motion and component mappings. Do not duplicate its numeric specifications here.

Base UI owns focus containment, modal isolation and primitive keyboard behavior. The mobile navigation phase keeps Sheet open through its closing animation. Preserve interruption, focus restoration and scroll restoration when changing that coordination.

### Rendering and Error Boundaries

Public research content renders on the server. Payment verification and saved preferences use local Suspense boundaries so provider latency does not delay unrelated content. Each page has one main landmark, with navigation and Footer outside it.

Memo routes generate known slugs and reject unknown ones. Localized page errors offer retry and navigation. The global fallback renders a minimal document without private error details.

Performance charts isolate interactive rendering with `ChartBoundary`. Monthly tables and captions remain outside that failure boundary. The chart client receives observations, not historical ledgers. A reserved 300px region limits layout movement; loading begins within 200px of the viewport and remains mounted afterward. Treat those values as project tuning, not reference requirements; reconsider them using loading and layout measurements.

Sentry receives unexpected errors with sensitive messages, payloads and URL queries filtered. Its bridge captures startup errors while the SDK loads. Source maps and live delivery require provider verification.

### Navigation Prefetching

`IntentLink` uses Next.js Link and enables default prefetching on hover, keyboard focus or pointer press. This policy reduces speculative route payloads while retaining navigation intent as a warming signal. Caller handlers, refs and explicit prefetch choices remain authoritative.

Apply it to Header navigation, the wordmark, shared ButtonLink CTAs and Home text CTAs. Other links keep their documented behavior. Reconsider the policy when navigation latency or route-payload measurements favor another strategy. Test prefetching against production builds; development behavior is not sufficient evidence.

### Deterministic Date Rendering

Render financial calendar dates from validated ISO values and UTC components. Fixed English month names and Chinese numeric dates avoid server/browser locale-data differences. Compact English uses `Sep`.

This is a project serialization policy for calendar dates, not a general prohibition on `Intl`. Reconsider it when adding time zones or localized date formats. Preserve identical initial server/client output and visible hydration warnings.

### Service and Consent Boundaries

Routes validate HTTP input and map domain results to responses. Features own contact delivery, subscription coordination and payment outcomes. Provider adapters keep credentials server-side. Research data remains independent of Redis and external delivery services.

Keep request-origin checks, body limits, rate limits, retry identities and provider-error handling explicit. Unknown provider outcomes must not become assumed failures or unconditional retries. Subscription activation validates contact IDs and the boolean subscription state before consuming a lookup. Only an explicit 404 permits creation. Activation, preference-save and unsubscribe writes require a nonempty ID in successful acknowledgements. Malformed acknowledgements leave the outcome unknown: stop further writes and retain the lease and any journal. Unsubscribe bypasses the journal gate without creating or clearing a journal. Before language changes, validate every segment page: an array of nonempty IDs, a boolean `has_more` and a usable, nonrepeating cursor when more pages remain. Read the complete snapshot before writing. See [Integrations](INTEGRATIONS.md) for locks, journals and recovery.

### Subscription Consent Boundary

Signup requests a confirmation link. An explicit confirmation POST activates consent under the shared lock and journal; welcome delivery is separate. GET requests must not change consent.

Redis stores confirmation, consent, suppression, limits and recovery records. Resend handles delivery and provider suppression. This split supports durable coordination across retries. Reconsider it if throughput or recovery requirements need a queue; record migration and replay guarantees first.

Preference tokens retain their authenticated encryption format and legacy-key fallback. Decode JSON as `unknown`; require version `1`, a valid email and a finite numeric expiry later than the current time. Authentication does not replace payload validation. Secret rotation requires an explicit migration plan.

### Project Standards

Use kebab-case files, PascalCase components and Next.js route naming exceptions. Keep adjacent relative imports; use `@/*` across source directories. Formatting uses UTF-8, LF, two spaces and final newlines.

ESLint checks types, hooks, imports and framework rules. Prettier owns formatting and Tailwind ordering. Hooks validate staged files without rewriting them. CI remains the release gate because local hooks can be bypassed.

### Lint and Editor Conventions

Scope Vitest rules to `*.test.ts` and `*.test.tsx`, Testing Library rules to component tests, and Playwright rules to `*.spec.ts`. Node tests retain JavaScript rules. Keep framework naming exceptions and justified suppressions narrow.

Keep Prettier last in ESLint configuration. Import ordering is not a project requirement. EditorConfig supplies portable editor defaults; VS Code settings enable formatting and explicit lint fixes. The Tailwind formatter scans `globals.css` and recognized class expressions. Private style-map strings still need review.

There is no CSS semantic linter. Browser checks and review must establish selector and property behavior; formatting cannot do so.

### Routing and Metadata

Language links preserve only server-validated parameters:

| Page         | Allowed state                                                                               |
| ------------ | ------------------------------------------------------------------------------------------- |
| Preferences  | Valid preference token                                                                      |
| Confirmation | Token with the expected opaque format; verify it on POST                                    |
| Support      | Recognized status, validated Session ID, or signed product/attempt/original-locale recovery |

Support validates signatures and the 23-hour expiry. Invalid or expired attempts retain only the retirement notice. Query parameters never prove payment.

Public pages use the shared metadata helpers for canonical URLs, reciprocal language alternates, sharing titles, site name and Open Graph locales. Each localized Home renders the same canonical `WebSite` identity; language directories do not represent separate sites. The sitemap includes public canonical pages only, with no query strings or private subscription workflows. Keep private pages crawlable so their `noindex` metadata can be read.

Preferences and Confirmation use `createPageMetadata({ indexable: false, ... })` to keep `noindex, nofollow`, a query-free canonical and no search-language alternate links together. Their visible language navigation still works; search metadata must not include recovery tokens. `metadataBase` resolves public canonical and `hreflang` paths to full HTTPS URLs. Verify the served HTML and sitemap XML as well as the helper outputs.

Article metadata and safely serialized Article JSON-LD come from the localized memo catalog. Mark the language of the actual article body, even when its surrounding page is localized. The brand logo remains a social sharing fallback; omit the Article `image` until a representative research image is available. Do not invent modification dates, authorship or search actions.

Memo pages also emit a separate `BreadcrumbList`: localized Home, Investment Memos and the visible article title. Use the same navigation labels, canonical URLs and memo catalog as the page; escape script terminators in both JSON-LD blocks. Breadcrumb markup describes the existing navigation hierarchy without changing the layout. Google's display of a breadcrumb or Article result is not guaranteed.

When changing SEO metadata, run the colocated metadata tests and the relevant browser metadata checks. `src/lib/site-config.spec.ts` checks served canonical/alternate URLs, private-page indexing boundaries, robots.txt and reciprocal sitemap entries. After deployment, use Search Console URL Inspection, sitemap reports and the Rich Results Test to confirm Google's view of the released pages. Local checks do not establish indexing, rich-result eligibility or ranking changes. References: [Google site names](https://developers.google.com/search/docs/appearance/site-names), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) and [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

The locale Proxy excludes API, Next.js and Vercel paths, known public images and metadata resources. Unknown paths containing dots still receive localized 404 handling. Keep exclusions aligned with assets and metadata routes.

Pages compose Header and Footer. Home owns its header background; private service pages supply validated language-link parameters without making static locale layouts request-dependent.

### Content Security Policy

`next.config.ts` applies an origin-based CSP:

- Allow scripts from the site, Vercel Analytics and the Vercel toolbar. Block inline HTML event handlers and object embedding.
- Allow same-origin and blob workers for Sentry Replay.
- Allow inline scripts for static App Router hydration and Article JSON-LD. This is not a strict nonce policy.
- Allow `unsafe-eval` only in development.
- Enable `upgrade-insecure-requests` only in Vercel Production builds; local production and Preview retain HTTP localhost access.

This policy retains static prerendering at the cost of allowing inline scripts. Reassess that trade-off when the threat model requires a strict policy. A nonce-based policy changes rendering and caching requirements. See [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy).

### Investment Memo Content

Investment Memo Articles use locally imported MDX, compiled by `@next/mdx` into Server Components. `src/mdx-components.tsx` provides the required App Router entry point. The owning feature supplies section, subsection, reference and link treatments through `memo-mdx-components.tsx`; other pages do not inherit article-specific markup.

Keep research prose in `src/features/memos/articles/*.mdx`. Keep titles, summaries, publication dates and localized catalog entries in `memos.ts`. `memo-content.ts` records the actual article language without importing its body, so metadata, API and email paths do not load the MDX renderer. `memo-article-content.tsx` uses an explicit import registry; add an entry when publishing another article. Do not compile remote or reader-supplied MDX.

The Microsoft article remains the English original on all three routes. The localized page owns its translation notice, metadata, publication details and closing disclaimer. Moving the source format does not authorize editing verified research. The migration test checks the normalized rendered-text digest, section/paragraph counts and source links. Update that digest only for an approved content edit after reviewing the text difference.

Use [Next.js MDX](https://nextjs.org/docs/app/guides/mdx) for compiler conventions. Run the affected memo Node tests and production browser checks after editing article markup; confirm the three language routes and narrow layouts.

### Portfolio Data

The portfolio feature owns financial data, sources, calculations and monthly acceptance. Amounts and retrieval records below are dated evidence, not live quotes. Code records remain authoritative.

#### Workspace Data

`src/features/portfolio/portfolio-detail.ts` records 91 purchase lots with fees, SPY adjusted prices by applied trading date, 124 cash events, three corporate actions and 22 month-end position, price and XIRR snapshots.

- Amounts and prices use USD; dates use `YYYY-MM-DD`.
- Dividends are positive; withholding tax and financing interest are negative.
- Purchase cost is `grossAmount + fees`.
- Hypothetical SPY units are `grossAmount / adjustedClose`; simulated cash outflows include the full purchase cost.

`src/features/portfolio/portfolio.ts` derives holdings, cost basis, income, value and return history. It exports monthly simulated SPY results as `portfolioSpyMonthlyReturns` and the latest comparison as `portfolioSpySnapshot`. Home, Portfolio and Performance share this module. No database or separate processing service is required.

The latest month-end valuation defines `asOf`. Exclude later purchases and cash events from the snapshot. Include a simulated SPY purchase only after both its transaction and applied price dates. Preparing future records must not change the published snapshot.

The 2026-09-30 snapshot has 18 holdings and 22 monthly observations: USD 127,533.11 in stocks and ETFs and USD 121,237.01 in simulated SPY.

XIRR and TWR use the same boundary:

- Include listed stocks and ETFs in the ledger, including VGT and GRNY.
- Exclude cash, separate brokerage fund-account positions and liability balances. Still include financing interest as an expense.
- Include net dividends, withholding tax and trading fees. Account deposits, withdrawals and currency exchanges fall outside this boundary.

Performance shows reconstructed cumulative TWR versus SPY total return and since-inception annualized XIRR versus simulated SPY XIRR. Each chart has a monthly table. Omit XIRR horizons below 30 days. XIRR observations are not individual monthly returns.

`PerformanceChartView` server-renders the figure caption and monthly Table inside a Card. Its `PerformanceChartExplorer` client island reserves a 300px Skeleton and lazy-loads Recharts when the chart container comes within 200px of the viewport. Once loaded, the chart stays mounted. Portfolio is solid and SPY is dashed; there is no static chart, series toggle or data-point control. The monthly Table uses AnimatedDisclosure independently of the interactive chart boundary. An interactive rendering failure leaves the caption, monthly data, sibling chart and methodology available; opening the disclosure still requires JavaScript. Keep historical ledgers out of chart props and Recharts out of the shared layout.

`PortfolioTable` owns its columns, controlled single-column sorting and TanStack sorted row model. `DataTable` renders native table structure; its row-rendering extension preserves the feature's row headers, mobile labels and financial styles. The footer stays outside the sorted model. Shared UI never imports portfolio calculations. Chart interaction never alters the monthly ledger or return calculations.

Historical evidence: the September update was reviewed against the monthly brokerage statement on 2026-10-05:

| Item                                                         | Reviewed result                  |
| ------------------------------------------------------------ | -------------------------------- |
| Position quantities                                          | Unchanged                        |
| Dividend and withholding-tax events                          | 16 events; USD 117.79 net income |
| Purchases, sales, deposits, withdrawals and interest charges | None listed for September        |
| Cumulative net dividends                                     | USD 644.48                       |
| Cumulative financing interest                                | USD 85.75                        |
| Since-inception annualized portfolio XIRR                    | 24.426811448224484%              |

XIRR was calculated independently from dated purchase costs, signed cash events and terminal stock value.

SPY's September inputs came from [Yahoo Finance](https://finance.yahoo.com/quote/SPY/history/) through its public chart endpoint on 2026-10-13. The same-vintage adjusted closes were USD 765.1499633789062 on 2026-08-31 and USD 762.6300048828125 on 2026-09-30.

To extend the frozen August basis, chain their ratio:

```text
766.95 × 762.6300048828125 / 765.1499633789062 = 764.4241132312882
```

The result is a rebased calculation price, not September's quoted close. Simulated units remain 158.5991478936601; value is USD 121,237.01298784906 and annualized XIRR is 19.264638392858824%.

Future extensions must use same-vintage adjusted-price ratios. Do not combine a newly adjusted endpoint with unchanged purchase prices without rebasing. This correction replaced rounded Stock Analysis inputs and increased September benchmark XIRR by about 0.00000494 percentage point. August and earlier observations, and displayed September value/XIRR (USD 121,237.01 and 19.26%), are unchanged.

#### Historical Price Sources

Use Yahoo Finance only for new or replacement historical stock and ETF prices, including SPY. Record ticker, source URL, retrieval date, applied trading date, currency and adjustment basis. Mark missing observations unverified; do not substitute another provider.

Verify field definitions before use. Holdings need the share basis described below without dividend adjustment because dividends are recorded separately. SPY total-return comparisons need dividend-adjusted prices from one data vintage. Never substitute unadjusted closes or mix vintages without reconciling adjustments.

Apply this policy to additions and explicit corrections. Preserve existing provenance: replacing a non-Yahoo input requires new Yahoo evidence, not a new label. Reconcile published corrections and run the acceptance checks below.

#### Calculation and Updates

Keep source precision until display formatting.

- Portfolio cumulative return includes net dividends and deducts financing interest.
- Holding returns compare value with cost basis; they do not allocate portfolio-level interest.
- Dated events support cash-flow calculations; monthly quantities and prices support valuation.
- SPY units and values are derived. XIRR observations are stored results, not recalculated on requests.

Each month records the applied U.S. trading date, which precedes the calendar month-end when markets are closed. SPY is the only benchmark. Preserve previously published monthly prices and XIRRs unless the source evidence supports an explicit correction.

#### Reconstructed Time-weighted Return

`portfolio-closing-marks.ts` contains 450 daily/event-date marks and 6,752 held-position prices for 2024-12-30 through 2026-09-30. Yahoo Finance chart data was retrieved on 2026-10-05.

- Use split-adjusted **close**, not dividend-adjusted close; the cash ledger records dividends and tax separately.
- Multiply VGT prices before its 2026-04-21 split by eight to match contemporaneous share counts.
- Use the preceding U.S. trading close for non-trading dates, retaining the applied date.
- Reconcile all 22 month-end stock valuations within USD 0.011.

Keep broker files and account identifiers outside the repository.

`portfolio-twr-calculations.ts` reconstructs returns for stocks and ETFs, not the whole brokerage account:

- Treat purchase gross amount plus fees as a beginning-of-period contribution.
- Value gifted securities at the preceding close as contributions, not gains.
- Treat splits as quantity changes only.
- Include net dividends, tax and financing costs at period end before removing them from the measured portfolio.
- Exclude cash, separate brokerage funds and liability balances, as for XIRR. Account deposits and withdrawals are outside the boundary; stock purchases and in-kind transfers enter it as contributions.

For each period:

```text
factor = (ending stock value + signed net income)
       / (preceding stock value + contributions)
```

Geometrically link factors for cumulative TWR. Monthly returns compare successive cumulative factors; the first month includes initial investment and fees.

Stop on missing event/position prices, unvalued transfers or invalid ordering. These are closing-price reconstructions with explicit flow timing, not observed intraday valuations. Keep weekend trade dates as recorded and apply the preceding close.

Server-only `portfolio-twr.ts` exports period valuations, monthly returns and the latest summary. Never bundle the historical price table into client code.

For September 2026, cumulative portfolio TWR is 38.2694002516289%, the linked monthly return is 5.2341595775561744%, and SPY cumulative total return is 32.19753204498825%. SPY uses one dividend-adjusted vintage from the first purchase date without simulated purchase fees. This index comparison differs from the same-investment-date XIRR simulation. Published XIRRs and their frozen price basis remain unchanged.

| Location                          | Return shown                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Home and Performance summaries    | Reconstructed cumulative portfolio TWRR, not annualized                                                        |
| Portfolio summary and table Total | Cost-basis total return: 32.84% for September 2026                                                             |
| Individual holdings               | Position-level cost-basis return                                                                               |
| Performance charts                | Full cumulative TWR and annualized XIRR comparisons, each with a monthly table; no second set of summary cards |

Portfolio's “Total Return” and “Absolute Return” describe a percentage, not dollar profit or TWRR. Only the overall summary/table return includes net dividends and financing interest. Both TWR comparison series are cumulative and not annualized. Methodology copy in all three languages explains valuation and flow assumptions.

[GIPS methodology](https://www.gipsstandards.org/standards/gips-standards-for-firms/gips-standards-handbook-for-firms/) describes linked sub-period returns and flow conventions. The site claims neither GIPS compliance nor observed intraday TWR. The stocks-and-ETFs boundary matches XIRR; it is not a GIPS composite carve-out. Provision 3.A.15 requires cash and related income in composite carve-outs. Exact flow-time TWR requires actual valuations and event ordering at every external flow.

## Operational Procedures

Use these procedures to apply the principles and verify project decisions. Commands and thresholds are project-specific. Local results, historical evidence, CI results and production state are distinct.

### Update and Acceptance Procedure

Refresh closing marks through the new month. Record source and retrieval date, verify split basis and reconcile every monthly position value. Refresh the entire SPY TWR vintage consistently; preserve the separately maintained XIRR history.

```sh
node --import ./scripts/register-server.mjs --test src/features/portfolio/portfolio-twr.test.mjs src/features/portfolio/portfolio-twr-calculations.test.mjs
```

Tests cover linking, contributions, fees, dividends, tax, interest, transfers, splits, non-trading dates, missing inputs and month-end reconciliation.

1. **Identify the revision.** Record snapshot month, provider/dataset, available version or retrieval date, adjustment basis and evidence-review date. Use a non-private batch label when no public version exists. Git identifies the published revision. Keep statements, account IDs, raw files and private paths out of Git and release notes.
2. **Update records.** Edit `src/features/portfolio/portfolio-detail.ts` for purchases, cash events, corporate actions, SPY prices and monthly valuations. Retain actual transaction dates and applied U.S. trading dates when they differ. Keep source precision. Change `src/features/portfolio/portfolio.ts` only for derivation or presentation changes.
3. **Reconcile before changing expectations.** Check purchase arithmetic (`shares × unitPrice = grossAmount`), fees, signed income/interest, monthly quantities and values, applied SPY dates, simulated units/value and stored XIRRs. Tests independently recalculate SPY XIRR and check that the latest portfolio XIRR zeros dated-cash-flow NPV. Keep independent portfolio calculation evidence privately. Investigate every mismatch.
4. **Run the data regression:**

   ```sh
   node --import ./scripts/register-server.mjs --test src/features/portfolio/portfolio.test.mjs
   ```

   | Check                                  | Tolerance               |
   | -------------------------------------- | ----------------------- |
   | Purchase arithmetic                    | USD 0.0001              |
   | Published cost and income totals       | USD 0.001               |
   | Monthly valuations and SPY values      | USD 0.011               |
   | Latest SPY snapshot                    | USD 0.01                |
   | Simulated SPY units                    | 0.000001                |
   | SPY XIRR                               | 0.0001 percentage point |
   | Dates, counts and stored XIRR pairings | Exact                   |

   Tolerances cover floating-point arithmetic, not conflicting prices, missing events or unexplained differences.

5. **Check affected pages.** For values or chart changes, run `npx playwright test src/features/portfolio/performance-chart.spec.ts src/app/_components/portfolio-form-status.spec.ts --project=chromium` and inspect all three locales. For KPI changes, run `npx playwright test src/app/_components/semantic-content.spec.ts --project=chromium --grep "financial summaries"`; [Design System](DESIGN_SYSTEM.md#css-layout-and-visual-language) defines visual rules.
6. **Accept and record.** Reconciliation, focused checks and affected pages must agree with the identified inputs. Document historical corrections and reasons. Before deployment, confirm release CI and identity under [AGENTS.md](../AGENTS.md#deployment-completion); do not routinely repeat the full suite locally.

Run calculations through the versioned TypeScript modules. Independent calculation tools may verify results, but must not silently replace source records or the published methodology.

### Verification Responsibilities

| Layer                                            | Responsibility and configuration source                                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Prettier and Tailwind plugin                     | Formatting and recognized Tailwind class ordering; see the `prettier` field in [`package.json`](../package.json). |
| ESLint, typescript-eslint, and framework plugins | Code, type usage, and framework rules; see [`eslint.config.mjs`](../eslint.config.mjs).                           |
| TypeScript                                       | Type checking; see [`tsconfig.json`](../tsconfig.json).                                                           |
| Unit tests                                       | Logic, state, and failure handling.                                                                               |
| Playwright                                       | Layout, interaction, and browser behavior; see [`playwright.config.ts`](../playwright.config.ts).                 |
| Human review and device checks                   | Understandability, visual quality, and real-device experience.                                                    |

[README](../README.md#verification) lists commands. Configuration files define versions and CI behavior. Select affected checks using [AGENTS.md](../AGENTS.md#verification-and-review); use the [Design System](DESIGN_SYSTEM.md#design-verification) for visual acceptance and the [test workflow](#test-workflow) for isolation and CI evidence.

Change rules only for an identified problem, and check related tools, docs and tests for conflicts.

### Test Workflow

Apply the [testing principles](#testing-and-performance-principles) through the runners below. Keep provider writes mocked. Preserve failure, interruption and retry coverage. Source assertions are limited to explicit configuration or boundary contracts that behavioral tests do not establish.

#### Runners and Isolation

| Runner                  | Files and scope                                                                 |
| ----------------------- | ------------------------------------------------------------------------------- |
| Vitest unit             | Colocated `*.test.ts`                                                           |
| Testing Library and MSW | Colocated `*.test.tsx`, using jsdom                                             |
| Node                    | Existing colocated `*.test.mjs`, plus root configuration and `scripts/` checks  |
| Playwright              | Colocated `src/**/*.spec.ts`; Chromium runs all cases, WebKit selects `@mobile` |

`vitest.config.ts` separates unit and integration projects and resolves aliases. MSW-backed tests intercept HTTP, reject unhandled requests and reset handlers after each test.

Contact delivery and subscription service integration tests use MSW with explicit HTTP methods and provider paths. Unexpected requests fail the test even when the SDK catches transport errors. Preserve payload, failure, retry and journal assertions; concurrent rollback requests are checked as a set rather than in an arbitrary arrival order. Low-level transport unit tests may replace fetch to isolate transport behavior. Support localization and navigation are checked through rendered pages and resolved sitemap entries, not source text.

`scripts/vitest-setup.ts` cleans up components and fails unexpected requests even if app code catches their errors. No MSW worker runs in production. Vitest excludes Node and Playwright files; application entry points never import tests.

The loader, shared helpers, WebKit runner and production gate live in `scripts/`. The journal CLI stays with subscriptions at `src/features/subscriptions/server/subscription-journal-cli.mjs`, invoked through `npm run subscription:journal`.

`npm test` runs Node and both Vitest projects; `verify:static` includes it. Playwright runs separately. Its development server uses `PLAYWRIGHT_ISOLATED_DEV=1` and `node_modules/.cache/next-playwright` so it can coexist with the interactive `.next` development server. It retains the default development hostname so tests exercise the configured loopback alias rather than implicitly trusting it through `--hostname`. Production tests retain the normal build directory. After a build, run selected production cases with `PLAYWRIGHT_USE_PRODUCTION_BUILD=1 npm run test:e2e -- <spec-files> --project=chromium` or `webkit`.

### Local Preview Diagnostics

Use `npm run dev`, then open `http://localhost:3000` or `http://127.0.0.1:3000`. Next.js allows `localhost` by default; `next.config.ts` explicitly adds only `127.0.0.1` through [allowedDevOrigins](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins). Do not use wildcard origins or disable origin protection.

The October 22, 2026 reproduction established a hostname mismatch: a default dev server blocked `/_next/hmr` from `127.0.0.1`, leaving controls unhydrated. The same server worked through `localhost` without a restart or cache reset. Starting with `--hostname 127.0.0.1` masked the missing configuration. The regression checks both hostnames, reloads, menu interactions and rejection of unrelated origins.

If controls stop responding:

1. Record the exact URL, startup command, browser errors and `.next/dev/logs/next-development.log` before restarting. Isolated tests log under `node_modules/.cache/next-playwright/dev/logs/`.
2. Check development-origin warnings and the HMR connection. Successful HTML or JavaScript HTTP responses alone do not establish hydration.
3. Verify an enabled subscription control and an opening menu without submitting a form. Compare both loopback hostnames on the same running server.
4. Run `npm run test:e2e -- src/components/local-preview.spec.ts --project=chromium --workers=1`. Run `--project=webkit` for the mobile interaction cases. Keep provider credentials isolated by the Playwright configuration.

Preserve logs before investigating other failures. A cache reset or restart is recovery evidence, not proof of a root-cause fix. Configuration changes require Next.js to reload the server configuration; they do not require deleting `.next`.

WebKit uses the iPhone 13 viewport, touch, scale and user agent. Tag only phone-sized, mobile-compatible cases `@mobile`. Keep mouse-hover, CDP-only, desktop and cross-breakpoint cases in Chromium. Browser servers use isolated provider settings. Both engines test Contact's unavailable-service response; MSW and route tests cover success and retries. None proves live email delivery.

#### Coverage Contracts

- Contact integrations check localized normalization, delivery payloads, errors and retry identity through MSW.
- Memo checks resolve real Next.js redirects and verify localized HTTP 308 destinations and landmarks.
- Subscription checks verify welcome payloads, preference links, malformed authenticated payload rejection and expiry at the deadline.
- Portfolio checks verify per-share cost and sorting. `portfolio-page-content.integration.test.tsx` covers all locales, table accessibility, controls, holdings and reconciled totals. Node checks retain the Server/Client boundary.
- `semantic-content.spec.ts` checks KPI semantics, colors, opacity and composited contrast using `scripts/color-contrast.ts`. Visual rules live in [Design System](DESIGN_SYSTEM.md#typography-roles).
- Header cases live in `components/site-header.spec.ts`; cross-page layout and CTA cases live in `app/_components/page-layout.spec.ts`. Feature journeys stay with their feature.

References: [Vitest projects](https://vitest.dev/guide/projects), [Testing Library setup](https://testing-library.com/docs/react-testing-library/setup/), [MSW Node integration](https://mswjs.io/guides/integrations/node).

#### CI and Evidence Reuse

Actions are pinned to verified upstream commit SHAs, with release versions in comments. This project uses SHA pinning rather than the preview workflow lockfile feature. When updating an action, verify the commit in its source repository, review release changes, update every reference and retain the version comment. SHA pins fix direct action references; they do not freeze runner images or all transitive downloads.

Workflow permissions default to `contents: read`. Only `plan` adds `actions: read` to inspect prior runs; job permissions replace workflow permissions, so `plan` explicitly retains `contents: read`. Build, test and result jobs do not receive Actions API access.

`scripts/ci-workflow.test.mjs` parses the workflow and checks immutable remote action references and effective job permissions. It runs in the existing Node test suite. Evidence reuse, deployment-gate failure handling and browser shard coverage have separate tests.

CI checks out the PR head SHA or exact push SHA. PRs always run full verification. The read-only `plan` job decides whether a main push may reuse complete PR evidence.

After `plan`, full verification runs six jobs concurrently:

| Jobs                                   | Runner and work                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `static`                               | Ubuntu: locked install, production dependency audit, types, ESLint, Prettier and Node/Vitest tests |
| `chromium-shard-1`, `chromium-shard-2` | Ubuntu: production build and native Playwright shards with `--fully-parallel`                      |
| `performance`                          | Ubuntu: isolated production build, pinned Chromium and sequential Lighthouse budget samples        |
| `webkit-shard-1`, `webkit-shard-2`     | macOS: production build and mobile WebKit shards                                                   |

Each browser job uses one worker. Fail-fast is disabled so one shard does not cancel another. Browser jobs do not wait for static checks; this can consume runner time after a static failure, but cannot authorize release. The `verify` result also requires `performance`. Stable `verify` and `webkit` result jobs reject failed, cancelled or unexpectedly skipped dependencies. There is no separate CSS lint job.

`scripts/ci-plan.mjs` permits reuse only when:

1. Main is a two-parent merge whose tree matches its second parent.
2. The latest matching same-repository PR CI run succeeded within 24 hours.
3. That run attempt passed all six jobs above; partial or previously reused evidence is insufficient.

Changed trees, workflows, lockfiles or test settings; stale evidence; squash/rebase merges; missing records; and API errors require full testing. The summary records the source run, tree and release SHA. Main still creates its own successful CI record for the production gate. Runner and runtime changes can occur outside Git, so reuse expires.

#### Production Optimization

The optional [vercel-optimize skill](https://github.com/vercel-labs/agent-skills/blob/main/skills/vercel-optimize/SKILL.md) is not installed. Check its [provider prerequisites and readiness](INTEGRATIONS.md#vercel-optimize-readiness) before using it. Collect scoped production metrics first, preserve the evidence, and inspect code only after its candidate gates identify a relevant signal. Missing access or telemetry is not evidence of low traffic or good performance. A limited code-only review requires an explicitly agreed scope and must disclose the missing metrics. Production metrics complement local regression tests; they do not replace them.

#### Performance Regression Checks

Font instances belong to their locale layouts. `SiteDocument` receives the selected Chinese variable and shares only Jost. Global 404 rendering selects the matching locale variable. Turbopack uses `experimental.cssChunking: "graph"` because the default merging heuristic kept an unrelated Chinese font stylesheet in English routes even after imports were split. Validate generated stylesheet contents and browser behavior rather than assuming an import refactor fixes the download graph. Webpack fallback builds do not exercise this Turbopack optimization.

After a production build, `npm run test:performance` starts an isolated loopback server on port 3211 with provider credentials disabled. Lighthouse 13.5.0 collects three fresh mobile samples for Home in each language and English Performance. DevTools applies CPU throttling, 150 ms request latency, 1638.4 Kbps download and 750 Kbps upload directly. Do not compare these results directly with public HTTPS runs using simulated throttling.

##### CPU Calibration

Calibration and Lighthouse explicitly use the same Playwright-installed Chrome for Testing executable. Do not calibrate with Playwright's default headless shell.

1. Run Lighthouse's unthrottled benchmark three times on a blank page. Require finite, positive samples within 15% of their median and a median of at least 1000.
2. Select one multiplier for the entire run: `hostBenchmarkIndex / 1000`.
3. Apply that multiplier and collect three more samples. Each must be within 15% of the fixed target of 1000. Release the temporary throttle and CDP session even on failure.
4. For every route report, require the chosen multiplier, DevTools throttling and a host benchmark within 15% of calibration.
5. Save `cpu-attempt-N-host-samples.json` and `cpu-attempt-N-effective-samples.json` before validating them. Save successful calibration, browser version and executable path in `cpu-calibration.json`. Preserve the raw route reports; never rescale their LCP/TBT values.

The reference comes from [PR #85, attempt 2](https://github.com/Tianyi0510/modern-fundamental-analyst/actions/runs/38824624078/attempts/2), commit `0fce8267a0d3f48c1b762d63c987bf636e3cb2ab`, artifact `12030638016` (`performance-evidence`). Its 12 reports had a median host index of 4193.25 at 4x slowdown: an effective index of 1048.31. The fixed target of 1000 is slightly slower. Attempts 1 and 3 failed; the successful attempt does not prove that earlier releases always met the budget.

Do not change the target, discard slow Lighthouse samples or rerun an audit with a different multiplier to make a release pass. Only pre-audit calibration instability receives the bounded retries described below; each attempt recalculates its multiplier from fresh host samples against the same target. After calibration succeeds, keep that multiplier fixed for every route and sample. Drift during an audit is an infrastructure failure and stops the run. Calibration approximates CPU capacity; it does not establish equal application performance across hardware or physical-device equivalence. See [Lighthouse 13.5.0 CPU calibration](https://github.com/GoogleChrome/lighthouse/blob/v13.5.0/docs/throttling.md#cpu-throttling).

##### Budgets and Evidence

| Metric             | Limit                          | Aggregation |
| ------------------ | ------------------------------ | ----------- |
| LCP                | 3000 ms                        | Median      |
| TBT                | 200 ms                         | Median      |
| CLS                | 0.1                            | Median      |
| Decoded JavaScript | 1200KiB                        | Maximum     |
| Decoded CSS        | 160KiB English; 270KiB Chinese | Maximum     |

The TBT limit adopts Chrome's [mobile fast range of 0–200 ms](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time), replacing the previous project-specific 400 ms ceiling. Exactly 200 ms passes; any excess fails. One good sample cannot hide two slow samples. Resource maxima catch even one accidental font-payload regression. Lighthouse scores are recorded but are not a gate.

Budget tests cover the exact TBT boundary, median aggregation and incomplete evidence. CPU calibration allows three attempts before an audit, retaining each attempt's samples. Only host instability is retryable. Invalid samples, slow hosts, browser errors and evidence-write failures stop the run. Audit measurements, drift failures and budget failures are not retried.

The CPU target and 15% drift allowance remain fixed. Tests cover retries, failure boundaries and throttle cleanup; each performance run also checks the applied slowdown in Chrome. Compare reports only when CPU, browser, Lighthouse and network settings match. A local pass does not prove CI success.

The `performance` CI job builds with a fake Sentry DSN and Production sampling, without provider secrets. It uploads raw JSON, trace/DevTools assets, calibration and summaries for 14 days, including failures. Missing metrics, failed application stylesheet/script requests or failed budgets block `verify` and evidence reuse. Only the two Vercel-injected analytics scripts may return 404 on the plain local server; live analytics delivery requires a separate provider check. Preserve production browser coverage and the exact-commit deployment gate.

Field CWV still requires mobile/desktop p75 LCP, INP and CLS from Speed Insights or CrUX. A Lighthouse navigation run does not measure field INP; TBT is only a laboratory diagnostic. Query failures do not establish a pass or absence of field traffic. See [Google Web Vitals](https://web.dev/articles/vitals), [Chrome Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring), [Next.js CSS chunking](https://nextjs.org/docs/app/api-reference/config/next-config-js/cssChunking) and [font optimization](https://nextjs.org/docs/app/getting-started/fonts).

#### Local Runs and Shard Maintenance

Use affected checks locally. Full `npm run verify` and `npm run test:webkit` are for diagnosis or explicit requests. If Turbopack cannot bind a worker port locally, use `npm run build -- --webpack` and report it; CI retains Turbopack. Next.js selects the bundler before loading configuration: use graph CSS chunking for Turbopack and the supported default chunking for Webpack. The configuration regression test loads both modes through Next.js's configuration loader.

The WebKit runner accepts `--shard=1` or `--shard=2`; otherwise it runs two sequential processes. Positional spec paths narrow coverage. It rejects `--grep` and `-g`, which would replace the mobile filter. Inspect coverage with `npx playwright test --project=webkit --list`.

WebKit shard 1 selects `scripts/webkit-shard-1.txt`; shard 2 selects its inverse. Paths are relative to `src`. Both retain the `@mobile` filter. New files enter shard 2 automatically. `scripts/browser-shards.test.mjs` checks that every discovered test runs exactly once.

The allocation uses [CI run 39481047586](https://github.com/Tianyi0510/modern-fundamental-analyst/actions/runs/39481047586), whose WebKit test steps took 372/690 seconds. Assigning the longest files first to the lighter shard estimates 517.2/517.9 seconds of test work, including retries. This excludes setup and inter-test overhead; confirm the improvement in CI. Keep slow Header and Typography files in separate groups.

Each shard uploads per-test JSON timing reports for 14 days and separate failure/retry evidence for seven days. Compare test-step and total-job times: extra builds and installs can offset parallelism gains and increase usage. Rebalance the WebKit file list when workload changes.

#### Reliable Browser Checks

Automated regression tests and interactive visual checks provide different evidence. Keep Playwright as the repository and CI regression runner. For rendered UI work using Build Web Apps, follow its installed `frontend-testing-debugging` skill, especially “Choose The Browser Path” and “Required Browser Checks.” Use the Browser plugin when available. Record its availability and the reason for any permitted Playwright fallback; a failed invocation alone does not authorize a fallback.

Define the target route, action and expected result before interactive verification. Record:

- The URL, page title, browser and viewport.
- Meaningful page content and the absence of framework error overlays.
- Relevant console errors and warnings, with an explanation for any remaining entries.
- A screenshot supporting visual claims.
- The target interaction and its observed result.

Repeat the affected flow after changes. For visual work, check desktop and a mobile viewport when practical; record coverage limits. Compare reference-driven changes against the accepted reference. A passing build or automated suite does not replace this evidence. Documentation-only changes do not require rendered UI checks.

Use these additional rules for automated browser assertions:

- Reuse a test's isolated page for sequential full navigations. Navigation clears document-scoped styles; wait for fonts before geometry assertions.
- Compare direct, client and history navigation with a separate direct-load baseline. Avoid reloading while an earlier page is prefetching.
- Check CTA keyboard modality without Tab-induced scrolling. Confirm `:active`, observe the press duration, and release on the same control while preventing navigation or submission.
- Poll short animations at bounded intervals. Keep intermediate, interruption, locale and reduced-motion assertions. Parameterize Header cases by locale so retries repeat only the failing locale.
- Capture and pause short touch-release animations before sampling. Dispatch cancellation and sample its midpoint in one browser task; finish the captured effect before checking settled state.
- Keep production durations and CI retries unchanged. Do not add arbitrary sleeps or filter page errors.
- For copy changes, find old wording, translations and accessible names in tests and fixtures. Update affected checks without weakening behavior or meaning assertions.

The hosted Ubuntu browser jobs install Playwright's pinned Chromium without `--with-deps`, matching the performance job. The runner image supplies system libraries; browser startup still fails if a required library is absent. Avoid unrelated apt upgrades during release verification: PR #91 showed they could consume more than nine minutes of the 15-minute Chromium job budget. Test coverage and job timeouts remain unchanged.

### Release Workflow

Provider recovery follows the [Resend webhook](INTEGRATIONS.md#webhook-recovery) and [Redis backup and restore](INTEGRATIONS.md#backup-and-restore) procedures. Treat successful SDK responses without valid acknowledgements as uncertain writes: retain leases and journals, stop further mutations and do not mark webhook processing complete. Production release completion does not resolve a cloud monitoring entitlement failure; record uptime activation separately in [Integrations](INTEGRATIONS.md#local-and-cloud-verification).

1. Push the reviewed PR and wait for full CI and the Vercel Preview for its head SHA.
2. When release is authorized, merge the verified PR into `main` and record the resulting SHA. GitHub automatically deletes the remote PR branch. Main CI verifies reusable evidence or runs the complete suite.
3. Confirm a Vercel production deployment exists for that SHA. Distinguish a missing Git trigger from a deployment waiting for CI, building, failed or ready. If no deployment appears, inspect the Git integration instead of rerunning successful tests. Create a deployment from that Git reference when integration recovery requires it.
4. Wait for successful release CI, Vercel `READY`, matching deployed SHA and production aliases. A ready preview or successful CI alone does not establish production success. Preserve the exact-commit gate; retry a timed-out deployment only after that same SHA has passed CI.
5. After production succeeds, fetch/prune refs, confirm no commits were added after merge, leave the merged branch and safely delete it with `git branch -d`. Remove only clean task-owned temporary worktrees when needed. Preserve ongoing work and unmerged commits; never force-delete to resolve uncertainty. Start subsequent work from current `main`.

A PR-only request does not authorize merging. Deployment includes safe local cleanup of the released branch. Production browser smoke tests are optional follow-up checks unless evidence indicates a failure. Report deployment completion promptly once version and live-state checks pass.

### Production Gate

GitHub Actions supplies verification; the Vercel Git integration performs deployment. The repository gate below binds production builds to CI evidence. Live branch protection and Vercel project settings require separate verification. CI and Vercel rebuild the same source; they do not share an identical tested artifact.

Vercel waits up to 30 minutes for the latest main push CI run matching `VERCEL_GIT_COMMIT_SHA`. Only `success` permits the build to proceed. Preview and local builds skip the gate.

The macOS job allows 20 minutes. The remaining wait covers ordinary queueing and leaves build time under Vercel's [45-minute limit](https://vercel.com/docs/limits#build-time-per-deployment). Longer queues can time out; redeploy the same SHA after CI passes.

- Poll every 15 seconds during the first minute, then once per minute. This detects short evidence-reuse runs sooner and uses at most 33 requests over the 30-minute window in the normal pending-response path. Log status changes and elapsed gate time. Retry network, body-read, JSON parse, malformed-response and server failures with backoff up to four minutes.
- Reset the failure count only after parsing and validating the full response. Honor `Retry-After` and quota-reset headers within the original deadline.
- Fail closed on missing metadata, non-retryable errors, cancellation or timeout.
- Public GitHub access needs no extra credential. Add scoped authentication before making the repository private.
- Preserve the gate in `vercel.json`'s build command. Keep it out of `npm run build`, since CI must not wait on itself.

### Review Evidence

Keep local screenshots and dated notes in `../local/audit/`. Legacy `audit/` remains excluded by Git and Vercel. Archive inactive caches or builds under `../local/archives/`; tools recreate their normal output paths.

Keep `node_modules/`, local environment files and Vercel project linkage in the checkout. npm and Next.js/Turbopack require normal module resolution. Local evidence is historical, not a current issue list, and is absent from fresh clones. Keep durable decisions in tracked docs. Share reviewed evidence with relative image paths and its date, commit, environment and resolution status.

The disposable Ubuntu performance runner supplies `LIGHTHOUSE_CHROME_FLAGS=--headless=new --no-sandbox` because Playwright's downloaded Chrome lacks an Ubuntu AppArmor sandbox profile. This override applies only to Lighthouse's provider-disabled localhost audit; local runs retain the default Chrome sandbox. Performance budgets remain unchanged. See [Lighthouse CI guidance](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md).

CI keeps failed-attempt screenshots and traces for failed attempts and all retries, including passing retries. Upload artifacts even when the job passes; retain them for seven days.

WebKit runs fresh processes in two isolated jobs because a long-lived worker previously stalled. Output goes to separate `node_modules/.cache/playwright/webkit-shard-1/` and `node_modules/.cache/playwright/webkit-shard-2/` directories. Local traces remain in `node_modules/.cache/playwright/`.

See [`playwright.config.ts`](../playwright.config.ts), [`ci.yml`](../.github/workflows/ci.yml) and [README](../README.md#verification). The [CI workflow](#ci-and-evidence-reuse) defines concurrent jobs and reuse requirements.

The split follows the [Next.js testing guide](https://nextjs.org/docs/app/guides/testing): Node's isolated test runner covers service logic, while Playwright checks rendered pages and interactions against a production build. Browser project, shard and retry-trace settings follow the [Playwright projects](https://playwright.dev/docs/test-projects), [sharding](https://playwright.dev/docs/test-sharding) and [trace viewer](https://playwright.dev/docs/trace-viewer) guides.
