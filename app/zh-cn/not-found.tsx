import Link from "next/link";

export default function NotFoundZhCn() {
  return <main className="not-found" id="main-content"><span>404</span><h1>找不到此页面。</h1><Link className="button button-dark" href="/zh-cn">返回首页</Link></main>;
}
