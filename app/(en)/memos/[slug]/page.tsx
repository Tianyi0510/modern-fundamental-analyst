import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoArticleContent } from "@/components/memo-article-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memoContentByLocale } from "@/data/memo-content";
import { memos } from "@/data/site";
import { createPageMetadata } from "@/lib/site-config";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return memos.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const memo = memos.find((item) => item.slug === slug);
  if (!memo) return {};
  return createPageMetadata({ title: memo.title, description: memo.summary, path: `/memos/${slug}` });
}

export default async function MemoPage({ params }: Props) {
  const { slug } = await params;
  const memo = memos.find((item) => item.slug === slug);
  if (!memo) notFound();
  return <main className="memo-detail-page"><SiteHeader />
    <article className="memo-article shell"><Link className="back-link" href="/memos">← All Investment Memos</Link><p className="eyebrow"><span /> {memo.tag}</p><h1>{memo.title}</h1><div className="article-meta"><span>{formatDate(memo.publishedAt, "en", true)}</span><span>{memo.readTime}</span><span>Investment Memo {memo.number}</span></div>
      <p className="article-lead">{memo.summary}</p>
      <MemoArticleContent content={memoContentByLocale.en} />
    </article><SiteFooter /></main>;
}
