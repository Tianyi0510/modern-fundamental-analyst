import { Fragment } from "react";
import { Hr, render, Text } from "react-email";
import { EmailButton, EmailLayout } from "@/components/email-layout";
import { resolveLocale } from "@/lib/i18n";

export type ContactMessage = { name: string; email: string; subject: string; message: string; locale: string };
const copy = {
  en: {
    heading: "New Website Message",
    name: "Name",
    email: "Email",
    language: "Language",
    subject: "Subject",
    reply: "Reply to sender",
  },
  "zh-tw": {
    heading: "新的網站訊息",
    name: "姓名",
    email: "電子郵件",
    language: "語言",
    subject: "主題",
    reply: "回覆寄件者",
  },
  "zh-cn": {
    heading: "新的网站消息",
    name: "姓名",
    email: "电子邮件",
    language: "语言",
    subject: "主题",
    reply: "回复发件人",
  },
};
export function ContactEmail({ name, email, subject, message, locale }: ContactMessage) {
  const language = resolveLocale(locale);
  const labels = copy[language];
  return (
    <EmailLayout locale={language} heading={labels.heading}>
      <Text>
        <strong>{labels.name}:</strong> {name}
      </Text>
      <Text>
        <strong>{labels.email}:</strong> {email}
      </Text>
      <Text>
        <strong>{labels.language}:</strong> {locale || "unknown"}
      </Text>
      <Text>
        <strong>{labels.subject}:</strong> {subject}
      </Text>
      <Hr style={{ borderStyle: "solid" }} />
      <Text style={{ fontSize: "17px", lineHeight: "28px" }}>
        {message.split("\n").map((line, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </Text>
      <EmailButton href={`mailto:${encodeURIComponent(email)}`}>{labels.reply}</EmailButton>
    </EmailLayout>
  );
}
export function renderContactEmail(message: ContactMessage) {
  return render(<ContactEmail {...message} />);
}
