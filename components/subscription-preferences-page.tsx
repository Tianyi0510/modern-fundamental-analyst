import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubscriptionPreferencesForm, type PreferencesCopy } from "@/components/subscription-preferences-form";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { maskEmail, readPreferenceToken } from "@/lib/subscription-preferences";
import styles from "./subscription-preferences.module.css";

const copy = {
  en: { label: "Email Preferences", title: "Manage Your Subscription.", intro: "Choose the language you prefer for research updates or unsubscribe from future emails.", invalid: "This preferences link is invalid or has expired.", email: "Email Address", language: "Preferred Language", save: "Save Preferences", saving: "Saving…", saved: "Your preferred language has been updated.", unsubscribe: "Unsubscribe", unsubscribing: "Unsubscribing…", unsubscribed: "You have been unsubscribed.", error: "Your preferences could not be updated. Please try again." },
  "zh-tw": { label: "郵件偏好", title: "管理你的訂閱。", intro: "選擇接收研究更新的偏好語言，或取消日後的郵件訂閱。", invalid: "此偏好設定連結無效或已過期。", email: "電子郵件地址", language: "偏好語言", save: "儲存偏好", saving: "儲存中…", saved: "你的偏好語言已更新。", unsubscribe: "取消訂閱", unsubscribing: "取消中…", unsubscribed: "你已取消訂閱。", error: "目前無法更新偏好，請稍後再試。" },
  "zh-cn": { label: "邮件偏好", title: "管理你的订阅。", intro: "选择接收研究更新的偏好语言，或取消日后的邮件订阅。", invalid: "此偏好设置链接无效或已过期。", email: "电子邮件地址", language: "偏好语言", save: "保存偏好", saving: "保存中…", saved: "你的偏好语言已更新。", unsubscribe: "取消订阅", unsubscribing: "取消中…", unsubscribed: "你已取消订阅。", error: "目前无法更新偏好，请稍后再试。" },
} satisfies Record<Locale, PreferencesCopy & { label: string; title: string; intro: string; invalid: string }>;

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
        : <p className={styles.invalid} role="alert">{text.invalid}</p>}
    </section>
    <SiteFooter locale={locale} />
  </main>;
}
