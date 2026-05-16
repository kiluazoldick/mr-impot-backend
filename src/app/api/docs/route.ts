import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mr Impot - Documentation API</title>
  <style>
    :root {
      --primary: #33a1db;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --get: #3b82f6;
      --post: #10b981;
      --put: #f59e0b;
      --delete: #ef4444;
      --code: #0f172a;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    header { background: var(--code); color: white; padding: 2rem 0; position: sticky; top: 0; z-index: 10; }
    header .container { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    header h1 { font-size: 1.75rem; font-weight: 700; }
    header p { color: #94a3b8; font-size: 0.9rem; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-right: 0.5rem; }
    .badge-get { background: #dbeafe; color: #1d4ed8; }
    .badge-post { background: #d1fae5; color: #059669; }
    .badge-put { background: #fef3c7; color: #b45309; }
    .badge-delete { background: #fee2e2; color: #dc2626; }
    nav { background: var(--card); border-bottom: 1px solid var(--border); padding: 0.5rem 0; position: sticky; top: 0; z-index: 9; }
    nav .container { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 0.5rem 2rem; }
    nav a { color: var(--muted); text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: color 0.2s; }
    nav a:hover { color: var(--primary); }
    section { margin: 2rem 0; }
    h2 { font-size: 1.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--primary); display: flex; align-items: center; gap: 0.5rem; }
    h2 .emoji { font-size: 1.5rem; }
    .endpoint { background: var(--card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1.5rem; overflow: hidden; transition: box-shadow 0.2s; }
    .endpoint:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .endpoint-header { padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); background: #fafafa; flex-wrap: wrap; }
    .endpoint-header code { font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 0.9rem; font-weight: 600; color: var(--code); background: #f1f5f9; padding: 0.3rem 0.7rem; border-radius: 4px; }
    .endpoint-body { padding: 1.5rem; }
    .endpoint-body h4 { font-size: 0.85rem; text-transform: uppercase; color: var(--muted); margin: 1rem 0 0.5rem; letter-spacing: 0.5px; }
    .endpoint-body p { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.5rem; }
    pre { background: var(--code); color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; line-height: 1.5; margin: 0.5rem 0; }
    pre code { color: #e2e8f0; background: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 0.5rem 0; }
    th { background: #f1f5f9; padding: 0.6rem 1rem; text-align: left; font-weight: 600; color: var(--text); border: 1px solid var(--border); }
    td { padding: 0.5rem 1rem; border: 1px solid var(--border); color: var(--muted); }
    td code { background: #f1f5f9; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.8rem; color: var(--code); }
    .auth-note { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-size: 0.9rem; }
    .auth-note strong { color: #b45309; }
    footer { text-align: center; padding: 2rem; color: var(--muted); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 2rem; }
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .endpoint-header { flex-direction: column; align-items: flex-start; }
      nav .container { flex-wrap: wrap; gap: 0.8rem; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div>
        <h1>📄 Mr Impot - API Documentation</h1>
        <p>Backend REST API pour la plateforme de consultation juridique</p>
      </div>
      <a href="/api/health" style="color: #10b981; text-decoration: none; font-weight: 500;">✅ API Status: Online</a>
    </div>
  </header>

  <nav>
    <div class="container">
      <a href="#auth">🔐 Authentification</a>
      <a href="#categories">📁 Catégories</a>
      <a href="#documents">📄 Documents</a>
      <a href="#articles">📰 Articles</a>
      <a href="#videos">🎬 Vidéos</a>
      <a href="#users">👥 Utilisateurs</a>
      <a href="#public">🌐 API Publique</a>
      <a href="#deployment">🚀 Déploiement</a>
    </div>
  </nav>

  <main class="container">

    <div class="auth-note">
      <strong>🔐 Authentification :</strong> Toutes les routes <strong>/api/admin/*</strong> nécessitent un cookie <code>sb-access-token</code> (obtenu via login). Les routes <strong>/api/public/*</strong> sont accessibles sans authentification.
    </div>

    <!-- ============ AUTH ============ -->
    <section id="auth">
      <h2><span class="emoji">🔐</span> Authentification</h2>

      <div class="endpoint">
        <div class="endpoint-header">
          <span class="badge badge-post">POST</span>
          <code>/api/auth/login</code>
          <span style="color: var(--muted); font-size: 0.85rem;">Connexion admin ou utilisateur</span>
        </div>
        <div class="endpoint-body">
          <p>Authentifie un utilisateur et retourne un token de session stocké en cookie HTTP-only.</p>
          <h4>Body (JSON)</h4>
          <pre><code>{
  "email": "admin@example.com",
  "password": "********"
}</code></pre>
          <h4>Réponse (200)</h4>
          <pre><code>{
  "user": { "id": "uuid", "email": "..." },
  "role": "admin",
  "profile": { "id": "uuid", "email": "...", "first_name": "...", "role": "admin" }
}</code></pre>
          <h4>Cookies définis</h4>
          <table>
            <tr><th>Cookie</th><th>Description</th><th>Durée</th></tr>
            <tr><td><code>sb-access-token</code></td><td>Token JWT d'accès</td><td>7 jours</td></tr>
            <tr><td><code>sb-refresh-token</code></td><td>Token de rafraîchissement</td><td>7 jours</td></tr>
          </table>
        </div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header">
          <span class="badge badge-post">POST</span>
          <code>/api/auth/register</code>
          <span style="color: var(--muted); font-size: 0.85rem;">Inscription utilisateur</span>
        </div>
        <div class="endpoint-body">
          <p>Crée un compte utilisateur standard (rôle <code>user</code>).</p>
          <h4>Body (JSON)</h4>
          <pre><code>{
  "email": "user@example.com",
  "password": "********",
  "first_name": "Jean",
  "last_name": "Dupont"
}</code></pre>
        </div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header">
          <span class="badge badge-get">GET</span>
          <code>/api/auth/me</code>
          <span style="color: var(--muted); font-size: 0.85rem;">Profil connecté</span>
        </div>
        <div class="endpoint-body">
          <p>Retourne le profil de l'utilisateur actuellement connecté via le cookie <code>sb-access-token</code>.</p>
          <h4>Réponse (200)</h4>
          <pre><code>{
  "user": { "id": "uuid", "email": "..." },
  "profile": { "id": "uuid", "email": "...", "first_name": "...", "role": "admin" }
}</code></pre>
        </div>
      </div>
    </section>

    <!-- ============ ADMIN CATEGORIES ============ -->
    <section id="categories">
      <h2><span class="emoji">📁</span> Catégories (Admin)</h2>

      <div class="endpoint">
        <div class="endpoint-header">
          <span class="badge badge-get">GET</span>
          <code>/api/admin/categories</code>
        </div>
        <div class="endpoint-body"><p>Liste toutes les catégories (actives par défaut).</p><h4>Query params</h4><table><tr><th>Paramètre</th><th>Type</th><th>Description</th></tr><tr><td><code>includeInactive</code></td><td>boolean</td><td>Inclure les catégories inactives</td></tr></table></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/categories/{id}</code></div>
        <div class="endpoint-body"><p>Détail d'une catégorie avec ses sous-catégories.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-post">POST</span><code>/api/admin/categories</code></div>
        <div class="endpoint-body"><h4>Body (JSON)</h4><pre><code>{
  "name_fr": "Droit Fiscal",
  "name_en": "Tax Law",
  "slug": "droit-fiscal",
  "parent_id": null
}</code></pre></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-put">PUT</span><code>/api/admin/categories/{id}</code></div>
        <div class="endpoint-body"><p>Modifie une catégorie (nom, slug, parent_id, etc.).</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-delete">DELETE</span><code>/api/admin/categories/{id}</code></div>
        <div class="endpoint-body"><p>Supprime une catégorie et ses sous-catégories.</p></div>
      </div>
    </section>

    <!-- ============ ADMIN DOCUMENTS ============ -->
    <section id="documents">
      <h2><span class="emoji">📄</span> Documents (Admin)</h2>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/documents</code></div>
        <div class="endpoint-body"><p>Liste paginée des documents.</p><h4>Query params</h4><table><tr><th>Paramètre</th><th>Type</th><th>Description</th></tr><tr><td><code>page</code></td><td>number</td><td>Page (défaut: 1)</td></tr><tr><td><code>limit</code></td><td>number</td><td>Éléments par page (défaut: 20)</td></tr><tr><td><code>search</code></td><td>string</td><td>Recherche par titre</td></tr><tr><td><code>category_id</code></td><td>uuid</td><td>Filtrer par catégorie</td></tr></table><h4>Réponse</h4><pre><code>{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}</code></pre></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-post">POST</span><code>/api/admin/documents</code></div>
        <div class="endpoint-body"><h4>Body (JSON ou FormData)</h4><p>2 modes acceptés :</p><p><strong>JSON simple :</strong></p><pre><code>{
  "category_id": "uuid",
  "title_fr": "Titre FR",
  "title_en": "Title EN",
  "description_fr": "Description FR",
  "description_en": "Description EN",
  "is_published": true,
  "file_path": "chemin/vers/fichier.pdf",
  "file_size": 123456
}</code></pre><p><strong>FormData :</strong> champ <code>data</code> (JSON stringifié) + champ <code>file</code> (fichier binaire)</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-put">PUT</span><code>/api/admin/documents/{id}</code></div>
        <div class="endpoint-body"><p>Met à jour un document. Mêmes formats que POST.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-delete">DELETE</span><code>/api/admin/documents/{id}</code></div>
        <div class="endpoint-body"><p>Supprime le document et le fichier associé du storage.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/documents/{id}?download=true</code></div>
        <div class="endpoint-body"><p>Retourne une URL signée pour télécharger le PDF (valide 1h).</p></div>
      </div>
    </section>

    <!-- ============ ADMIN ARTICLES ============ -->
    <section id="articles">
      <h2><span class="emoji">📰</span> Articles (Admin)</h2>
      <div class="endpoint"><div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/documents</code></div><div class="endpoint-body"><p>Les articles utilisent la même API que les documents. Le frontend filtre par catégorie pour distinguer les articles.</p></div></div>
    </section>

    <!-- ============ ADMIN VIDEOS ============ -->
    <section id="videos">
      <h2><span class="emoji">🎬</span> Vidéos (Admin)</h2>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/videos</code></div>
        <div class="endpoint-body"><p>Liste paginée des vidéos. Mêmes query params que les documents.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-post">POST</span><code>/api/admin/videos</code></div>
        <div class="endpoint-body"><h4>Body (JSON ou FormData)</h4><pre><code>{
  "category_id": "uuid",
  "title_fr": "Titre FR",
  "title_en": "Title EN",
  "description_fr": "Description FR",
  "description_en": "Description EN",
  "is_published": true
}</code></pre><p>Le fichier vidéo (MP4) est uploadé via FormData ou directement dans Supabase Storage.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/videos/{id}</code></div>
        <div class="endpoint-body"><p>Détail d'une vidéo.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-put">PUT</span><code>/api/admin/videos/{id}</code></div>
        <div class="endpoint-body"><p>Met à jour une vidéo.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-delete">DELETE</span><code>/api/admin/videos/{id}</code></div>
        <div class="endpoint-body"><p>Supprime la vidéo et son fichier du storage.</p></div>
      </div>
    </section>

    <!-- ============ ADMIN USERS ============ -->
    <section id="users">
      <h2><span class="emoji">👥</span> Utilisateurs (Admin)</h2>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/admin/users</code></div>
        <div class="endpoint-body"><p>Liste tous les profils utilisateurs.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-post">POST</span><code>/api/admin/users</code></div>
        <div class="endpoint-body"><p>Crée un compte <strong>admin</strong> (rôle défini à <code>admin</code>).</p><h4>Body (JSON)</h4><pre><code>{
  "name": "Nom Admin",
  "email": "admin2@example.com",
  "password": "********"
}</code></pre></div>
      </div>
    </section>

    <!-- ============ API PUBLIQUE ============ -->
    <section id="public">
      <h2><span class="emoji">🌐</span> API Publique</h2>
      <p style="margin-bottom: 1rem; color: var(--muted);">Accessible sans authentification. Retourne uniquement les contenus publiés.</p>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/public/categories</code></div>
        <div class="endpoint-body"><p>Liste des catégories actives.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/public/documents</code></div>
        <div class="endpoint-body"><p>Liste des documents publiés (paginated).</p><h4>Query params</h4><table><tr><td><code>page</code></td><td>number</td><td>Page (défaut: 1)</td></tr><tr><td><code>limit</code></td><td>number</td><td>Limite (défaut: 20)</td></tr><tr><td><code>search</code></td><td>string</td><td>Recherche</td></tr><tr><td><code>category_id</code></td><td>uuid</td><td>Filtrer par catégorie</td></tr></table></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/public/documents/{id}</code></div>
        <div class="endpoint-body"><p>Détail d'un document publié.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/public/documents/{id}?download=true</code></div>
        <div class="endpoint-body"><p>URL signée pour télécharger le PDF.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/public/videos</code></div>
        <div class="endpoint-body"><p>Liste des vidéos publiées.</p></div>
      </div>

      <div class="endpoint">
        <div class="endpoint-header"><span class="badge badge-get">GET</span><code>/api/public/videos/{id}</code></div>
        <div class="endpoint-body"><p>Détail d'une vidéo publiée.</p></div>
      </div>
    </section>

    <!-- ============ DEPLOYMENT ============ -->
    <section id="deployment">
      <h2><span class="emoji">🚀</span> Déploiement sur Vercel</h2>

      <div class="endpoint">
        <div class="endpoint-header" style="background: #f0fdf4;">
          <span class="badge" style="background:#d1fae5;color:#059669;">INFO</span>
          <span style="font-weight: 600;">3 projets Vercel à déployer</span>
        </div>
        <div class="endpoint-body">
          <h4>1. Backend API (<code>mr-impot-backend</code>)</h4>
          <pre><code>vercel.json :
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}</code></pre>
          <h4>Variables d'environnement</h4>
          <table>
            <tr><th>Variable</th><th>Valeur</th></tr>
            <tr><td><code>NEXT_PUBLIC_SUPABASE_URL</code></td><td>https://xxx.supabase.co</td></tr>
            <tr><td><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></td><td>eyJhbGci...</td></tr>
            <tr><td><code>SUPABASE_SERVICE_ROLE_KEY</code></td><td>eyJhbGci...</td></tr>
            <tr><td><code>APP_URL</code></td><td>https://api.mr-impot.com</td></tr>
          </table>

          <h4 style="margin-top: 1rem;">2. Frontend Admin (<code>mr-impot-admin-front</code>)</h4>
          <pre><code>vercel.json :
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}</code></pre>
          <h4>Variables d'environnement</h4>
          <table>
            <tr><td><code>NEXT_PUBLIC_API_URL</code></td><td>https://api.mr-impot.com/api</td></tr>
            <tr><td><code>NEXT_PUBLIC_SUPABASE_URL</code></td><td>https://xxx.supabase.co</td></tr>
            <tr><td><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></td><td>eyJhbGci...</td></tr>
            <tr><td><code>NEXT_PUBLIC_APP_URL</code></td><td>https://admin.mr-impot.com</td></tr>
          </table>

          <h4 style="margin-top: 1rem;">3. Frontend User (<code>webapp</code>)</h4>
          <pre><code>vercel.json :
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}</code></pre>
          <h4>Variables d'environnement</h4>
          <table>
            <tr><td><code>NEXT_PUBLIC_API_URL</code></td><td>https://api.mr-impot.com/api</td></tr>
            <tr><td><code>NEXT_PUBLIC_SUPABASE_URL</code></td><td>https://xxx.supabase.co</td></tr>
            <tr><td><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></td><td>eyJhbGci...</td></tr>
          </table>

          <h4 style="margin-top: 1rem;">🔒 Configuration CORS (backend)</h4>
          <p>Le fichier <code>src/proxy.ts</code> gère déjà les headers CORS. En production, remplacez <code>origin: "*"</code> par les domaines exacts :</p>
          <pre><code>const allowedOrigins = [
  "https://admin.mr-impot.com",
  "https://mr-impot.com"
]</code></pre>
        </div>
      </div>
    </section>

  </main>

  <footer>
    <p>Mr Impot API v1.0.0 • Documentation générée automatiquement • <span id="year"></span></p>
  </footer>

  <script>document.getElementById('year').textContent = new Date().getFullYear()</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
