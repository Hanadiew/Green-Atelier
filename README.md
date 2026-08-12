# Green Atelier (GAFS)

**Green Atelier** is a sustainable luxury fashion resale platform designed to promote circular economy practices. GAFS (Green Atelier Fashion Sustainability) lets users buy verified pre-loved designer clothing, bags, and shoes, and list their own luxury items for resale, giving quality wardrobes a second life.

---

## 🍃 Core Sustainable Mission
Nine extra months of wear cuts a garment's carbon, water and waste footprint by **20 to 30%** ([WRAP](https://www.wrap.ngo)). Green Atelier connects conscious buyers and sellers through an authenticated marketplace, pairing luxury resale with circular principles.

---

## 🛠️ Technology Stack
* **Frontend Framework:** Vue 3 (Composition API using `<script setup>`)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS (Vanilla CSS configurations)
* **Backend Database & Authentication:** Supabase (PostgreSQL database, Auth services, and Storage)
* **Server-side logic:** Supabase Edge Functions (Deno) — everything needing a secret key
* **Payments:** Stripe Checkout, **test mode only**
* **Routing:** Vue Router 5

---

## 📁 Project Structure

Grouped by what a file does, not by its extension. `.js` under `src/lib/` is
data access; `.js` at the root is build and tooling configuration, and has to
stay there because npm, Vite, Vercel and the linters each look for their file
in the project root by name.

