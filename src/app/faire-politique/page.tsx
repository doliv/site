import Link from "next/link";
import { html } from "@/content/faire-politique";

export const metadata = { title: "Faire politique différemment" };

export default function Page() {
  return (
    <article className="narrow prose">
      <Link href="/" className="back">← Retour à l’accueil</Link>
      <h1>Faire politique différemment</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
