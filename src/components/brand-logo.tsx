import { cn } from "@/lib/utils";
import styles from "./brand-logo.module.css";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={cn("brand-logo", styles.wordmark, inverse && styles.inverse)}>
      Modern Fundamental Analyst<span className={styles.period}>.</span>
    </span>
  );
}
