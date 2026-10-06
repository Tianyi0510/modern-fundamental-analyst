import { PageHero } from "@/components/page-hero";
import { appearance } from "./contact-page-content.styles";
import { Container } from "@/components/container";
import { SubscribeForm } from "@/features/subscriptions/subscribe-form";
import { ContactForm } from "@/features/contact/contact-form";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    label: "Contact",
    subscribe: "Subscribe",
    subscribeIntro:
      "Receive new investment research and website updates by email. Confirm your subscription in your inbox.",
    title: ["Connect Through Research,", "Ideas, and Opportunities."],
    intro:
      "Reach out to discuss investment research, financial modeling, business opportunities, or ideas that empower retail investors.",
  },
  "zh-tw": {
    label: "聯絡",
    subscribe: "訂閱",
    subscribeIntro: "透過電子郵件接收最新投資研究與網站更新。請在收到郵件後確認訂閱。",
    title: ["透過研究、觀點與機會", "建立連結。"],
    intro: "歡迎聯絡我，交流投資研究、財務建模、商業機會，或能幫助個人投資者的想法。",
  },
  "zh-cn": {
    label: "联系",
    subscribe: "订阅",
    subscribeIntro: "通过电子邮件接收最新投资研究与网站更新。请在收到邮件后确认订阅。",
    title: ["通过研究、观点与机会", "建立联系。"],
    intro: "欢迎联系我，交流投资研究、财务建模、商业机会，或能够帮助个人投资者的想法。",
  },
} as const;

export function ContactPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <div className="contact-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="standard"
          label={<>{text.label}</>}
          title={
            <>
              {text.title[0]}
              <br />
              <em>{text.title[1]}</em>
            </>
          }
          intro={
            <>
              <p className={appearance["contact-note"]}>{text.intro}</p>
            </>
          }
        />
        <Container>
          <SubscribeForm
            locale={locale}
            variant="standard"
            id="contact-subscribe"
            title={text.subscribe}
            intro={text.subscribeIntro}
          />
        </Container>
        <ContactForm locale={locale} />
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
