# Green Atelier (GAFS)

**Green Atelier** is a sustainable luxury fashion resale platform designed to promote circular economy practices. GAFS (Green Atelier Fashion Sustainability) lets users buy verified pre-loved designer clothing, bags, and shoes, and list their own luxury items for resale, giving quality wardrobes a second life.

---

## 🍃 Core Sustainable Mission
Reselling a single garment extends its active life by an average of 2.2 years, reducing its carbon, waste, and water footprint by **73%**. Green Atelier aims to connect conscious buyers and sellers through an authenticated marketplace, combining high-end luxury aesthetics with zero-waste principles.

---

## 🛠️ Technology Stack
* **Frontend Framework:** Vue 3 (Composition API using `<script setup>`)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS (Vanilla CSS configurations)
* **Backend Database & Authentication:** Supabase (PostgreSQL database, Auth services, and Storage)
* **Routing:** Vue Router 5

---

## 📁 Project Structure

```
GAFS/
├── src/
│   ├── assets/               # Local static image and icon assets
│   ├── components/
│   │   ├── Navbar.vue        # Main application navigation with search & profile dropdowns
│   │   ├── Footer.vue        # Styled platform footer link list
│   │   ├── HeroSection.vue   # Top banner landing components
│   │   └── CartDrawer.vue    # Slide-over shopping cart panel
│   ├── pages/
│   │   ├── Home.vue          # Platform landing page with carousel and sustainability stats
│   │   ├── Shop.vue          # Catalog with dynamic filter and sort features
│   │   ├── Product.vue       # Detail page with sizing and authenticity specifications
│   │   ├── Sell.vue          # Start wizard for listing an item
│   │   ├── SellDetails.vue   # Multi-step submission form for detailed item specifications
│   │   ├── login.vue         # Client auth credentials login portal
│   │   ├── signup.vue        # Multi-step signup form (Email -> OTP Verification -> Password)
│   │   ├── Profile.vue       # Public user profile (stats, active listings, orders)
│   │   └── Account.vue       # Settings panel (profile editing, preferences, addresses)
│   ├── lib/                  # Data-access layer (all Supabase queries live here)
│   │   ├── auth.js           # Reactive session + profile, sign up / in / out
│   │   ├── listings.js       # Catalogue queries, Storage uploads, listing creation
│   │   ├── profiles.js       # Profile editing, avatars, stats
│   │   ├── addresses.js      # Address CRUD
│   │   ├── wishlist.js       # Saved items
│   │   ├── orders.js         # Checkout RPC, order & sales history
│   │   ├── brands.js         # Brand reference data
│   │   └── contact.js        # Contact form submissions
│   ├── router/
│   │   └── index.js          # Unused — routes are defined in main.js
│   ├── cart.js               # Cart state: DB-backed when signed in, localStorage as guest
│   ├── supabase.js           # Supabase client, configured from .env
│   └── main.js               # Routes, auth guards, app bootstrap
├── supabase/
│   ├── migrations/           # Versioned schema, RLS and Storage definitions
│   ├── seed.sql              # Brands, promo codes, demo seller and catalogue
│   └── config.toml           # Supabase CLI project config
├── public/demo/              # Images for the seeded demo listings
├── .env.example              # Template for local credentials
├── index.html                # App template shell
├── package.json              # Script directives & node module dependencies
└── vite.config.js            # Build plugin configurations
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (recommended version `^20.19.0 || >=22.12.0`).

### 1. Installation
Clone the repository and install the project dependencies:
```sh
npm install
```

### 2. Configure Supabase
Copy the template and fill in the values from **Supabase Dashboard → Project Settings → API**:
```sh
cp .env.example .env
```
```ini
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
Vite only exposes variables prefixed with `VITE_`, and it reads `.env` at startup — restart the dev server after editing it.

> The anon key is **not a secret**. It is compiled into the browser bundle and is public by design. What actually protects your data is the Row Level Security policies in `supabase/migrations/`. Never put a `service_role` key in a `VITE_` variable.

