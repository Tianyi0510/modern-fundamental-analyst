import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoArticleContent } from "@/components/memo-article-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memoContentByLocale } from "@/data/memo-content";
import { memosZhTw } from "@/data/site-zh-tw";
import { createPageMetadata } from "@/lib/site-config";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return memosZhTw.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const memo = memosZhTw.find((item) => item.slug === slug);
  if (!memo) return {};
  return createPageMetadata({ title: memo.title, description: memo.summary, path: `/memos/${slug}`, locale: "zh-tw" });
}

export default async function MemoPageZhTw({ params }: Props) {
  const { slug } = await params;
  const memo = memosZhTw.find((item) => item.slug === slug);
  if (!memo) notFound();
  return <main className="memo-detail-page"><SiteHeader locale="zh-tw" />
    <article className="memo-article shell"><Link className="back-link" href="/zh-tw/memos">← 所有投資備忘錄</Link><p className="eyebrow"><span /> {memo.tag}</p><h1>{memo.title}</h1><div className="article-meta"><span>{formatDate(memo.publishedAt, "zh-tw")}</span><span>{memo.readTime}</span><span>投資備忘錄 {memo.number}</span></div>
      <p className="article-lead">{memo.summary}</p>
      <MemoArticleContent content={memoContentByLocale["zh-tw"]} />
    </article><SiteFooter locale="zh-tw" /></main>;
}