```
GAFS/
├── src/
│   ├── assets/               # Local static image and icon assets
│   ├── components/           # Shared UI, used by more than one page
│   │   ├── Navbar.vue        # Navigation, shop/profile dropdowns, cart and seller badges
│   │   ├── Footer.vue        # Platform footer link list
│   │   ├── CartDrawer.vue    # Slide-over shopping bag panel
│   │   ├── HowItWorks.vue    # The three-step explainer, reused across pages
│   │   ├── TestimonialRail.vue   # Self-scrolling review rail on the home page
│   │   ├── FaqAccordion.vue  # Contact-page FAQ: search, topic pills, panels
│   │   ├── RichTextEditor.vue    # Listing description editor (sanitised on save)
│   │   ├── StarRating.vue    # Read-only and interactive star ratings
│   │   ├── TrustCheckCard.vue / TrustCheckPanel.vue   # Evidence display
│   │   ├── ToggleSwitch.vue  # The one switch component — see "Toggles" below
│   │   ├── PromoTab.vue      # Slide-out "Offers" drawer on the right edge
│   │   ├── WelcomePromoDialog.vue  # First-order welcome code popup
│   │   ├── Icon.vue          # Single inline-SVG icon set
│   │   ├── admin/            # Admin-portal chrome (sidebar, header, table frame, badges)
│   │   └── sustainable/      # Sections specific to the Sustainable page
│   ├── pages/                # One file per route, registered in main.js
│   │   ├── Home.vue          # Landing page: collections, brands, reviews
│   │   ├── Shop.vue          # Catalogue with filters and sort
│   │   ├── Product.vue       # Detail page, offers, TrustCheck evidence
│   │   ├── Sell.vue          # The pitch, open to signed-out visitors
│   │   ├── SellDetails.vue   # Multi-step listing form (gated)
│   │   ├── login.vue         # Sign-in
│   │   ├── signup.vue        # Multi-step signup (email → OTP → password)
│   │   ├── Profile.vue       # Listings, reviews, wishlist, orders, reports
│   │   ├── Account.vue       # Settings: profile, preferences, addresses, payout, cards
│   │   ├── Checkout.vue      # Bag → shipping → payment, then off to Stripe
│   │   ├── PaymentSuccess.vue    # Stripe success_url — confirms, then polls
│   │   ├── PaymentCancelled.vue  # Stripe cancel_url — releases the reservation
│   │   ├── SalesOrders.vue   # Seller's incoming sales and fulfilment status
│   │   ├── Wallet.vue        # Seller earnings and payout history
│   │   ├── About.vue / Sustainable.vue / Contact.vue   # Editorial pages
│   │   └── admin/            # 16 admin pages (listings, users, orders, reports, …)
│   ├── lib/                  # Data-access layer — every Supabase query lives here
│   │   ├── supabase.js       # The client, configured from .env
│   │   ├── auth.js           # Reactive session + profile, sign up / in / out
│   │   ├── cart.js           # DB-backed when signed in, localStorage as a guest
│   │   ├── listings.js       # Catalogue queries, Storage uploads, listing creation
│   │   ├── profiles.js       # Profile editing, avatars, stats
│   │   ├── addresses.js      # Address CRUD
│   │   ├── wishlist.js       # Saved items
│   │   ├── orders.js         # Buyer order history
│   │   ├── salesOrders.js    # Seller-side orders + the new-sale badge
│   │   ├── payments.js       # Stripe session, payment state, saved cards
│   │   ├── payouts.js        # Payout accounts, earnings, payout history
│   │   ├── promos.js         # Live promo discovery and best-code selection
│   │   ├── offers.js         # Price negotiation + seller notification badges
│   │   ├── reviews.js        # Buyer reviews of sellers
│   │   ├── contact.js        # Contact form submissions
│   │   ├── admin.js          # Every admin-portal query
│   │   ├── sanitiseHtml.js   # Allowlist sanitiser for stored descriptions
│   │   ├── motion.js / smoothScroll.js / loading.js / toast.js
│   │   ├── originButton.js / heroField.js    # Pointer-driven visual effects
│   │   └── trustcheck/       # Evidence scoring, OCR, reference models
│   ├── App.vue               # Root component
│   ├── main.js               # Routes, auth guards, app bootstrap
│   └── style.css             # Tailwind theme tokens and shared classes
├── supabase/
│   ├── migrations/           # Versioned schema, RLS and Storage definitions
│   ├── functions/            # Edge Functions (Deno) — anything needing a secret
│   │   ├── create-checkout-session/  # Prices the order, opens Stripe Checkout
│   │   ├── confirm-checkout-session/ # Settles on return, by asking Stripe
│   │   ├── stripe-webhook/           # Settles on Stripe's own signed callback
│   │   ├── attach-test-card/         # Saves a Stripe test card to a user
│   │   ├── list-payment-methods/     # Reads/removes saved cards
│   │   └── admin-manage-user/        # Suspend / restore / delete an account
│   ├── seed.sql              # Brands, promo codes, demo seller and catalogue
│   └── config.toml           # Supabase CLI project config
├── scripts/
│   └── verify.mjs            # TrustCheck verification suite (npm run verify)
├── docs/                     # Deployment and admin reference docs (see below)
├── public/demo/              # Images for the seeded demo listings
├── index.html                # Vite entry template
├── vite.config.js            # Build and dev-server configuration
├── vercel.json               # SPA rewrite and asset cache headers
├── eslint.config.js          # Flat ESLint config
├── jsconfig.json             # Editor path resolution
├── .oxlintrc.json / .oxfmtrc.json    # Linter and formatter rules
├── .env.example              # Template for local credentials
└── package.json              # Scripts and dependencies
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
`db push` applies every migration in `supabase/migrations/` in filename order, which
is the only supported route — several later migrations depend on earlier ones, and
one of them (`20260805000000_stripe_enums.sql`) **must** run in its own transaction
because Postgres will not let a newly added enum value be used by the statement that
adds it.

Roughly what they build, oldest to newest:

| Migrations | Add |
|---|---|
| `…090000` – `…090200` | Tables, enums, RLS policies, column guards, Storage buckets |
| `…090300` – `…090700` | Policy fixes, performance rewrites, legacy cleanup |
| `…090800` – `…091200` | TrustCheck, seller sales orders, payout accounts, payouts |
| `…091300` – `…091400` | Reports, contact inbox, admin views |
| `…0804…` | Seller listing lifecycle (no self-publishing, real deletes) |
| `…0805…` | Stripe payments, auto-settled payouts, accepted-offer pricing, flat fee |

Every file is idempotent, so re-running one is safe. If you must use the dashboard
**SQL Editor** instead, run them in the same filename order and execute the
`stripe_enums` file as its own query.

Then load the reference data and demo catalogue if you skipped `--include-seed`.

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

## 💳 Stripe Payment Testing

GAFS uses **Stripe Test Mode** for development and FYP demonstrations. **No real money is charged, and the platform does not process real payments.** `create-checkout-session` refuses to start if `STRIPE_SECRET_KEY` is not an `sk_test_` key, so a live key cannot be used by accident.

**Stripe Connect is deliberately not implemented**, so no money is ever transferred to a
seller's bank. The flow covered here is **Buyer → Stripe Test Payment → GAFS**. Payout
rows are auto-settled and marked `payout_provider = 'simulated'` for demonstration —
see *Payouts* below for exactly what that does and does not mean.

### How it works

```
Cart → Checkout → create_pending_order()      order: pending / payment: pending
                                              listings: reserved
     → Stripe Checkout (hosted by Stripe)
     → stripe-webhook verifies the signature          ─┐ whichever arrives first;
     → confirm-checkout-session reads the session     ─┘ both are idempotent
     → finalize_paid_order()                  order: processing / payment: paid
                                              listings: sold, carts cleared
