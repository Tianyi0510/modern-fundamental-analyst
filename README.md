# Modern Fundamental Analyst

An independent public-equity portfolio website featuring portfolio allocation,
performance reporting, investment memos, contact information, and a clear
investment disclaimer.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Vercel production hosting
- Wix-managed domain and DNS

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run verify
```

`verify` runs TypeScript, ESLint, unit tests, and a production build. Pull
requests run the same command in GitHub Actions before they are merged.

Portfolio holdings are maintained in `data/portfolio.ts`. Cost basis, market
value, position weights, holding returns, and portfolio totals are derived from
that source so displayed figures remain internally consistent.
