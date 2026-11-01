import { login } from "@/lib/actions";

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  return (
    <div className="narrow">
      <h1 className="title">Administration</h1>
      {q.erreur && <div className="notice err">Mot de passe incorrect.</div>}
      <form action={login} className="box">
        <label className="field">Mot de passe<input name="password" type="password" required autoFocus /></label>
        <button className="btn" type="submit">Se connecter</button>
      </form>
    </div>
  );
}
