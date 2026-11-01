import Link from "next/link";
import { NAV, SITE_NAME } from "@/lib/content";

export default function Header() {
  return (
    <header className="site">
      <div className="wrap">
        <Link href="/" className="logo">{SITE_NAME}</Link>
        <nav className="nav" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
