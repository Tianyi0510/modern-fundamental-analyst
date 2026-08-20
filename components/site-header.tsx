import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" href="/" aria-label="Modern Fundamental Analyst home">
        Modern Fundamental Analyst<span>.</span>
      </Link>
      <div className="header-actions">
        <nav aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/performance">Performance</Link>
          <Link href="/memos">Memos</Link>
        </nav>
        <Link className="button button-dark button-small" href="/contact">
          Contact
        </Link>
      </div>
    </header>
  );
}
