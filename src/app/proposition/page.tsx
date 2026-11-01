import Link from "next/link";
import { html } from "@/content/proposition";

export const metadata = { title: "Une nouvelle proposition" };

export default function Page() {
  return (
    <article className="narrow prose">
      <Link href="/" className="back">← Retour à l’accueil</Link>
      <h1>Une nouvelle proposition</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
