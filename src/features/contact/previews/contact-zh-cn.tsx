import { ContactEmail } from "../contact-email";
export default function Preview() {
  return (
    <ContactEmail
      locale="zh-cn"
      name="示例读者"
      email="reader@example.com"
      subject="研究问题"
      message={"谢谢你的分析。\n你如何评估长期增长？"}
    />
  );
}