```

Two properties worth knowing:

- **The browser is not authoritative.** `/payment-success` only *reads* the order, and asks `confirm-checkout-session` to look the Stripe session up server-side. That function applies the same checks as the webhook — session belongs to the order, amount matches, Stripe says `paid` — before calling the same `finalize_paid_order()`. Nothing a buyer sends decides anything, and refreshing or sharing the URL changes nothing. Without it the buyer, who usually beats the webhook home, would sit on a spinner; with no webhook forwarding at all (the normal local setup) the page would never resolve.
- **Payment survives a dead browser.** If the buyer's connection drops on the way back from Stripe, the webhook still settles the order.

Listings sit in a `reserved` state while a buyer is mid-payment, so a second buyer cannot reach Stripe for the same one-of-a-kind item — nobody gets charged for something they can't receive. Cancelling releases the hold immediately; abandoning it releases via Stripe's `checkout.session.expired` after 30 minutes.

### Saved test cards

Stripe test mode ships ready-made payment-method tokens (`pm_card_visa`), which can be
attached to a Customer server-side. **Account → Payment methods** offers three of them,
so a tester ends up with a saved card having typed nothing, and Checkout is handed the
`customer` so the card is already there.

Only those named tokens are accepted, detaching verifies the card belongs to the caller,
and `attach-test-card` refuses to run on a live key — attaching a card nobody entered is
fine in test mode and would be fraud in production.

### 1. Create a Stripe test account

Sign up at [stripe.com](https://dashboard.stripe.com/register). No business details or bank account are needed for test mode. Make sure the dashboard's **Test mode** toggle is ON.

### 2. Get your test credentials

From **Developers → API keys**, copy the **Secret key** (`sk_test_…`). GAFS does not need the publishable key — Stripe hosts the payment page itself.

### 3. Set the server-side secrets

These are **Edge Function secrets, never `VITE_` variables**. The Stripe secret key must never reach the browser.

```sh
npx supabase login
npx supabase link --project-ref your-project-ref

npx supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
npx supabase secrets set SITE_URL=http://localhost:5173
```

`SITE_URL` is the fallback for where Stripe returns the buyer. For local development the function prefers the origin the request actually came from, so a dev server on any localhost port works without changing this. Set `SITE_URL` to your real domain when you deploy.

### 4. Deploy the functions

```sh
npx supabase functions deploy create-checkout-session
npx supabase functions deploy confirm-checkout-session
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

`--no-verify-jwt` is required on the webhook: Stripe does not send a Supabase JWT, and the Stripe signature is what authenticates the request.

### 5. Listen to the webhook locally

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```sh
stripe login
stripe listen --forward-to https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

`stripe listen` prints a signing secret (`whsec_…`). Register it and redeploy so the function picks it up:

```sh
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_printed_by_stripe_listen
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

