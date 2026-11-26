import { getHoldingParams, HoldingPage, holdingMetadata } from "@/app/_components/holding-page";

export const dynamicParams = false;

type Props = { params: Promise<{ symbol: string }> };

export function generateStaticParams() {
  return getHoldingParams();
}

export async function generateMetadata({ params }: Props) {
  return holdingMetadata("zh-tw", (await params).symbol);
}

export default async function Page({ params }: Props) {
  return <HoldingPage locale="zh-tw" slug={(await params).symbol} />;
}
