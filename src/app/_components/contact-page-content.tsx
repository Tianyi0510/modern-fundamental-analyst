import { ResponsiveHeadingBreak } from "@/components/heading-phrases";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./contact-page-content.styles";
import { Container } from "@/components/container";
import { SubscribeForm } from "@/features/subscriptions/subscribe-form";
import { ContactForm } from "@/features/contact/contact-form";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    subscribe: "Subscribe",
    subscribeIntro:
      "Receive new investment research and website updates by email. Confirm your subscription in your inbox.",
    title: ["Let’s talk about", "investing"],
    intro:
      "Have a question about my research, a financial model to discuss, or an idea for working together? I’d like to hear from you.",
  },
  "zh-tw": {
    subscribe: "訂閱",
    subscribeIntro: "訂閱後，新的投資研究和網站消息會寄到你的信箱。請先開啟確認信，完成訂閱。",
    title: ["來聊聊", "投資"],
    intro: "對我的研究有疑問、想討論財務模型，或有合作的想法？歡迎寫信給我。",
  },
  "zh-cn": {
    subscribe: "订阅",
    subscribeIntro: "订阅后，新的投资研究和网站消息会发到你的邮箱。请先打开确认邮件，完成订阅。",
    title: ["来聊聊", "投资"],
    intro: "对我的研究有疑问、想讨论财务模型，或有合作的想法？欢迎给我留言。",
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
          title={
            <>
              {text.title[0]}
              <ResponsiveHeadingBreak locale={locale} />
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