For a deployed site instead, add the endpoint under **Developers → Webhooks** and use the signing secret shown there. Events to subscribe to:

| Event | Effect |
|---|---|
| `checkout.session.completed` | Order becomes paid, listings sold, carts cleared |
| `checkout.session.expired` | Reservation released, listings back on sale |
| `checkout.session.async_payment_succeeded` | Same as `completed`, for delayed methods |
| `checkout.session.async_payment_failed` | Payment marked failed, listings released |
| `payment_intent.payment_failed` | Payment marked failed, listings released |

### 6. Test with Stripe's test cards

Run `npm run dev`, add an item to your bag, and go through checkout.

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0027 6000 3184` | Requires 3D Secure authentication |

Any future expiry date, any 3-digit CVC, any postcode.

Watch the result land in the `stripe listen` output and in **Edge Functions → Logs** in the Supabase dashboard.

### Replaying a webhook

Idempotency is a hard requirement — Stripe retries. To check it yourself, resend a delivered event:

```sh
stripe events resend evt_xxx
```

The order stays paid, no second order appears, and the log says the duplicate was ignored.

### Test-mode limitations

- Test payments are simulated. Nothing settles, and no funds exist.
- Only Stripe's test cards work; a real card is rejected in test mode.
- Sellers are never actually paid. Payout rows reach `paid` with `payout_provider = 'simulated'`, which records that the lifecycle ran — not that money arrived.
- MYR is used as the currency, matching the RM pricing in the UI.

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
| `offers` | Price negotiation when a seller enables "Accept Offers". A trigger decides who may change what — see below. |
| `promo_codes` | Discount codes with expiry, minimum spend and usage limits. |
| `seller_payout_accounts` | A seller's bank details. **No public read** — owner and staff only. |
| `payouts` | What the platform owes each seller per sold item, and whether it is settled. |
| `reports` | Buyer/seller reports for moderation. The reporter can read their own, including the admin's reply. |
| `orders` / `order_items` | Purchases. Items carry a **snapshot** of title, brand and image so history survives a listing being edited or deleted, and each item has its own status because a multi-seller order ships in separate parcels. |
| `conversations` / `messages` | Buyer↔seller messaging (schema only — no chat UI yet). |
| `contact_messages` | Contact form submissions. Anyone may insert; only the sender and staff can read. |

Plus two views: `profile_stats` (listing and sale counts) and `seller_earnings_stats`
(total / paid / pending earnings, computed from `payouts`). Both use
`security_invoker`, so a normal user only ever aggregates rows they may read.
`admin_users` is a third view, gated on `is_admin()`, joining `profiles` to
`auth.users` for the admin user list.

### Security model

The anon key is public, so **RLS is the security boundary.** Two things RLS alone cannot express are enforced with triggers, since RLS is row-level and cannot protect individual columns:

* A seller cannot award themselves the **Trusted Seller** badge, nor repoint their `stripe_customer_id` at someone else's saved cards (`guard_profile_privileges`).
* A seller cannot publish their own listing or mark it sold — going live requires review, and `sold` is reachable only through checkout (`guard_listing_status`, `force_new_listing_pending`).
* A seller cannot change any listing status at all: their only controls are edit and remove (`guard_listing_status`, since `20260804000000`).
* A buyer cannot edit `payment_status`, `paid_at`, the Stripe identifiers, or any money column on their own order (`guard_order_payment_fields`). Without this, `orders_update_buyer` would have allowed it.
* A buyer cannot accept **their own** offer. Only the seller may accept or decline; only the buyer may withdraw; the amount freezes once answered (`guard_offer_transition`). This matters because an accepted offer sets the price — see *Offers* below.
* A seller cannot move an unpaid order item to shipped, and unpaid orders are invisible to them entirely (`order_awaiting_payment`).

### Checkout

Ordering goes through database functions rather than direct inserts — `orders` has no
INSERT policy at all. What was one `place_order()` is now split in three, because a
real payment has a gap in the middle:

| Function | Called by | Does |
|---|---|---|
| `create_pending_order()` | the buyer, via `create-checkout-session` | Prices the cart, validates it, **reserves** the listings. Order is `pending` / payment `pending`. Nothing is sold. |
| `finalize_paid_order()` | the Stripe webhook only | Marks paid, order → `processing`, reserved listings → `sold`, clears carts, creates the payouts. |
| `release_pending_order()` | webhook or the buyer cancelling | Hands the listings back on cancel, expiry or failure. |

`place_order()` still exists and still has the same signature, but is now a thin
wrapper over the first two — so the pricing rules live in exactly **one** place
rather than being duplicated per payment path.

`create_pending_order()`:

1. re-computes every amount from **stored** prices, so a tampered client cannot set its own total;
2. uses the buyer's **accepted offer** price where one is live, otherwise the listing price;
3. verifies the shipping address belongs to the buyer;
4. locks each listing `FOR UPDATE`, so two buyers racing for the same one-of-a-kind item cannot both succeed;
5. refuses to let a seller buy their own listing;
6. reserves the listings so a second buyer cannot even reach Stripe for the same item.

`finalize_paid_order()` and `release_pending_order()` are **not granted to
`authenticated`** — only the service role may settle a payment. Note that revoking
from `anon, authenticated` alone is not enough: Postgres grants EXECUTE to `PUBLIC`
on every new function, so the revoke has to name `public` (see
`20260805000200_lock_payment_functions.sql`).

Fees: RM 15 flat shipping, RM 20 flat buyer platform fee, 15% GAFS fee on the seller
side (85% seller payout). These constants live in `create_pending_order()`; the
checkout page mirrors them for display only.

### Reserved listings

`listing_status` has a `reserved` value between `active` and `sold`. A listing is
reserved while its buyer is on Stripe's payment page, which is what stops two buyers
being **charged** for the same one-of-a-kind item rather than merely stopping the
second sale. It is released three ways:

* the buyer cancels → `cancel_my_pending_order()` from the cancel page, immediately;
* the buyer abandons → Stripe's `checkout.session.expired` webhook, after 30 minutes;
* a missed webhook → `create_pending_order()` clears the buyer's own stale holds older than 30 minutes, so nobody is deadlocked by their own abandoned checkout.

### Offers

When a seller enables **Accept Offers**, buyers can negotiate from the product page.
An accepted offer becomes the price `create_pending_order()` charges, and the bag
shows the same figure via `my_agreed_prices()` so the cart and Stripe never disagree.

Only offers that are `accepted`, belong to that buyer, and have not expired count — a
lapsed acceptance is not a standing discount. Sellers see a gold dot on the profile
icon, a count in the Listings dropdown, and a badge on the listing card itself. That
is refreshed on navigation, not pushed: a seller sitting still on one page will not
see a new offer until they move.

### Promo codes

Buyers had no way to discover a code existed, so:

* a **welcome popup** appears once for a buyer with zero orders, if a `WELCOME…` code is live;
* an **Offers drawer** on the right edge lists every live code with its conditions;
* checkout **auto-applies** whichever live code saves the most, and re-evaluates when the bag changes.

A code the buyer typed themselves is never overridden, even if ours would save more.
Every candidate is validated by `validate_promo_code()` in Postgres, which
`create_pending_order()` calls again before charging — the browser never decides a
discount.

> **Known gap:** `WELCOME15` is only *advertised* to first-time buyers. The code
> itself has no first-order condition in the database, so anyone who learns it can
> reuse it. Enforcing that needs a check inside `validate_promo_code()`.

### Payouts

A seller's 85% is settled the moment the buyer's payment is confirmed — Green Atelier
does not sit on seller funds. The payout row is created inside
`finalize_paid_order()`, and only when the seller has a default payout account on
file; otherwise it stays `pending` until they add one, at which point
`settle_my_pending_payouts()` catches it up.

> **`payout_provider = 'simulated'` means no money moved.** Stripe test mode has no
> funds and the platform balance is always zero — the buyer's payment is simulated
> too. Real transfers to a third party's bank need Stripe Connect, which this project
> does not implement. `processSellerPayout()` in `src/lib/payouts.js` is the seam for
> a real provider; it must write `'stripe'` or `'manual'`, never `'simulated'`.

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

> Supabase Auth rejects the `.test` TLD as an invalid address, so the Account page shows
> `Email address "…" is invalid` for this account. Harmless — it only blocks changing the
> email — but change the seed address if it bothers you during a demo.

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

**Verifying the scoring logic:** `npm run verify` runs a standalone check (no dev server or Supabase connection needed) that:
- confirms the JS evidence weights match the SQL function's constants exactly;
- checks all 128 possible evidence combinations (2⁷ flags) produce the same status in JS and SQL;
- exercises `assessEvidence()` against known score/status pairs (e.g. 3 photos → 45/Insufficient, + receipt → 65/Needs Review, + serial + origin match → 90/Likely Consistent);
- checks the reference database (6 models) and OCR origin-matching against noisy/case-varied text;
- scans the TrustCheck source and migration for verdict-on-item wording ("is authentic", "is fake", etc.).

```sh
npm run verify
```

This does **not** replace a browser test of the full flow — see the "Seller flow" checklist below.

**Seller flow to test manually** (`/sell` → fill the wizard → upload 3 photos → TrustCheck step):
1. Pick brand **Gucci**, model **Marmont Small**.
2. **Analyze** with just the 3 required photos → expect **45/100, Insufficient Evidence**.
3. Add a receipt photo, re-analyze → expect **65/100, Needs Review**.
4. Add a serial number photo and a receipt whose text reads "Made in Italy", re-analyze → expect **90/100, Likely Consistent**.
5. Publish, then approve it in the admin portal (**/admin → Listings → filter *In Review* → Review → Approve**) and confirm the score renders correctly on the product page. Approving is now the only supported route — editing `listings.status` by hand in the Table Editor works only because dashboard SQL runs with `auth.uid()` null, which bypasses the seller status guard.

Watch the browser console on the very first "Analyze Authenticity" click of a session — that's where a Tesseract.js CDN failure would surface, since it hasn't been exercised in a real browser yet.

---

## 📚 Further documentation

The admin portal has its own reference material in [`docs/`](docs/):

| Document | Covers |
|---|---|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploying the whole app to Vercel and Supabase |
| [ADMIN_IMPLEMENTATION.md](docs/ADMIN_IMPLEMENTATION.md) | Architecture overview — start here |
| [ADMIN_DEPLOYMENT.md](docs/ADMIN_DEPLOYMENT.md) | Step-by-step deployment |
| [ADMIN_API_REFERENCE.md](docs/ADMIN_API_REFERENCE.md) | Every function in `src/lib/admin.js` |
| [ADMIN_PORTAL_SUMMARY.md](docs/ADMIN_PORTAL_SUMMARY.md) | Feature checklist and file inventory |

These predate the Stripe, payout, offer and promo work described above, so where they
disagree with this README, **this README is current**. Notably: Featured Products and
Staff & Access were removed, Reports moved to the Support group, and the seller-side
commission is now labelled *GAFS Fee*.

---

## 🎨 UI/UX Features
* **Authentication Stepper:** Interactive verification code interface with auto-focus shifting and cooldown resend timers.
* **Smart Navigation Dropdown:** Profile quick links toggleable via on-click activation and close-on-click-outside blurs.
* **Detailed Seller Stepper:** Freely navigable step-by-step form — click any section in the stepper, in any order — covering brand parameters, authenticity document uploads, packaging checklists, and a live GAFS Fee / payout breakdown. Gaps are caught on submit, which jumps back to the first section that fails.
* **One toggle component:** `ToggleSwitch.vue` is the only switch in the app. Four hand-rolled copies previously shared a bug where the knob sat outside its track — a `<button>`'s default padding shifted the absolutely-positioned knob's origin, so `translateX` carried it past the edge. The component positions with `left` derived from the track width instead.