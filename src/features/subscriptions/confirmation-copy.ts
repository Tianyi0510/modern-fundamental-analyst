import type { Locale } from "@/lib/i18n";

export const confirmationCopy = {
  en: {
    subject: "Confirm your subscription",
    heading: "Confirm your subscription",
    body: "Confirm that you want to receive Modern Fundamental Analyst research updates. This link expires in 24 hours.",
    action: "Confirm subscription",
    note: "If you did not request this email, ignore it. Your subscription stays inactive unless you confirm.",
    busy: "Confirming…",
    success: "Your subscription is confirmed.",
    error: "Unable to confirm your subscription. Try again.",
  },
  "zh-tw": {
    subject: "確認你的訂閱",
    heading: "確認你的訂閱",
    body: "請確認你希望接收 Modern Fundamental Analyst 的研究更新。此連結將於 24 小時後到期。",
    action: "確認訂閱",
    note: "如果你沒有提出此要求，請忽略這封郵件。未經確認，訂閱不會啟用。",
    busy: "確認中…",
    success: "你的訂閱已確認。",
    error: "無法確認你的訂閱。請再試一次。",
  },
  "zh-cn": {
    subject: "确认你的订阅",
    heading: "确认你的订阅",
    body: "请确认你希望接收 Modern Fundamental Analyst 的研究更新。此链接将于 24 小时后到期。",
    action: "确认订阅",
    note: "如果你没有提出此请求，请忽略这封邮件。未经确认，订阅不会启用。",
    busy: "确认中…",
    success: "你的订阅已确认。",
    error: "无法确认你的订阅。请重试。",
  },
} satisfies Record<
  Locale,
  {
    subject: string;
    heading: string;
    body: string;
    action: string;
    note: string;
    busy: string;
    success: string;
    error: string;
  }
>;
