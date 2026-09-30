import { randomUUID } from "node:crypto";
import { SiteFooter } from "@/components/site-footer";
import { SupportCheckoutForm } from "@/components/support-checkout-form";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { SUPPORT_AMOUNTS, parseCheckoutAttempt, parseSupportAmount, type SupportStatus } from "@/lib/support-config";

const copy = {
  en: {
    label: "Support",
    title: ["Support Independent", "Research."],
    intro:
      "Help sustain rigorous, transparent public-equity research and keep every investment memo freely accessible to all readers.",
    sectionTitle: "Choose an amount.",
    sectionText:
      "Your one-time contribution supports research tools, data access, and the time required to publish accountable analysis.",
    legend: "One-time support amount",
    submit: "Continue to Stripe",
    submitting: "Redirecting to Stripe…",
    retry: "Try again",
    resume: "Retry this checkout",
    recovery: "If navigation stopped or failed, retry this checkout with the same amount.",
    note: "Securely processed by Stripe. This is voluntary support—not a charitable donation, investment product, or advisory service.",
    statuses: {
      pending: "Your payment is still processing. Check your Stripe confirmation before trying again.",
      unverified: "We could not confirm this payment. Check your Stripe confirmation before trying again.",
      success: "Thank you for supporting independent research. Stripe will send your payment confirmation by email.",
      cancelled: "Checkout was cancelled. No payment was made.",
      error: "Checkout is temporarily unavailable. Please try again later.",
      "rate-limited":
        "Too many checkout attempts. Wait 10 minutes before trying again. This attempt did not start a payment.",
      "invalid-amount": "Choose USD 6, 12, or 18, then try again.",
    },
  },
  "zh-tw": {
    label: "支持研究",
    title: ["支持獨立", "投資研究。"],
    intro: "協助維持嚴謹、透明的公開股票研究，讓每一篇投資備忘錄都能持續免費開放閱讀。",
    sectionTitle: "選擇支持金額。",
    sectionText: "你的一次性支持將用於研究工具、數據存取，以及撰寫可被檢驗之分析所需的時間。",
    legend: "一次性支持金額",
    submit: "前往 Stripe",
    submitting: "正在前往 Stripe…",
    retry: "重試",
    resume: "重試此付款流程",
    recovery: "若跳轉已停止或失敗，可用相同金額重試此付款流程。",
    note: "付款由 Stripe 安全處理。這是自願支持，並非慈善捐款、投資產品或投資顧問服務。",
    statuses: {
      pending: "付款仍在處理中，請先查閱 Stripe 付款確認，再決定是否重試。",
      unverified: "目前無法確認這筆付款，請先查閱 Stripe 付款確認，再決定是否重試。",
      success: "感謝你支持獨立研究。Stripe 將透過電子郵件寄送付款確認。",
      cancelled: "付款流程已取消，沒有產生任何款項。",
      error: "目前暫時無法開啟付款頁面，請稍後再試。",
      "rate-limited": "付款嘗試次數過多，請等待 10 分鐘後再重試。本次未開啟付款流程。",
      "invalid-amount": "請選擇 6、12 或 18 美元後重試。",
    },
  },
  "zh-cn": {
    label: "支持研究",
    title: ["支持独立", "投资研究。"],
    intro: "协助维持严谨、透明的公开股票研究，让每一篇投资备忘录都能持续免费开放阅读。",
    sectionTitle: "选择支持金额。",
    sectionText: "你的一次性支持将用于研究工具、数据访问，以及撰写可被检验之分析所需的时间。",
    legend: "一次性支持金额",
    submit: "前往 Stripe",
    submitting: "正在前往 Stripe…",
    retry: "重试",
    resume: "重试此付款流程",
    recovery: "若跳转已停止或失败，可用相同金额重试此付款流程。",
    note: "付款由 Stripe 安全处理。这是自愿支持，并非慈善捐款、投资产品或投资顾问服务。",
    statuses: {
      pending: "付款仍在处理中，请先查阅 Stripe 付款确认，再决定是否重试。",
      unverified: "目前无法确认这笔付款，请先查阅 Stripe 付款确认，再决定是否重试。",
      success: "感谢你支持独立研究。Stripe 将通过电子邮件发送付款确认。",
      cancelled: "付款流程已取消，没有产生任何款项。",
      error: "目前暂时无法打开付款页面，请稍后再试。",
      "rate-limited": "付款尝试次数过多，请等待 10 分钟后再重试。本次未开启付款流程。",
      "invalid-amount": "请选择 6、12 或 18 美元后重试。",
    },
  },
} as const;

export function SupportPageContent({
  locale,
  status,
  attemptId,
  amount,
}: {
  locale: Locale;
  status?: SupportStatus;
  attemptId?: string;
  amount?: string;
}) {
  const text = copy[locale];
  const recoveryAttempt =
    status === "error" || status === "rate-limited" ? parseCheckoutAttempt(attemptId ?? null) : undefined;
  const selectedAmount = parseSupportAmount(amount ?? null) ?? 12;

  return (
    <main className="support-page" id="main-content">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <div className="page-hero-band">
        <section className="page-hero support-hero shell">
          <p className="eyebrow">
            <span /> {text.label}
          </p>
          <h1>
            {text.title[0]}
            <br />
            <em>{text.title[1]}</em>
          </h1>
          <div className="page-intro">
            <p>{text.intro}</p>
          </div>
        </section>
      </div>
      <section className="support-section">
        <div className="support-layout shell">
          <div className="support-copy">
            <h2>{text.sectionTitle}</h2>
            <p>{text.sectionText}</p>
          </div>
          <SupportCheckoutForm
            attemptId={recoveryAttempt ?? randomUUID()}
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
      <SiteFooter locale={locale} />
    </main>
  );
}
