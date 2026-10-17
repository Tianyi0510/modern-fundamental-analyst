import Image from "next/image";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Image
      src={inverse ? "/logo-wordmark-inverse.svg" : "/logo-wordmark.svg"}
      alt="Modern Fundamental Analyst."
      width={1098}
      height={80}
      className="block h-auto w-full"
      unoptimized
    />
  );
}
