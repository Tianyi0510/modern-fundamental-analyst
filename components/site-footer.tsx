import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <Link className="wordmark footer-mark" href="/">Modern Fundamental Analyst<span>.</span></Link>
      <p>Independent research. Transparent thinking. Long-term orientation.</p>
      <div className="footer-links">
        <Link href="/contact">Contact</Link>
        <Link href="/disclaimer">Disclaimer</Link>
      </div>
      <small>© 2026 Modern Fundamental Analyst. All rights reserved.</small>
    </footer>
  );
}
