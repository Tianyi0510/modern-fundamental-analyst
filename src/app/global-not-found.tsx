import { headers } from "next/headers";
import { SiteDocument } from "@/components/site-document";
import EnglishNotFound from "./(en)/not-found";
import TraditionalChineseNotFound from "./zh-tw/not-found";
import SimplifiedChineseNotFound from "./zh-cn/not-found";
import "./globals.css";

export const metadata = { title: "404 | Modern Fundamental Analyst" };

export default async function GlobalNotFound() {
  const locale = (await headers()).get("x-site-locale");
  if (locale === "zh-tw") {
    return (
      <SiteDocument language="zh-Hant-TW">
        <TraditionalChineseNotFound />
      </SiteDocument>
    );
  }
  if (locale === "zh-cn") {
    return (
      <SiteDocument language="zh-CN">
        <SimplifiedChineseNotFound />
      </SiteDocument>
    );
  }
  return (
    <SiteDocument language="en">
      <EnglishNotFound />
    </SiteDocument>
  );
}
