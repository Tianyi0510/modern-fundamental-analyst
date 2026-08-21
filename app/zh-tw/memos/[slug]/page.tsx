import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhTw } from "@/data/site-zh-tw";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return memosZhTw.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const memo = memosZhTw.find((item) => item.slug === slug);
  if (!memo) return {};
  return { title: { absolute: `${memo.title}｜Modern Fundamental Analyst` }, description: memo.summary, alternates: { canonical: `/zh-tw/memos/${slug}`, languages: { en: `/memos/${slug}`, "zh-Hant-TW": `/zh-tw/memos/${slug}` } } };
}

export default async function MemoPageZhTw({ params }: Props) {
  const { slug } = await params;
  const memo = memosZhTw.find((item) => item.slug === slug);
  if (!memo) notFound();
  return <main><SiteHeader locale="zh-tw" counterpartPath={`/memos/${slug}`} />
    <article className="memo-article shell"><Link className="back-link" href="/zh-tw/memos">← 所有投資備忘錄</Link><p className="eyebrow"><span /> {memo.tag}</p><h1>{memo.title}</h1><div className="article-meta"><span>{memo.date}</span><span>{memo.readTime}</span><span>投資備忘錄 {memo.number}</span></div>
      <p className="article-lead">{memo.summary}</p>
      <div className="article-body"><h2>核心問題</h2><p>什麼樣的結構性優勢，能讓企業在完整景氣循環中創造更多客戶價值，同時維持具吸引力的經濟效益？</p><p>此初版頁面用來展示投資備忘錄的出版格式；正式研究將於發布前，從核准的 Google Docs 來源同步。</p><blockquote>好的投資研究，會在結果揭曉之前，先讓假設清楚可見。</blockquote><h2>持續追蹤</h2><p>追蹤單位經濟、客戶留存、再投資報酬、競爭反應，以及管理層對新增現金的配置方式。</p></div>
    </article><SiteFooter locale="zh-tw" /></main>;
}
