import Link from "next/link";
import { asc, desc, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { meetups, posts } from "@/db/schema";
import { GROUPS, INTRO } from "@/lib/content";
import { dateFr, dateTimeFr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = getDb();
  const [latest, next] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.publishedAt)).limit(3),
    db.select().from(meetups).where(gte(meetups.startsAt, new Date())).orderBy(asc(meetups.startsAt)).limit(3),
  ]);
  return (
    <>
      <div className="wrap"><p className="intro">{INTRO}</p></div>
      <div className="band">
        <div className="wrap groups">
          {GROUPS.map((g) => (
            <Link key={g.href} href={g.href} className="group">
              <div className="clamp">{g.text}</div>
              <span className="more">Lire la suite →</span>
            </Link>
          ))}
        </div>
      </div>
      <section className="wrap sec">
        <h2>Derniers articles</h2>
        {latest.length === 0 && <p className="empty">Aucun article pour le moment.</p>}
        <div className="grid3">
          {latest.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card">
              <h3>{p.title}</h3>
              <div className="meta">{dateFr(p.publishedAt)}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="wrap sec">
        <h2>Prochaines rencontres</h2>
        {next.length === 0 && <p className="empty">Aucune rencontre prévue pour le moment.</p>}
        <div className="grid3">
          {next.map((m) => (
            <Link key={m.id} href={`/rencontres/${m.id}`} className="card">
              <div className="when">{dateTimeFr(m.startsAt)}</div>
              <h3>{m.title}</h3>
              <div className="meta">{m.location}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
