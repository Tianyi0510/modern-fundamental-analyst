import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { SUPPORT_AMOUNTS, type SupportStatus } from "@/lib/support-config";

const copy = {
  en: {
    label: "Support",
    title: ["Support Independent", "Research."],
    intro: "Help sustain rigorous, transparent public-equity research and keep every investment memo freely accessible to all readers.",
    sectionTitle: "Choose an amount.",
    sectionText: "Your one-time contribution supports research tools, data access, and the time required to publish accountable analysis.",
    legend: "One-time support amount",
    submit: "Continue to Stripe",
    note: "Securely processed by Stripe. This is voluntary support—not a charitable donation, investment product, or advisory service.",
    statuses: {
      pending: "Your payment is still processing. Check your Stripe confirmation before trying again.",
      unverified: "We could not confirm this payment. Check your Stripe confirmation before trying again.",
      success: "Thank you for supporting independent research. Stripe will send your payment confirmation by email.",
      cancelled: "Checkout was cancelled. No payment was made.",
      error: "Checkout is temporarily unavailable. Please try again later.",
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
    note: "付款由 Stripe 安全處理。這是自願支持，並非慈善捐款、投資產品或投資顧問服務。",
    statuses: {
      pending: "付款仍在處理中，請先查閱 Stripe 付款確認，再決定是否重試。",
      unverified: "目前無法確認這筆付款，請先查閱 Stripe 付款確認，再決定是否重試。",
      success: "感謝你支持獨立研究。Stripe 將透過電子郵件寄送付款確認。",
      cancelled: "付款流程已取消，沒有產生任何款項。",
      error: "目前暫時無法開啟付款頁面，請稍後再試。",
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
    note: "付款由 Stripe 安全处理。这是自愿支持，并非慈善捐款、投资产品或投资顾问服务。",
    statuses: {
      pending: "付款仍在处理中，请先查阅 Stripe 付款确认，再决定是否重试。",
      unverified: "目前无法确认这笔付款，请先查阅 Stripe 付款确认，再决定是否重试。",
      success: "感谢你支持独立研究。Stripe 将通过电子邮件发送付款确认。",
      cancelled: "付款流程已取消，没有产生任何款项。",
      error: "目前暂时无法打开付款页面，请稍后再试。",
    },
  },
} as const;

export function SupportPageContent({ locale, status }: { locale: Locale; status?: SupportStatus }) {
  const text = copy[locale];

  return <main className="support-page" id="main-content">
    <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className="page-hero support-hero shell">
      <p className="eyebrow"><span /> {text.label}</p>
      <h1>{text.title[0]}<br /><em>{text.title[1]}</em></h1>
      <div className="page-intro"><p>{text.intro}</p></div>
    </section>
    <section className="support-section">
      <div className="support-layout shell">
        <div className="support-copy">
          <h2>{text.sectionTitle}</h2>
          <p>{text.sectionText}</p>
        </div>
        <form className="support-form" action="/api/stripe/checkout" method="post">
          <input type="hidden" name="locale" value={locale} />
          <div className="support-honeypot" aria-hidden="true">
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <fieldset>
            <legend>{text.legend}</legend>
            <div className="support-amounts">
              {SUPPORT_AMOUNTS.map((amount) => <label className="support-amount-option" key={amount}>
                <input type="radio" name="amount" value={amount} defaultChecked={amount === 12} />
                <span>USD</span>
                <strong>${amount}</strong>
              </label>)}
            </div>
          </fieldset>
          {status ? <p className={`support-status support-status-${status}`} role="status" aria-live="polite">{text.statuses[status]}</p> : null}
          <button className="button button-dark support-submit" type="submit">{text.submit}</button>
          <p className="support-note">{text.note}</p>
        </form>
      </div>
    </section>
    <SiteFooter locale={locale} />
  </main>;
}
