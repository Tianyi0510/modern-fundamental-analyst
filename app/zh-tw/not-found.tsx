import Link from "next/link";

export default function NotFoundZhTw() {
  return <main className="not-found"><span>404</span><h1>找不到此頁面。</h1><Link className="button button-dark" href="/zh-tw">返回首頁</Link></main>;
}
