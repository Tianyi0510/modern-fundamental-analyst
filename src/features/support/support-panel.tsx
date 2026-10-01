import { randomUUID } from "node:crypto";
import { SupportCheckoutForm } from "./support-checkout-form";
import { supportCopy } from "./support-copy";
import { SUPPORT_AMOUNTS, parseSupportAmount, type parseSupportSearchParams } from "./support-config";
import { resolveSupportStatus } from "./server/stripe-checkout";
import type { Locale } from "@/lib/i18n";

export async function SupportPanel({
  locale,
  params,
}: {
  locale: Locale;
  params: ReturnType<typeof parseSupportSearchParams>;
}) {
  const status = await resolveSupportStatus(params);
  const text = supportCopy[locale];
  const recoveryAttempt = params.attemptId;
  const selectedAmount = parseSupportAmount(params.amount ?? null) ?? 12;
  const checkoutLocale = params.checkoutLocale;
  const formAttempt = recoveryAttempt ?? randomUUID();
  return (
    <section className="support-section">
      <div className="support-layout shell">
        <div className="support-copy">
          <h2>{text.sectionTitle}</h2>
          <p>{text.sectionText}</p>
        </div>
        <SupportCheckoutForm
          key={formAttempt}
          attemptId={formAttempt}
          initialAmount={String(selectedAmount)}
          recovering={Boolean(recoveryAttempt)}
          resume={text.resume}
          recovery={text.recovery}
          submit={
            status === "error" || status === "rate-limited" || status === "invalid-amount" ? text.retry : text.submit
          }
          submitting={text.submitting}
          note={<p className="support-note">{text.note}</p>}
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="checkout_locale" value={checkoutLocale} />
          <div className="support-honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <fieldset disabled={Boolean(recoveryAttempt)}>
            <legend>{text.legend}</legend>
            <div className="support-amounts">
              {SUPPORT_AMOUNTS.map((amount) => (
                <label className="support-amount-option" key={amount}>
                  <input type="radio" name="amount" value={amount} defaultChecked={amount === selectedAmount} />
                  <span>USD</span>
                  <strong>${amount}</strong>
                </label>
              ))}
            </div>
          </fieldset>
          {status ? (
            <p className={`support-status support-status-${status}`} role="status" aria-live="polite">
              {text.statuses[status]}
            </p>
          ) : null}
        </SupportCheckoutForm>
      </div>
    </section>
  );
}
