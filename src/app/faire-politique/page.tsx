import Link from "next/link";
import { getPageHtml } from "@/lib/pages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Faire politique différemment" };

export default async function Page() {
  const html = await getPageHtml("faire-politique");
  return (
    <article className="narrow prose">
      <Link href="/" className="back">← Retour à l’accueil</Link>
      <h1>Faire politique différemment</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
