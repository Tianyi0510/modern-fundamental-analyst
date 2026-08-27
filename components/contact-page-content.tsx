import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    label: "Contact",
    title: ["Connect Through Research,", "Ideas, and Opportunities."],
    intro: "Reach out to discuss investment research, financial modeling, business opportunities, or ideas that empower retail investors.",
    cards: [
      ["Research", "Share feedback, challenge my assumptions, or discuss detailed investment theses, valuation methods, and portfolio decisions."],
      ["Business", "Contact me about internships, collaborations, tutoring, financial modeling projects, or other professional opportunities across finance."],
    ],
  },
  "zh-tw": {
    label: "聯絡",
    title: ["透過研究、觀點與機會", "建立連結。"],
    intro: "歡迎聯絡我，交流投資研究、財務建模、商業機會，或能幫助個人投資者的想法。",
    cards: [
      ["研究", "分享回饋、挑戰我的假設，或討論詳細的投資論點、估值方法與投資組合決策。"],
      ["商業", "歡迎就實習、合作、家教、財務建模專案，或其他金融領域的專業機會與我聯絡。"],
    ],
  },
  "zh-cn": {
    label: "联系",
    title: ["通过研究、观点与机会", "建立联系。"],
    intro: "欢迎联系我，交流投资研究、财务建模、商业机会，或能够帮助个人投资者的想法。",
    cards: [
      ["研究", "分享反馈、挑战我的假设，或讨论详细的投资论点、估值方法与投资组合决策。"],
      ["商业", "欢迎就实习、合作、家教、财务建模项目，或其他金融领域的专业机会与我联系。"],
    ],
  },
} as const;

export function ContactPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return <main className="contact-page" id="main-content">
    <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className="page-hero contact-hero shell">
      <p className="eyebrow"><span /> {text.label}</p>
      <h1>{text.title[0]}<br /><em>{text.title[1]}</em></h1>
      <p className="contact-note">{text.intro}</p>
    </section>
    <section className="contact-grid">
      {text.cards.map(([title, description]) => <article key={title}><header><h2>{title}</h2></header><p>{description}</p></article>)}
    </section>
    <ContactForm locale={locale} />
    <SiteFooter locale={locale} />
  </main>;
}
