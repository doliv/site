import Link from "next/link";
import { asc, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { meetups } from "@/db/schema";
import { dateTimeFr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rencontres" };

export default async function Meetups() {
  const list = await getDb().select().from(meetups).where(gte(meetups.startsAt, new Date())).orderBy(asc(meetups.startsAt));
  return (
    <div className="wrap sec">
      <h1 className="title">Rencontres</h1>
      {list.length === 0 && <p className="empty">Aucune rencontre prévue pour le moment.</p>}
      <div className="grid3">
        {list.map((m) => (
          <Link key={m.id} href={`/rencontres/${m.id}`} className="card">
            <div className="when">{dateTimeFr(m.startsAt)}</div>
            <h3>{m.title}</h3>
            <div className="meta">{m.location}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
