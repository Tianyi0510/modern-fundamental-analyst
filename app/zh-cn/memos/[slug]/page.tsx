import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
      <div className="article-body"><h2>核心问题</h2><p>什么样的结构性优势，能够让企业在完整经济周期中创造更多客户价值，同时维持具有吸引力的经济效益？</p><p>此初版页面用于展示投资备忘录的发布格式；正式研究将在发布前从核准的 Google Docs 来源同步。</p><blockquote>好的投资研究，会在结果揭晓之前，先让假设清楚可见。</blockquote><h2>持续跟踪</h2><p>跟踪单位经济、客户留存、再投资回报、竞争反应，以及管理层对新增现金的配置方式。</p></div>
    </article><SiteFooter locale="zh-cn" /></main>;
}
