import { redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { comments, meetups, posts, registrations } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { createMeetup, createPost, deleteItem, logout, moderate } from "@/lib/actions";
import { dateFr, dateTimeFr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administration", robots: { index: false } };

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const q = await searchParams;
  const db = getDb();
  const [pending, allPosts, allMeetups, regs] = await Promise.all([
    db.select({ id: comments.id, author: comments.author, body: comments.body, at: comments.createdAt, post: posts.title })
      .from(comments).innerJoin(posts, eq(comments.postId, posts.id)).where(eq(comments.status, "pending")).orderBy(asc(comments.createdAt)),
    db.select().from(posts).orderBy(desc(posts.publishedAt)),
    db.select().from(meetups).orderBy(desc(meetups.startsAt)),
    db.select().from(registrations).orderBy(asc(registrations.createdAt)),
  ]);
  return (
    <div className="wrap admin" style={{ paddingBottom: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 32 }}>
        <h1 className="title" style={{ margin: 0 }}>Administration</h1>
        <form action={logout}><button className="btn btn-ghost" type="submit">Se déconnecter</button></form>
      </div>
      {q.ok && <div className="notice">Enregistré.</div>}
      {q.erreur && <div className="notice err">Des champs obligatoires sont manquants.</div>}

      <h2>Commentaires à valider ({pending.length})</h2>
      {pending.length === 0 && <p className="empty">Aucun commentaire en attente.</p>}
      {pending.map((c) => (
        <div className="pending" key={c.id}>
          <b>{c.author}</b> <span className="meta">· sur « {c.post} » · {dateFr(c.at)}</span>
          <p style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
          <form action={moderate} className="actions">
            <input type="hidden" name="id" value={c.id} />
            <button className="btn" name="do" value="approve">Valider</button>
            <button className="btn btn-ghost" name="do" value="reject">Refuser</button>
          </form>
        </div>
      ))}

      <h2>Nouvel article</h2>
      <form action={createPost} className="box">
        <label className="field">Titre<input name="title" maxLength={200} required /></label>
        <label className="field">Résumé (facultatif)<input name="excerpt" maxLength={300} /></label>
        <label className="field">Texte (séparez les paragraphes par une ligne vide)<textarea name="body" rows={10} required /></label>
        <button className="btn" type="submit">Publier l’article</button>
      </form>
      {allPosts.map((p) => (
        <div className="item" key={p.id}>
          <div><b>{p.title}</b><div className="meta">{dateFr(p.publishedAt)}</div></div>
          <form action={deleteItem}><input type="hidden" name="kind" value="post" /><input type="hidden" name="id" value={p.id} />
            <button className="btn btn-ghost">Supprimer</button></form>
        </div>
      ))}

      <h2>Nouvelle rencontre</h2>
      <form action={createMeetup} className="box">
        <label className="field">Titre<input name="title" maxLength={200} required /></label>
        <label className="field">Date et heure (heure de Paris)<input name="startsAt" type="datetime-local" required /></label>
        <label className="field">Lieu<input name="location" maxLength={200} required /></label>
        <label className="field">Nombre de places<input name="capacity" type="number" min={1} defaultValue={20} /></label>
        <label className="field">Description<textarea name="description" rows={5} /></label>
        <button className="btn" type="submit">Créer la rencontre</button>
      </form>
      {allMeetups.map((m) => {
        const r = regs.filter((x) => x.meetupId === m.id);
        return (
          <div className="item" key={m.id}>
            <div>
              <b>{m.title}</b>
              <div className="meta">{dateTimeFr(m.startsAt)} · {m.location} · {r.length}/{m.capacity} inscrits</div>
              {r.length > 0 && <div className="meta">{r.map((x) => `${x.name} <${x.email}>`).join(", ")}</div>}
            </div>
            <form action={deleteItem}><input type="hidden" name="kind" value="meetup" /><input type="hidden" name="id" value={m.id} />
              <button className="btn btn-ghost">Supprimer</button></form>
          </div>
        );
      })}
    </div>
  );
}
