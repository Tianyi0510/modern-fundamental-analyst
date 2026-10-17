import type { Locale } from "@/lib/i18n";

export const preferenceEmailCopy = {
  en: {
    subject: "Manage your email preferences",
    heading: "Manage your email preferences",
    body: "Change your language or unsubscribe with your secure link.",
    action: "Manage email preferences",
    note: "If you did not request this email, you can ignore it.",
  },
  "zh-tw": {
    subject: "管理你的郵件偏好",
    heading: "管理你的郵件偏好",
    body: "選擇「管理郵件偏好」，即可變更語言或取消訂閱。",
    action: "管理郵件偏好",
    note: "如果你沒有提出此要求，可以忽略這封郵件。",
  },
  "zh-cn": {
    subject: "管理你的邮件偏好",
    heading: "管理你的邮件偏好",
    body: "选择“管理邮件偏好”，即可更改语言或取消订阅。",
    action: "管理邮件偏好",
    note: "如果你没有提出此请求，可以忽略这封邮件。",
  },
} satisfies Record<Locale, { subject: string; heading: string; body: string; action: string; note: string }>;
