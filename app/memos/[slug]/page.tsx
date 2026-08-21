import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memos } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return memos.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const memo = memos.find((item) => item.slug === slug);
  if (!memo) return {};
  return { title: memo.title, description: memo.summary, openGraph: { title: memo.title, description: memo.summary, images: [] }, twitter: { title: memo.title, description: memo.summary, images: [] } };
}

export default async function MemoPage({ params }: Props) {
  const { slug } = await params;
  const memo = memos.find((item) => item.slug === slug);
  if (!memo) notFound();
  return <main><SiteHeader counterpartPath={`/zh-tw/memos/${slug}`} />
    <article className="memo-article shell"><Link className="back-link" href="/memos">← All memos</Link><p className="eyebrow"><span /> {memo.tag}</p><h1>{memo.title}</h1><div className="article-meta"><span>{memo.date}</span><span>{memo.readTime}</span><span>Memo {memo.number}</span></div>
      <p className="article-lead">{memo.summary}</p>
      <div className="article-body"><h2>The central question</h2><p>What structural advantage allows a business to create more customer value while retaining attractive economics over a full cycle?</p><p>This initial memo page demonstrates the publishing format. Final research will be synchronized from the approved Google Docs source before launch.</p><blockquote>Good investment work makes the assumptions visible before the outcome is known.</blockquote><h2>What to monitor</h2><p>Track unit economics, customer retention, reinvestment returns, competitive response, and management&apos;s allocation of incremental cash.</p></div>
    </article><SiteFooter /></main>;
}
