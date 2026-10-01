import { ContactEmail } from "../src/features/contact/contact-email";
export default function Preview() {
  return (
    <ContactEmail
      locale="zh-tw"
      name="範例讀者"
      email="reader@example.com"
      subject="研究問題"
      message={"謝謝你的分析。\n你如何評估長期成長？"}
    />
  );
}
