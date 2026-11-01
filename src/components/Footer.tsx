import Link from "next/link";
import { SITE_NAME } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <span>{SITE_NAME} · [Mentions légales]</span>
        <span>Contact · <Link href="/admin">Administration</Link></span>
      </div>
    </footer>
  );
}
