import { appearance } from "./not-found.styles";
import { ButtonLink } from "@/components/button-link";

export default function NotFoundZhCn() {
  return (
    <main className={appearance["not-found"]} id="main-content" tabIndex={-1}>
      <span>404</span>
      <h1>找不到此页面。</h1>
      <ButtonLink href="/zh-cn">返回首页</ButtonLink>
    </main>
  );
}
