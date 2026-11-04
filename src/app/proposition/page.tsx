import Link from "next/link";
import { getPageHtml } from "@/lib/pages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Une nouvelle proposition" };

export default async function Page() {
  const html = await getPageHtml("proposition");
  return (
    <article className="narrow prose">
      <Link href="/" className="back">← Retour à l’accueil</Link>
      <h1>Une nouvelle proposition</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
