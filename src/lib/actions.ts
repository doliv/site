"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { comments, posts, meetups, registrations } from "@/db/schema";
import { isAdmin, passwordOk, setSession, clearSession } from "@/lib/auth";
import { parisToDate, slugify } from "@/lib/format";

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function addComment(f: FormData) {
  const postId = Number(f.get("postId"));
  const slug = encodeURIComponent(str(f, "slug", 200));
  const author = str(f, "author", 80);
  const body = str(f, "body", 2000);
  if (!postId || !author || !body) redirect(`/blog/${slug}?erreur=1#commentaires`);
  await getDb().insert(comments).values({ postId, author, body }); // status = "pending"
  redirect(`/blog/${slug}?envoye=1#commentaires`);
}

export async function register(f: FormData) {
  const meetupId = Number(f.get("meetupId"));
  const name = str(f, "name", 80);
  const email = str(f, "email", 200).toLowerCase();
  const back = (q: string): never => redirect(`/rencontres/${meetupId}?${q}#inscription`);
  if (!meetupId || !name || !/^\S+@\S+\.\S+$/.test(email)) back("erreur=1");
  const db = getDb();
  const [m] = await db.select().from(meetups).where(eq(meetups.id, meetupId));
  if (!m) redirect("/rencontres");
  const taken = await db.select({ id: registrations.id }).from(registrations).where(eq(registrations.meetupId, meetupId));
  if (taken.length >= m.capacity) back("complet=1");
  const r = await db.insert(registrations).values({ meetupId, name, email }).onConflictDoNothing().returning({ id: registrations.id });
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
  if (f.get("do") === "approve") await db.update(comments).set({ status: "approved" }).where(eq(comments.id, id));
  else await db.delete(comments).where(eq(comments.id, id));
  revalidatePath("/admin");
}

export async function createPost(f: FormData) {
  await guard();
  const title = str(f, "title", 200);
  const body = str(f, "body", 20000);
  if (!title || !body) redirect("/admin?erreur=article");
  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
  await getDb().insert(posts).values({ slug, title, excerpt: str(f, "excerpt", 300), body });
  revalidatePath("/admin");
  redirect("/admin?ok=article");
}

export async function createMeetup(f: FormData) {
  await guard();
  const title = str(f, "title", 200);
  const location = str(f, "location", 200);
  const when = str(f, "startsAt", 20);
  const capacity = Math.max(1, Number(f.get("capacity")) || 20);
  if (!title || !location || !when) redirect("/admin?erreur=rencontre");
  await getDb().insert(meetups).values({ title, location, startsAt: parisToDate(when), capacity, description: str(f, "description", 5000) });
  revalidatePath("/admin");
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
