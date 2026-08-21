import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Modern Fundamental Analyst｜繁體中文",
  },
  description: "獨立公開市場股票研究、投資組合、績效紀錄與投資備忘錄。",
  alternates: {
    canonical: "/zh-tw",
    languages: { en: "/", "zh-Hant-TW": "/zh-tw" },
  },
};

export default function TraditionalChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div lang="zh-Hant-TW">{children}</div>;
}
