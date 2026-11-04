import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { meetups, registrations } from "@/db/schema";
import { register } from "@/lib/actions";
import { dateTimeFr } from "@/lib/format";
import { bodyToHtml } from "@/lib/richtext";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function Meetup({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const q = await searchParams;
  if (!Number.isInteger(id)) notFound();
  const db = getDb();
  const [m] = await db.select().from(meetups).where(eq(meetups.id, id));
  if (!m) notFound();
  const people = await db.select({ name: registrations.name }).from(registrations)
    .where(eq(registrations.meetupId, id)).orderBy(asc(registrations.createdAt));
  const full = people.length >= m.capacity;
  return (
    <div className="wrap split">
      <div className="prose">
        <Link href="/rencontres" className="back">← Toutes les rencontres</Link>
        <h1>{m.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: bodyToHtml(m.description) }} />
      </div>
      <aside className="side">
        <div className="row"><small>Date</small><b>{dateTimeFr(m.startsAt)}</b></div>
        <div className="row"><small>Lieu</small><b>{m.location}</b></div>
        <div className="row"><small>Places</small><b>{people.length} inscrits sur {m.capacity}</b></div>
        <form id="inscription" action={register} style={{ marginTop: 20 }}>
          <input type="hidden" name="meetupId" value={m.id} />
          {q.ok && <div className="notice">Inscription enregistrée. À bientôt !</div>}
          {q.deja && <div className="notice">Cet e-mail est déjà inscrit.</div>}
          {q.complet && <div className="notice err">Cette rencontre est complète.</div>}
          {q.erreur && <div className="notice err">Indiquez votre prénom et un e-mail valide.</div>}
          <label className="field">Prénom<input name="name" maxLength={80} required /></label>
          <label className="field">E-mail (non affiché)<input name="email" type="email" required /></label>
          <button className="btn" type="submit" disabled={full} style={{ width: "100%" }}>
            {full ? "Complet" : "Je participe"}
          </button>
        </form>
        <h2 style={{ fontSize: 20, marginTop: 24 }}>Participants</h2>
        <ul className="people">
          {people.map((p, i) => (
            <li key={i}><span className="avatar">{p.name.slice(0, 1).toUpperCase()}</span>{p.name}</li>
          ))}
          {people.length === 0 && <li className="meta">Soyez la première personne inscrite.</li>}
        </ul>
      </aside>
    </div>
  );
}
