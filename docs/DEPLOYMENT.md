# Deploying Green Atelier to Vercel

Everything needed to take this repository from local to a public URL, in order.

---

## 1. Before you push

| Check | Why |
| --- | --- |
| `npm run build` succeeds | Vercel runs the same command; a local failure is a deploy failure |
| `.env` is **not** committed | `git ls-files .env` must return nothing. It is in `.gitignore` |
| Supabase migrations applied | The app queries tables that must already exist |
| Read the security note in §6 | One item there must be resolved before a public deploy |

---

## 2. Vercel project settings

Vercel detects Vite automatically. Confirm these:

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 22.x (package.json requires `^20.19.0 \|\| >=22.12.0`) |

---

## 3. Environment variables

Add these in **Project → Settings → Environment Variables**, for *Production*,
*Preview* and *Development*. Values come from Supabase → Project Settings → API.

| Name | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The publishable key. Public by design; RLS is what protects the data |
| `VITE_ADMIN_EMAILS` | Comma-separated. See the security note in §6 |

Anything prefixed `VITE_` is compiled into the JavaScript bundle and readable by
anyone who opens the site. Never put a service-role key or a real password in
one.

**Stripe secrets are not Vercel variables.** They live on Supabase, because the
Edge Functions read them, not the browser:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
npx supabase secrets set SITE_URL=https://your-app.vercel.app
```

`SITE_URL` must be the deployed origin with **no trailing slash**, or Stripe
will return buyers to `localhost` after payment.

---

## 4. `vercel.json`

Committed at the repository root. Two jobs:

- **SPA rewrite.** Vue Router uses history mode, so `/shop` is not a file on
  disk. Without the rewrite, opening or refreshing any URL other than `/`
  returns a 404. The pattern deliberately excludes `/assets/`, `/demo/` and
  `favicon.ico` so real files are still served as themselves.
- **Asset caching.** Vite fingerprints filenames, so built assets can be cached
  for a year safely.

---

## 5. Supabase, once deployed

1. **Auth → URL Configuration → Site URL** — set to the Vercel URL. Email
   confirmation and password-reset links point here.
2. **Auth → Redirect URLs** — add `https://your-app.vercel.app/**`.
3. **Stripe webhook** — point the endpoint at the deployed
   `stripe-webhook` function and set `STRIPE_WEBHOOK_SECRET` to the signing
   secret that endpoint issues.

---

## 6. Security note — resolve before a public deploy

`src/pages/login.vue` contains a hardcoded fallback login:

```js
const directMatch = normalizedEmail === 'admin@email.com' && inputPassword === 'Admin123'
```

If Supabase rejects the credentials, this branch signs the visitor up instead
and sends them to `/admin/dashboard`. The email and password are in the shipped
JavaScript bundle, readable by anyone.

What limits the damage: `/admin` is guarded by `isAdmin()`, which reads the
staff role from the database, and every table is behind RLS. So an attacker
using these credentials gets an account, not admin data.

What it still does: publishes a working credential pair in your source, and
lets anyone create an account that the login flow treats as privileged.

**Fix before submitting or sharing the URL:** delete `matchesConfiguredAdminLogin`
and the fallback branch, and grant admin by setting the staff role on a real
account in the database. Ask and I will make that change.

---

## 7. Known limitations

**Image weight.** `dist/` is 30 MB, of which 28 MB is images and under 1 MB is
JavaScript and CSS. Seven photographs are camera originals between 1.3 MB and
5.5 MB, rendered into frames a few hundred pixels wide:

| File | Size |
| --- | --- |
| `cta-about.jpg` | 5.5 MB |
| `rehome.jpg` | 4.9 MB |
| `store.jpg` | 3.7 MB |
| `textile-waste.jpg` | 3.5 MB |
| `sell.jpg` | 3.1 MB |
| `hero.jpg` | 1.6 MB |
| `clean.jpg` | 1.3 MB |

It will deploy and work, but the first paint on a phone will be slow. Resizing
these to ~2000px wide and exporting as WebP would cut the build by roughly 90%
with no visible difference. This is the single highest-value thing left.

**Reduced-motion and rAF.** Several sections animate via
`requestAnimationFrame`. Browsers pause rAF in a backgrounded tab, so a
transition mid-flight stays mid-flight until the tab is focused again. Normal
behaviour, noted so it is not mistaken for a bug.

---

## 8. Deploy

```bash
git add -A
git commit -m "Prepare for deployment"
git push
```

Vercel builds on push. Then walk one path end to end on the deployed URL:

browse → open a listing → add to bag → checkout with a Stripe test card →
confirm the order appears under Profile → Orders.
