import type { Metadata } from "next";
import { MemoDetailPage } from "@/app/_components/memo-detail-page";
import { getMemoStaticParams } from "@/features/memos/data/memos";
import { createMemoPageMetadata } from "@/features/memos/memo-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getMemoStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return createMemoPageMetadata((await params).slug, "zh-tw");
}

export default async function MemoPageZhTw({ params }: Props) {
  return <MemoDetailPage locale="zh-tw" slug={(await params).slug} />;
}
