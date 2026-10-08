import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SupportPanel } from "./support-panel";
import { parseSupportSearchParams } from "./support-config";
import { createCheckoutAttempt } from "./server/checkout-attempt";
import { supportCopy } from "./support-copy";

vi.mock("./server/support-catalog", () => ({
  SUPPORT_CATALOG: [
    { id: "support-6-v1", unitAmount: 600 },
    { id: "support-12-v1", unitAmount: 1200 },
    { id: "support-18-v1", unitAmount: 1800 },
  ],
}));
vi.mock("./server/stripe-checkout", () => ({ resolveSupportStatus: vi.fn() }));
vi.mock("./server/checkout-attempt", () => ({
  createCheckoutAttempt: vi.fn(() => "test-attempt"),
  isValidCheckoutAttempt: vi.fn(() => true),
}));

for (const locale of ["en", "zh-tw", "zh-cn"] as const) {
  describe(`Support panel: ${locale}`, () => {
    it("withholds checkout creation while a verified payment is pending and offers localized help", () => {
      vi.mocked(createCheckoutAttempt).mockClear();
      render(<SupportPanel locale={locale} params={parseSupportSearchParams({}, locale)} status="pending" />);
      expect(screen.getByRole("status")).toHaveTextContent(supportCopy[locale].statuses.pending);
      expect(screen.queryByRole("button", { name: supportCopy[locale].submit })).not.toBeInTheDocument();
      expect(screen.queryByRole("radio")).not.toBeInTheDocument();
      expect(createCheckoutAttempt).not.toHaveBeenCalled();
      expect(screen.getByRole("link", { name: supportCopy[locale].paymentHelp })).toHaveAttribute(
        "href",
        locale === "en" ? "/contact" : `/${locale}/contact`,
      );
    });

    it("keeps ordinary checkout available with a final-total disclosure", () => {
      render(<SupportPanel locale={locale} params={parseSupportSearchParams({}, locale)} status={undefined} />);
      expect(screen.getAllByRole("radio")).toHaveLength(3);
      expect(screen.getByRole("button", { name: supportCopy[locale].submit })).toBeEnabled();
      expect(screen.getByText(supportCopy[locale].note)).toBeVisible();
    });
  });
}
