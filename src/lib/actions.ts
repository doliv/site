"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { comments, posts, meetups, pages, registrations } from "@/db/schema";
import { isAdmin, passwordOk, setSession, clearSession } from "@/lib/auth";
import { parisToDate, slugify } from "@/lib/format";
import { cleanHtml } from "@/lib/richtext";
import { PAGES } from "@/lib/pages";

// Nettoie le HTML, puis renvoie "" s'il ne reste aucun texte (ex. "<p></p>").
// Pas de .slice() sur du HTML : couper au milieu d'une balise casserait la page.
const html = (f: FormData, k: string): string => {
  const clean = cleanHtml(String(f.get(k) ?? "")).trim();
  return clean.replace(/<[^>]*>|&nbsp;/g, "").trim() ? clean : "";
};
const HTML_MAX = 100_000;

const str = (f: FormData, k: string, max: number) =>
  String(f.get(k) ?? "")
    .trim()
    .slice(0, max);
async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function addComment(f: FormData) {
  const postId = Number(f.get("postId"));
  const slug = encodeURIComponent(str(f, "slug", 200));
  const author = str(f, "author", 80);
  const body = str(f, "body", 2000);
  if (!postId || !author || !body)
    redirect(`/blog/${slug}?erreur=1#commentaires`);
  await getDb().insert(comments).values({ postId, author, body }); // status = "pending"
  redirect(`/blog/${slug}?envoye=1#commentaires`);
}

export async function register(f: FormData) {
  const meetupId = Number(f.get("meetupId"));
  const name = str(f, "name", 80);
  const email = str(f, "email", 200).toLowerCase();
  const back = (q: string): never =>
    redirect(`/rencontres/${meetupId}?${q}#inscription`);
  if (!meetupId || !name || !/^\S+@\S+\.\S+$/.test(email)) back("erreur=1");
  const db = getDb();
  const [m] = await db.select().from(meetups).where(eq(meetups.id, meetupId));
  if (!m) redirect("/rencontres");
  const taken = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.meetupId, meetupId));
  if (taken.length >= m.capacity) back("complet=1");
  const r = await db
    .insert(registrations)
    .values({ meetupId, name, email })
    .onConflictDoNothing()
    .returning({ id: registrations.id });
  back(r.length ? "ok=1" : "deja=1");
}

export async function login(f: FormData) {
  if (!passwordOk(str(f, "password", 200))) redirect("/admin/login?erreur=1");
  await setSession();
  redirect("/admin");
}
export async function logout() {
  await clearSession();
  redirect("/");
}

export async function moderate(f: FormData) {
  await guard();
  const id = Number(f.get("id"));
  const db = getDb();
  if (f.get("do") === "approve")
    await db
      .update(comments)
      .set({ status: "approved" })
      .where(eq(comments.id, id));
  else await db.delete(comments).where(eq(comments.id, id));
  revalidatePath("/admin");
}

export async function createPost(f: FormData) {
  await guard();
  const title = str(f, "title", 200);
  const body = html(f, "body");
  if (!title || !body || body.length > HTML_MAX)
    redirect("/admin?erreur=article");
  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
  await getDb()
    .insert(posts)
    .values({ slug, title, excerpt: str(f, "excerpt", 300), body });
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin?ok=article");
}

export async function updatePost(f: FormData) {
  await guard();
  const id = Number(f.get("id"));
  const title = str(f, "title", 200);
  const body = html(f, "body");
  if (!id || !title || !body || body.length > HTML_MAX) redirect("/admin?erreur=article");
  // Le slug (l'adresse de l'article) ne change pas : les liens existants restent valides.
  await getDb().update(posts).set({ title, excerpt: str(f, "excerpt", 300), body }).where(eq(posts.id, id));
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin?ok=article");
}

export async function createMeetup(f: FormData) {
  await guard();
  const title = str(f, "title", 200);
  const location = str(f, "location", 200);
  const when = str(f, "startsAt", 20);
  const capacity = Math.max(1, Number(f.get("capacity")) || 20);
  const description = html(f, "description");
  if (!title || !location || !when || description.length > HTML_MAX)
    redirect("/admin?erreur=rencontre");
  await getDb()
    .insert(meetups)
    .values({
      title,
      location,
      startsAt: parisToDate(when),
      capacity,
      description,
    });
  revalidatePath("/admin");
  revalidatePath("/rencontres");
  redirect("/admin?ok=rencontre");
}

export async function updateMeetup(f: FormData) {
  await guard();
  const id = Number(f.get("id"));
  const title = str(f, "title", 200);
  const location = str(f, "location", 200);
  const when = str(f, "startsAt", 20);
  const capacity = Math.max(1, Number(f.get("capacity")) || 20);
  const description = html(f, "description");
  if (!id || !title || !location || !when || description.length > HTML_MAX) redirect("/admin?erreur=rencontre");
  const db = getDb();
  const taken = await db.select({ id: registrations.id }).from(registrations).where(eq(registrations.meetupId, id));
  if (capacity < taken.length) redirect("/admin?erreur=capacite");
  await db.update(meetups).set({ title, location, startsAt: parisToDate(when), capacity, description }).where(eq(meetups.id, id));
  revalidatePath("/admin");
  revalidatePath("/rencontres");
  redirect("/admin?ok=rencontre");
}

export async function deleteItem(f: FormData) {
  await guard();
  const id = Number(f.get("id"));
  const db = getDb();
  if (f.get("kind") === "post") await db.delete(posts).where(eq(posts.id, id));
  else await db.delete(meetups).where(eq(meetups.id, id));
  revalidatePath("/admin");
}

export async function savePage(f: FormData) {
  await guard();
  const slug = str(f, "slug", 50);
  const body = html(f, "body");
  if (!Object.hasOwn(PAGES, slug) || !body || body.length > HTML_MAX) redirect("/admin?erreur=page");
  await getDb()
    .insert(pages)
    .values({ slug, body })
    .onConflictDoUpdate({ target: pages.slug, set: { body, updatedAt: new Date() } });
  revalidatePath("/admin");
  redirect("/admin?ok=page");
}

// Supprime la version modifiée : la page retrouve son texte d'origine.
export async function resetPage(f: FormData) {
  await guard();
  const slug = str(f, "slug", 50);
  if (Object.hasOwn(PAGES, slug)) await getDb().delete(pages).where(eq(pages.slug, slug));
  revalidatePath("/admin");
  redirect("/admin?ok=page");
}
