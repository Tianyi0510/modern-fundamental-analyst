import type { Locale } from "@/lib/i18n";

export type NavigationCopy = {
  home: string;
  about: string;
  portfolio: string;
  performance: string;
  memos: string;
  contact: string;
  open: string;
  close: string;
  change: string;
  primary: string;
  mobilePrimary: string;
  siteMenu: string;
  menu: string;
};

const navigationCopy = {
  en: { home: "Home", about: "About", portfolio: "Portfolio", performance: "Performance", memos: "Investment Memos", contact: "Contact", open: "Open menu", close: "Close menu", change: "Change language", primary: "Primary navigation", mobilePrimary: "Mobile primary navigation", siteMenu: "Site menu", menu: "Menu" },
  "zh-tw": { home: "首頁", about: "關於", portfolio: "投資組合", performance: "績效", memos: "投資備忘錄", contact: "聯絡", open: "開啟目錄", close: "關閉目錄", change: "切換語言", primary: "主要導覽", mobilePrimary: "手機版主要導覽", siteMenu: "網站目錄", menu: "目錄" },
  "zh-cn": { home: "首页", about: "关于", portfolio: "投资组合", performance: "业绩", memos: "投资备忘录", contact: "联系", open: "打开目录", close: "关闭目录", change: "切换语言", primary: "主要导航", mobilePrimary: "手机版主要导航", siteMenu: "网站目录", menu: "目录" },
} satisfies Record<Locale, NavigationCopy>;

export function getNavigationCopy(locale: Locale) {
  return navigationCopy[locale];
}
