import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { dateFr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog" };

export default async function Blog() {
  const list = await getDb().select().from(posts).orderBy(desc(posts.publishedAt));
  return (
    <div className="wrap sec">
      <h1 className="title">Blog</h1>
      {list.length === 0 && <p className="empty">Aucun article pour le moment.</p>}
      <div className="grid3">
        {list.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="card">
            <h3>{p.title}</h3>
            <div className="meta">{dateFr(p.publishedAt)}</div>
            {p.excerpt && <p>{p.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
