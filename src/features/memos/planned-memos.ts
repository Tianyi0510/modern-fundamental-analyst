import type { Locale } from "@/lib/i18n";

// Planned titles are not published catalog entries, routes or subscription content.
const plannedMemos = [
  {
    id: "ai-software",
    title: { en: "Will AI Kill Software?", "zh-tw": "AI 會取代軟體嗎？", "zh-cn": "AI 会取代软件吗？" },
  },
  {
    id: "agentic-finance-stablecoins",
    title: { en: "Agentic Finance and Stablecoins", "zh-tw": "AI 代理金融與穩定幣", "zh-cn": "AI 代理金融与稳定币" },
  },
] as const;

export function getPlannedMemos(locale: Locale) {
  return plannedMemos.map(({ id, title }) => ({ id, title: title[locale] }));
}

const plannedCopy = {
  en: {
    status: "Planned",
    summary: "Planned research article. The full text is not yet available on this website.",
    availability: "Coming soon",
  },
  "zh-tw": {
    status: "規劃中",
    summary: "規劃中的研究文章，全文尚未於本網站發布。",
    availability: "即將推出",
  },
  "zh-cn": {
    status: "规划中",
    summary: "规划中的研究文章，全文尚未在本网站发布。",
    availability: "即将推出",
  },
} as const;

export function getPlannedMemoCopy(locale: Locale) {
  return plannedCopy[locale];
}
