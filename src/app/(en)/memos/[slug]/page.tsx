import type { Metadata } from "next";
import { MemoDetailPage } from "@/app/_components/memo-detail-page";
import { getMemoStaticParams } from "@/features/memos/memos";
import { createMemoPageMetadata } from "@/features/memos/memo-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getMemoStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return createMemoPageMetadata((await params).slug, "en");
}

export default async function MemoPage({ params }: Props) {
  return <MemoDetailPage locale="en" slug={(await params).slug} />;
}
