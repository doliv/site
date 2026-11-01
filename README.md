# Site – blog, rencontres, commentaires modérés

Next.js 15 (App Router, TypeScript) + base Neon (Postgres) via Drizzle ORM.

## Mise en route

1. **Créer la base** : sur https://neon.tech, créez un projet et copiez la *connection string* (avec `?sslmode=require`).
2. **Variables d'environnement** : copiez `.env.example` vers `.env.local` et remplissez :
   - `DATABASE_URL` : la chaîne Neon
   - `ADMIN_PASSWORD` : le mot de passe de l'espace admin (long)
   - `SESSION_SECRET` : générez-le avec `openssl rand -hex 32`
3. **Installer et créer les tables** :
   ```
   npm install
   npm run db:push
   ```
4. **Lancer** : `npm run dev`, puis http://localhost:3000
5. **Administration** : http://localhost:3000/admin (lien « Administration » en pied de page). Créez vos articles et rencontres, validez les commentaires.

## Déploiement sur Vercel

Poussez le dépôt sur GitHub, importez-le dans Vercel et ajoutez les trois variables d'environnement. Lancez `npm run db:push` une fois depuis votre machine pour créer les tables.

## À personnaliser

- Nom du site, intro et menu : `src/lib/content.ts`
- Textes des deux pages longues : `src/content/*.ts`
- Couleurs et mise en page : `src/app/globals.css`

## Limites connues

- Un seul compte admin (mot de passe unique), sans limitation des tentatives de connexion.
- Pas de protection anti-spam sur les commentaires et les inscriptions.
- Les articles et rencontres se créent et se suppriment, mais ne se modifient pas encore.
- Pas d'e-mail de confirmation d'inscription.
