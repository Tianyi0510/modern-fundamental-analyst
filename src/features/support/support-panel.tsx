import { appearance } from "./support-panel.styles";
import { Alert } from "@/components/ui/alert";
import { createCheckoutAttempt, isValidCheckoutAttempt } from "./server/checkout-attempt";
import { SupportCheckoutForm } from "./support-checkout-form";
import { supportCopy } from "./support-copy";
import { type parseSupportSearchParams, type SupportStatus } from "./support-config";
import { SUPPORT_CATALOG } from "./server/support-catalog";
import { resolveSupportStatus } from "./server/stripe-checkout";
import type { Locale } from "@/lib/i18n";

type SupportPanelProps = {
  locale: Locale;
  params: ReturnType<typeof parseSupportSearchParams>;
};

export async function VerifiedSupportPanel({ locale, params }: SupportPanelProps) {
  const status = await resolveSupportStatus(params);
  return <SupportPanel locale={locale} params={params} status={status} />;
}

export function SupportPanel({ locale, params, status }: SupportPanelProps & { status: SupportStatus }) {
  const text = supportCopy[locale];
  const recoveryAttempt = params.attemptId;
  const selectedChoice = params.productId ?? "support-12-v1";
  const choices = SUPPORT_CATALOG.map((product) => ({ value: product.id, amount: product.unitAmount / 100 }));
  const checkoutLocale = params.checkoutLocale;
  const retired = status === "retired-checkout" || (recoveryAttempt && !isValidCheckoutAttempt(recoveryAttempt));
  const formAttempt = retired ? "" : (recoveryAttempt ?? createCheckoutAttempt());
  return (
    <section className={appearance["support-section"]}>
      <div className={appearance["support-layout"] + " " + appearance["shell"]}>
        <div className={appearance["support-copy"]}>
          <h2>{text.sectionTitle}</h2>
          <p>{text.sectionText}</p>
        </div>
        {retired ? (
          <Alert role="status" className={appearance["support-status"]}>
            {text.statuses["retired-checkout"]}
          </Alert>
        ) : (
          <SupportCheckoutForm
            key={formAttempt}
            attemptId={formAttempt}
            initialChoice={selectedChoice}
            recovering={Boolean(recoveryAttempt)}
            resume={text.resume}
            recovery={text.recovery}
            submit={
              status === "error" || status === "rate-limited" || status === "invalid-amount" ? text.retry : text.submit
            }
            submitting={text.submitting}
            note={<p className={appearance["support-note"]}>{text.note}</p>}
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="checkout_locale" value={checkoutLocale} />
            <div className={appearance["support-honeypot"]} aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <fieldset disabled={Boolean(recoveryAttempt)}>
              <legend>{text.legend}</legend>
              <div className={appearance["support-amounts"]}>
                {choices.map(({ value, amount }) => (
                  <label className={appearance["support-amount-option"]} key={value}>
                    <input type="radio" name="product_id" value={value} defaultChecked={value === selectedChoice} />
                    <span>USD</span>
                    <strong>${amount}</strong>
                  </label>
                ))}
              </div>
            </fieldset>
            {status ? (
              <Alert
                className={`${appearance["support-status"]} ${status === "error" ? "support-status-error border-l-[var(--price-down)]" : "border-l-accent"}`}
                role="status"
                aria-live="polite"
              >
                {text.statuses[status]}
              </Alert>
            ) : null}
          </SupportCheckoutForm>
        )}
      </div>
    </section>
  );
}
