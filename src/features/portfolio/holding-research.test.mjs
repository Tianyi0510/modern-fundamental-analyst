import assert from "node:assert/strict";
import test from "node:test";
import { portfolioHoldings } from "./portfolio.ts";
import { getHoldingResearch } from "./holding-research.ts";

test("every disclosed position has a sourced, localized research profile", () => {
  for (const { symbol } of portfolioHoldings) {
    const profile = getHoldingResearch(symbol);
    for (const locale of ["en", "zh-tw", "zh-cn"]) assert.ok(profile.business[locale]?.trim(), symbol);
    assert.ok(profile.name && profile.exchange, symbol);
    assert.equal(new URL(profile.report).protocol, "https:");
    assert.equal(new URL(profile.issuer).protocol, "https:");
    assert.match(profile.periodEnd, /^\d{4}-\d{2}-\d{2}$/);
    if (profile.kind === "company") {
      assert.match(profile.report, /^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\//);
      assert.match(profile.industry, /^\d{4} · .+/);
      assert.equal(new URL(profile.investorRelations).protocol, "https:");
      assert.ok(profile.priorRevenue > 0 && profile.revenue > 0);
      assert.ok(Number.isSafeInteger(profile.netIncomeToCommon));
      assert.ok(Number.isSafeInteger(profile.assets) && profile.assets > 0);
      assert.ok(profile.filed >= profile.periodEnd);
      assert.ok(Number.isFinite(profile.revenue) && Number.isFinite(profile.operatingCashFlow));
    } else {
      assert.ok(profile.inception <= profile.periodEnd);
      assert.ok(profile.expenseRatio >= 0);
    }
  }
});
