# Portfolio Data

This guide owns the versioned portfolio snapshot, calculation scope, source reconciliation, and update procedure.

`data/portfolio.ts` is the site's portfolio data store; Redis only supports service coordination and rate limiting. Home, Portfolio and Performance share this snapshot. The Performance chart uses since-inception annualized XIRR at each month-end, not single-month returns; horizons below 30 days remain unavailable.

The 2026-08-31 update uses `portfolio-return-analysis-monthly-xirr.xlsx` (statement-backed revision): `August Statement!A16:D33` for 18 holdings and `Monthly XIRR!A5:H25` for the history. The original `portfolio-return-analysis-2026-07-31.xlsx` supplies unchanged cost bases, net dividends and financing interest; the August revision reports no added cash flows. Stocks total USD 121,301.99. Idle cash is excluded. Original July tabs remain historical snapshots; do not use the provisional August estimates.

Keep source precision until display formatting. Portfolio cumulative return includes net dividends and deducts financing interest; individual holding returns remain market-value-versus-cost calculations. On each update, reconcile quantities and price × shares, totals, the latest XIRR observation and snapshot date; run focused portfolio regression and browser checks. Run the full verification gate before deployment. Do not commit source statements, account identifiers or local source paths.

The latest history row supplies the shared snapshot date and both XIRRs; do not maintain duplicate headline values. Holdings remain the source of aggregate cost and market value. Retain the independently reported monthly market value for reconciliation rather than replacing it with a calculated total. CI checks unique holdings, finite nonnegative inputs, consecutive calendar month-ends, paired XIRR availability and agreement between the latest history and holdings.

The application and CI require only Node.js. Python is optional for offline Excel extraction or independent XIRR reconciliation; it is not a website runtime or deployment dependency. Review extracted values before updating the versioned data, and never publish private workbook contents automatically.
