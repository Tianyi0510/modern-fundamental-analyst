import { getHoldingParams, HoldingPage, holdingMetadata } from "@/app/_components/holding-page";

export const dynamicParams = false;

type Props = { params: Promise<{ symbol: string }> };

export function generateStaticParams() {
  return getHoldingParams();
}

export async function generateMetadata({ params }: Props) {
  return holdingMetadata("en", (await params).symbol);
}

export default async function Page({ params }: Props) {
  return <HoldingPage locale="en" slug={(await params).symbol} />;
}
