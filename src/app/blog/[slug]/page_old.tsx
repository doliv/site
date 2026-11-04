import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { comments, posts } from "@/db/schema";
import { addComment } from "@/lib/actions";
import { dateFr } from "@/lib/format";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function Article({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  const db = getDb();
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!post) notFound();
  const list = await db.select().from(comments)
    .where(and(eq(comments.postId, post.id), eq(comments.status, "approved")))
    .orderBy(asc(comments.createdAt));
  return (
    <article className="narrow prose">
      <Link href="/blog" className="back">← Tous les articles</Link>
      <div className="when" style={{ marginTop: 24 }}>{dateFr(post.publishedAt)}</div>
      <h1>{post.title}</h1>
      {post.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}

      <section id="commentaires" style={{ marginTop: 48 }}>
        <h2>Commentaires ({list.length})</h2>
        {q.envoye && <div className="notice">Merci ! Votre commentaire sera publié après validation.</div>}
        {q.erreur && <div className="notice err">Indiquez votre nom et votre commentaire.</div>}
        <form action={addComment} className="box">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="slug" value={post.slug} />
          <label className="field">Votre nom<input name="author" maxLength={80} required /></label>
          <label className="field">Votre commentaire<textarea name="body" rows={4} maxLength={2000} required /></label>
          <p className="meta">Votre commentaire sera publié après validation par l’équipe.</p>
          <button className="btn" type="submit">Envoyer pour validation</button>
        </form>
        {list.map((c) => (
          <div className="comment" key={c.id}>
            <b>{c.author}</b> <span className="meta">· {dateFr(c.createdAt)}</span>
            <p>{c.body}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
