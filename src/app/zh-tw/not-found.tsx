import { appearance } from "./not-found.styles";
import { ButtonLink } from "@/components/button-link";

export default function NotFoundZhTw() {
  return (
    <main className={appearance["not-found"]} id="main-content" tabIndex={-1}>
      <span>404</span>
      <h1>找不到此頁面。</h1>
      <ButtonLink href="/zh-tw">返回首頁</ButtonLink>
    </main>
  );
}
