import { PageHero } from "@/components/page-hero";
import { appearance } from "./subscription-preferences-page.styles";
import { Container } from "@/components/container";
import { Suspense } from "react";
import { ServiceLoading } from "@/components/service-loading";
import { SavedPreferences } from "@/features/subscriptions/saved-preferences";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import type { PreferencesCopy } from "@/features/subscriptions/subscription-preferences-form";
import {
  SubscriptionPreferencesRequestForm,
  type PreferencesRequestCopy,
} from "@/features/subscriptions/subscription-preferences-request-form";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { readPreferenceToken } from "@/features/subscriptions/server/subscription-preferences";

const copy = {
  en: {
    label: "Email Preferences",
    title: "Manage Your Subscription.",
    intro: "Choose the language you prefer for research updates or unsubscribe from future emails.",
    invalid:
      "Enter your email to receive a secure link to manage your preferences. To protect your privacy, we show the same confirmation whether or not the email is subscribed.",
    email: "Email Address",
    language: "Preferred Language",
    chooseLanguage: "Choose a language",
    save: "Save Preferences",
    saving: "Saving…",
    saved: "Your preferred language has been updated.",
    unsubscribe: "Unsubscribe",
    unsubscribing: "Unsubscribing…",
    unsubscribed: "You have been unsubscribed.",
    request: "Send Secure Link",
    requesting: "Sending…",
    sent: "If this address is subscribed, a secure link is on its way.",
    error: "Your request couldn't be completed. Please try again.",
  },
  "zh-tw": {
    label: "郵件偏好",
    title: "管理你的訂閱。",
    intro: "選擇接收研究更新的偏好語言，或取消日後的郵件訂閱。",
    invalid:
      "輸入你的電子郵件地址，即可取得管理偏好設定的安全連結。為保護你的隱私，無論該電子郵件地址是否已訂閱，我們都會顯示相同的確認訊息。",
    email: "電子郵件地址",
    language: "偏好語言",
    chooseLanguage: "請選擇語言",
    save: "儲存偏好",
    saving: "儲存中…",
    saved: "你的偏好語言已更新。",
    unsubscribe: "取消訂閱",
    unsubscribing: "取消中…",
    unsubscribed: "你已取消訂閱。",
    request: "寄送安全連結",
    requesting: "寄送中…",
    sent: "若此地址已訂閱，安全連結將寄至你的信箱。",
    error: "目前無法完成要求，請稍後再試。",
  },
  "zh-cn": {
    label: "邮件偏好",
    title: "管理你的订阅。",
    intro: "选择接收研究更新的偏好语言，或取消日后的邮件订阅。",
    invalid:
      "输入你的电子邮件地址，即可获取管理偏好设置的安全链接。为保护你的隐私，无论该电子邮件地址是否已订阅，我们都会显示相同的确认信息。",
    email: "电子邮件地址",
    language: "偏好语言",
    chooseLanguage: "请选择语言",
    save: "保存偏好",
    saving: "保存中…",
    saved: "你的偏好语言已更新。",
    unsubscribe: "取消订阅",
    unsubscribing: "取消中…",
    unsubscribed: "你已取消订阅。",
    request: "发送安全链接",
    requesting: "发送中…",
    sent: "如果此地址已订阅，安全链接将发送至你的邮箱。",
    error: "目前无法完成请求，请稍后再试。",
  },
} satisfies Record<
  Locale,
  PreferencesCopy & PreferencesRequestCopy & { label: string; title: string; intro: string; invalid: string }
>;

export async function SubscriptionPreferencesPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const text = copy[locale];
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const payload = readPreferenceToken(token);

  return (
    <div>
      <SiteHeader
        copy={getNavigationCopy(locale)}
        locale={locale}
        languageQuery={payload ? new URLSearchParams({ token }).toString() : undefined}
      />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="standard"
          label={<>{text.label}</>}
          title={<>{text.title}</>}
          intro={
            <>
              <p>{text.intro}</p>
            </>
          }
        />
        <Container as="section" className={appearance["preferences-panel"]}>
          {payload ? (
            <Suspense key={token} fallback={<ServiceLoading locale={locale} />}>
              <SavedPreferences copy={text} email={payload.email} token={token} />
            </Suspense>
          ) : (
            <div className={appearance["preferences-request"]}>
              <p className={appearance["preferences-invalid"]}>{text.invalid}</p>
              <SubscriptionPreferencesRequestForm copy={text} locale={locale} />
            </div>
          )}
        </Container>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
