import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./brand-logo.module.css";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  if (inverse)
    return (
      <Image
        src="/logo-wordmark-inverse.svg"
        alt="Modern Fundamental Analyst."
        width={1098}
        height={80}
        className="block h-auto w-full"
        unoptimized
      />
    );
  return (
    <span className="block w-full">
      <Image
        src="/logo-wordmark.svg"
        alt="Modern Fundamental Analyst."
        width={1098}
        height={80}
        className={cn("block h-auto w-full", styles.light)}
        unoptimized
      />
      <Image
        src="/logo-wordmark-inverse.svg"
        alt="Modern Fundamental Analyst."
        width={1098}
        height={80}
        className={cn("block h-auto w-full", styles.dark)}
        unoptimized
      />
    </span>
  );
}
