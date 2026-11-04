import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages } from "@/db/schema";
import { cleanHtml } from "@/lib/richtext";
import { html as fairePolitique } from "@/content/faire-politique";
import { html as proposition } from "@/content/proposition";

// Texte d'origine (dans le code) de chaque page fixe.
export const PAGES = {
  "faire-politique": { title: "Faire politique différemment", fallback: fairePolitique },
  proposition: { title: "Une nouvelle proposition", fallback: proposition },
} as const;

export type PageSlug = keyof typeof PAGES;

/** Version modifiée depuis l'admin si elle existe, sinon texte d'origine. */
export async function getPageHtml(slug: PageSlug): Promise<string> {
  const [row] = await getDb().select().from(pages).where(eq(pages.slug, slug));
  return row ? cleanHtml(row.body) : PAGES[slug].fallback;
}
