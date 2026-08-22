import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoArticleContent } from "@/components/memo-article-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memoContentByLocale } from "@/data/memo-content";
import { memosZhCn } from "@/data/site-zh-cn";
import { formatDate } from "@/lib/format";
import { createPageMetadata } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return memosZhCn.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const memo = memosZhCn.find((item) => item.slug === slug);
  if (!memo) return {};
  return createPageMetadata({ title: memo.title, description: memo.summary, path: `/memos/${slug}`, locale: "zh-cn" });
}

export default async function MemoPageZhCn({ params }: Props) {
  const { slug } = await params;
  const memo = memosZhCn.find((item) => item.slug === slug);
  if (!memo) notFound();
  return <main className="memo-detail-page"><SiteHeader locale="zh-cn" />
    <article className="memo-article shell"><Link className="back-link" href="/zh-cn/memos">← 所有投资备忘录</Link><p className="eyebrow"><span /> {memo.tag}</p><h1>{memo.title}</h1><div className="article-meta"><span>{formatDate(memo.publishedAt, "zh-cn")}</span><span>{memo.readTime}</span><span>投资备忘录 {memo.number}</span></div>
      <p className="article-lead">{memo.summary}</p>
      <MemoArticleContent content={memoContentByLocale["zh-cn"]} />
    </article><SiteFooter locale="zh-cn" /></main>;
}
