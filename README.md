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
npm run build
node --test tests/rendered-html.test.mjs
```

Portfolio holdings and performance figures in the initial version are
illustrative placeholders and must be replaced with verified data before the
site is presented as a live investment record.
