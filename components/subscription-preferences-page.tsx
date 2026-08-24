import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubscriptionPreferencesForm, type PreferencesCopy } from "@/components/subscription-preferences-form";
import { SubscriptionPreferencesRequestForm, type PreferencesRequestCopy } from "@/components/subscription-preferences-request-form";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { maskEmail, readPreferenceToken } from "@/lib/subscription-preferences";
import styles from "./subscription-preferences.module.css";

const copy = {
  en: { label: "Email Preferences", title: "Manage Your Subscription.", intro: "Choose the language you prefer for research updates or unsubscribe from future emails.", invalid: "Enter your email address and we’ll send you a secure preferences link. For your privacy, we’ll show the same confirmation whether or not the address is subscribed.", email: "Email Address", language: "Preferred Language", save: "Save Preferences", saving: "Saving…", saved: "Your preferred language has been updated.", unsubscribe: "Unsubscribe", unsubscribing: "Unsubscribing…", unsubscribed: "You have been unsubscribed.", request: "Send Secure Link", requesting: "Sending…", sent: "If this address is subscribed, a secure link is on its way.", error: "Your request could not be completed. Please try again." },
  "zh-tw": { label: "郵件偏好", title: "管理你的訂閱。", intro: "選擇接收研究更新的偏好語言，或取消日後的郵件訂閱。", invalid: "輸入電子郵件地址，我們會寄送安全的偏好設定連結。為保障隱私，無論該地址是否已訂閱，都會顯示相同的確認訊息。", email: "電子郵件地址", language: "偏好語言", save: "儲存偏好", saving: "儲存中…", saved: "你的偏好語言已更新。", unsubscribe: "取消訂閱", unsubscribing: "取消中…", unsubscribed: "你已取消訂閱。", request: "寄送安全連結", requesting: "寄送中…", sent: "若此地址已訂閱，安全連結將寄至你的信箱。", error: "目前無法完成要求，請稍後再試。" },
  "zh-cn": { label: "邮件偏好", title: "管理你的订阅。", intro: "选择接收研究更新的偏好语言，或取消日后的邮件订阅。", invalid: "输入电子邮件地址，我们会发送安全的偏好设置链接。为保护隐私，无论该地址是否已订阅，都会显示相同的确认信息。", email: "电子邮件地址", language: "偏好语言", save: "保存偏好", saving: "保存中…", saved: "你的偏好语言已更新。", unsubscribe: "取消订阅", unsubscribing: "取消中…", unsubscribed: "你已取消订阅。", request: "发送安全链接", requesting: "发送中…", sent: "如果此地址已订阅，安全链接将发送至你的邮箱。", error: "目前无法完成请求，请稍后再试。" },
} satisfies Record<Locale, PreferencesCopy & PreferencesRequestCopy & { label: string; title: string; intro: string; invalid: string }>;

export async function SubscriptionPreferencesPage({ locale, searchParams }: { locale: Locale; searchParams: Promise<{ token?: string | string[] }> }) {
  const text = copy[locale];
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const payload = readPreferenceToken(token);

  return <main id="main-content">
    <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className={`${styles.hero} shell`}>
      <p className="eyebrow"><span /> {text.label}</p>
      <h1>{text.title}</h1>
      <p>{text.intro}</p>
    </section>
    <section className={`${styles.panel} shell`}>
      {payload
        ? <SubscriptionPreferencesForm copy={text} email={maskEmail(payload.email)} initialLocale={locale} token={token} />
        : <div className={styles.request}>
          <p className={styles.invalid}>{text.invalid}</p>
          <SubscriptionPreferencesRequestForm copy={text} locale={locale} />
        </div>}
    </section>
    <SiteFooter locale={locale} />
  </main>;
}