### 3. Create the database
Apply the migrations and seed data with the [Supabase CLI](https://supabase.com/docs/guides/cli):
```sh
npx supabase link --project-ref your-project-ref
npx supabase db push
```
Then load the reference data and demo catalogue:
```sh
npx supabase db push --include-seed
```
Alternatively, paste the contents of each file into the dashboard **SQL Editor**, in this order:

| Order | File | Creates |
|---|---|---|
| 1 | `supabase/migrations/20260730090000_schema.sql` | Tables, enums, indexes, triggers, RPCs |
| 2 | `supabase/migrations/20260730090100_rls.sql` | Row Level Security policies and column guards |
| 3 | `supabase/migrations/20260730090200_storage.sql` | Storage buckets and their policies |
| 4 | `supabase/seed.sql` | Brands, promo codes, demo seller and catalogue |

Every file is idempotent, so re-running one is safe.

### 4. Turn off email confirmation (for development)
In **Authentication → Sign In / Providers → Email**, switch **"Confirm email" OFF**.

New accounts then work instantly with no email involved, which is what you want locally and for demos. Supabase's built-in email service only delivers to addresses belonging to your Supabase organisation and is rate-limited to a handful of sends per hour, so relying on it during a demo will fail.

Signup adapts to whichever setting is active:

| "Confirm email" | What happens |
|---|---|
| **OFF** | Account is created and signed in immediately → lands on `/home`. |
| **ON** | Account is created, then the page asks the user to check their inbox for the confirmation link. |

For production, leave confirmation **ON** and configure custom SMTP under **Project Settings → Authentication → SMTP Settings**.

### 3. Run Development Server
Start the local server with hot-reload support:
```sh
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 4. Build for Production
To compile and minify the project asset bundle for production deployment:
```sh
npm run build
```

---

## 📊 Database

17 tables, all with Row Level Security enabled. The full definition lives in `supabase/migrations/`.

| Table | Purpose |
|---|---|
| `profiles` | Public user profile, 1:1 with `auth.users`. Deliberately holds **nothing private** — it is world-readable so seller cards and public profiles work for signed-out visitors. |
| `user_settings` | Email notification preferences. Owner-only. |
| `user_roles` | Grants `admin` / `moderator`. Has **no write policy at all**, so a role can only be granted with the `service_role` key. |
| `brands` | Reference list of luxury houses. Public read, admin write. |
| `listings` | Items for sale. Includes a generated `co2_saved_kg` (the sustainability calculator) and a generated `search_vector` with a GIN index powering the shop search. |
| `listing_verification` | Serial numbers and authenticity documents. **Separate table with no public read policy**, because the Sell wizard promises sellers this stays private. Also holds the private TrustCheck OCR text and document paths (see below). |
| `trustcheck_assessments` | TrustCheck evidence score and status per listing. Publicly readable (buyers see it on the product page); score/status are recomputed server-side by trigger, never trusted from the client. |
| `addresses` | Shipping and billing addresses. A partial unique index plus a trigger enforce one default per user. |
| `wishlists` / `cart_items` | Saved and in-bag items. No quantity column — resale items are one-of-a-kind. |
| `offers` | Price negotiation when a seller enables "Accept Offers". |
| `promo_codes` | Discount codes with expiry, minimum spend and usage limits. |
| `orders` / `order_items` | Purchases. Items carry a **snapshot** of title, brand and image so history survives a listing being edited or deleted, and each item has its own status because a multi-seller order ships in separate parcels. |
| `conversations` / `messages` | Buyer↔seller messaging (schema only — no chat UI yet). |
| `contact_messages` | Contact form submissions. Anyone may insert; only the sender and staff can read. |

Plus the `profile_stats` view (listing and sale counts, `security_invoker`).

### Security model

The anon key is public, so **RLS is the security boundary.** Two things RLS alone cannot express are enforced with triggers, since RLS is row-level and cannot protect individual columns:

* A seller cannot award themselves the **Trusted Seller** badge (`guard_profile_privileges`).
* A seller cannot publish their own listing or mark it sold — going live requires review, and `sold` is reachable only through checkout (`guard_listing_status`, `force_new_listing_pending`).

### Checkout

Ordering goes through the `place_order()` database function rather than direct inserts — `orders` has no INSERT policy at all. The function:

1. re-computes every amount from **stored** listing prices, so a tampered client cannot set its own total;
2. verifies the shipping address belongs to the buyer;
3. locks each listing `FOR UPDATE`, so two buyers racing for the same one-of-a-kind item cannot both succeed;
4. refuses to let a seller buy their own listing;
5. marks items sold, records the 85/15 payout split, and clears the item from **every** cart — all in one transaction.

Fees: RM 15 flat shipping, 5% buyer service fee, 15% platform commission (85% seller payout). These constants live in `place_order()`; the checkout page mirrors them for display only.

### Storage

| Bucket | Access | Limit |
|---|---|---|
| `listing-images` | Public read, owner write | 5 MB, images only |
| `avatars` | Public read, owner write | 2 MB, images only |
| `authenticity-docs` | **Private** — owner and staff only, via signed URL | 10 MB, PDF/JPG/PNG |

Every object is keyed `<user-id>/<filename>`; the policies check that the first path segment equals `auth.uid()`.

### Demo account

The seed creates a demo seller with 8 active listings:

```
demo.seller@greenatelier.test / DemoSeller123
```

Delete the `DEMO SELLER` and `DEMO CATALOGUE` sections of `supabase/seed.sql` before going to production.

### Green Atelier TrustCheck™

An **evidence-completeness check**, not an authentication service. It scores how complete and internally consistent a seller's uploaded evidence is for six supported models; it never claims an item is genuine, fake, or counterfeit, and that vocabulary is intentionally kept out of the code, schema, and UI copy.

**Supported models** (`src/lib/trustcheck/reference/*.json`): Gucci Marmont Small, Louis Vuitton Neverfull MM, Chanel Classic Flap Medium, Dior Lady Dior Medium, Prada Galleria Medium, Hermès Birkin 30. Brand/model selection that doesn't match one of these skips TrustCheck entirely — the listing publishes without a score.

**How it's scored** (`src/lib/trustcheck/scoring.js`, mirrored server-side in `trustcheck_score()`):

| Evidence | Points |
|---|---|
| Front / Back / Interior photo (from the listing's own images) | 15 each |
| Receipt or invoice | 20 |
| Serial number photo | 15 |
| Origin phrase detected via OCR (e.g. "Made in Italy") | 10 |
| Authentication certificate | 10 |

| Score | Status |
|---|---|
| 85–100 | Likely Consistent |
| 60–84 | Needs Review |
| 0–59 | Insufficient Evidence |

**Where the OCR happens:** entirely client-side via [Tesseract.js](https://github.com/naptha/tesseract.js), which downloads its worker and language data (a few MB) from a CDN on first use in the browser and caches it after that. It reads text off uploaded documents only — it makes no judgement about whether a document is genuine.

**What's public vs. private:**
- `trustcheck_assessments` (score, status, which evidence exists) is publicly readable — it's what renders on the product page via `TrustCheckCard.vue`.
- The OCR text and the document file paths go into `listing_verification`, which has no public read policy, since receipts routinely contain the original purchase price and the buyer's name.

**Why the score can't be spoofed:** the browser only ever submits which evidence *exists* (boolean flags), never a numeric score. A `BEFORE INSERT OR UPDATE` trigger (`trustcheck_apply_score()`) recomputes the score from those flags server-side, and additionally corrects a claimed front/back/interior photo against the listing's *actual* stored image count — so a seller can't claim 3 required photos exist by submitting the flags alone.

**Verifying the scoring logic:** `node verify.mjs` runs a standalone check (no dev server or Supabase connection needed) that:
- confirms the JS evidence weights match the SQL function's constants exactly;
- checks all 128 possible evidence combinations (2⁷ flags) produce the same status in JS and SQL;
- exercises `assessEvidence()` against known score/status pairs (e.g. 3 photos → 45/Insufficient, + receipt → 65/Needs Review, + serial + origin match → 90/Likely Consistent);
- checks the reference database (6 models) and OCR origin-matching against noisy/case-varied text;
- scans the TrustCheck source and migration for verdict-on-item wording ("is authentic", "is fake", etc.).

```sh
node verify.mjs
```

This does **not** replace a browser test of the full flow — see the "Seller flow" checklist below.

**Seller flow to test manually** (`/sell` → fill the wizard → upload 3 photos → TrustCheck step):
1. Pick brand **Gucci**, model **Marmont Small**.
2. **Analyze** with just the 3 required photos → expect **45/100, Insufficient Evidence**.
3. Add a receipt photo, re-analyze → expect **65/100, Needs Review**.
4. Add a serial number photo and a receipt whose text reads "Made in Italy", re-analyze → expect **90/100, Likely Consistent**.
5. Publish, approve the listing (Table Editor → `listings` → `status` → `active`), then confirm the score renders correctly on the product page.

Watch the browser console on the very first "Analyze Authenticity" click of a session — that's where a Tesseract.js CDN failure would surface, since it hasn't been exercised in a real browser yet.

---

## 🎨 UI/UX Features
* **Authentication Stepper:** Interactive verification code interface with auto-focus shifting and cooldown resend timers.
* **Smart Navigation Dropdown:** Profile quick links toggleable via on-click activation and close-on-click-outside blurs.
* **Detailed Seller Stepper:** Step-by-step form layout detailing brand parameters, digital certificate file uploads, packaging checklists, and a dynamic RM platform commission breakdown.