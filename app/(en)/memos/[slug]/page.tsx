import type { Metadata } from "next";
import { MemoDetailPage } from "@/components/memo-detail-page";
import { getMemoStaticParams } from "@/data/memos";
import { createMemoPageMetadata } from "@/lib/memo-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return getMemoStaticParams(); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return createMemoPageMetadata((await params).slug, "en");
}

export default async function MemoPage({ params }: Props) {
  return <MemoDetailPage locale="en" slug={(await params).slug} />;
}
