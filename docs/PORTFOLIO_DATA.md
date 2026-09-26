# Portfolio Data

This guide owns the portfolio data model, calculation scope, reconciliation, and update procedure.

## Workspace data

`data/portfolio-detail.ts` contains 91 purchase lots with fees, a shared table of SPY adjusted prices by applied trading date, 108 dated dividend, withholding-tax, and financing-interest cash events, three corporate actions, and 21 month-end position, price, and XIRR snapshots. Amounts and prices are in USD; dates use `YYYY-MM-DD`. Cash-event amounts are signed: dividends are positive, taxes and interest are negative. Purchase costs are `grossAmount + fees`. Simulated SPY units use `grossAmount / adjustedClose`, while the full purchase cost is the simulated cash outflow; they are hypothetical holdings.

`data/portfolio.ts` derives the website's current holdings, cost basis, income, market value, and return history from those records. It also exports monthly simulated SPY units, values, and since-inception XIRRs through `portfolioSpyMonthlyReturns`, plus the latest comparison through `portfolioSpySnapshot`. Home, Portfolio, and Performance import this shared module. The application reads workspace data directly and does not need a database or a separate data-processing service.

The published 2026-08-31 snapshot contains 18 holdings and 21 month-end observations. Stocks total USD 121,301.99; the simulated SPY value is USD 121,637.62. Idle cash, deposits, withdrawals, and currency exchanges are outside this stock-investment return model. The Performance chart shows since-inception annualized XIRR at each month-end, not each month's standalone return; horizons below 30 days remain unavailable.

## Calculation and updates

Keep source precision until display formatting. Portfolio cumulative return includes net dividends and deducts financing interest; individual holding returns compare market value with cost basis and do not allocate portfolio-level interest. The dated events support other cash-flow calculations, while the month-end prices and quantities support position-level valuation. Simulated SPY units and terminal values are derived from the recorded inputs; the XIRR observations are stored results, not recomputed by the website at request time.

Each month records the applied U.S. trading date, which precedes the calendar month-end when markets are closed. The established SPY monthly prices and XIRRs remain unchanged.

On each update, add or amend detailed records first. Reconcile transaction costs, dated cash-flow sums, corporate-action-adjusted shares, price × shares, reported stock value, benchmark price basis, simulated units and values, and XIRR against the source evidence. Update `data/portfolio.ts` only when derivation or presentation rules change. Run focused portfolio tests and relevant browser checks; run the full verification gate before deployment. Do not commit source statements, account identifiers, or local source paths.

The application and CI use Node.js, TypeScript, and the existing test tools. Reading, updating, and calculating from the workspace data do not require Python or SQL. A one-time external data conversion may use Python when its spreadsheet or statistical libraries materially simplify that conversion; it is not a runtime dependency or a second source of portfolio data.
