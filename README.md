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
│   ├── router/
│   │   └── index.js          # App path routing definitions
│   ├── cart.js               # Reactive utility module for shopping cart state
│   ├── supabase.js           # Supabase client instantiation
│   └── main.js               # Application bootstrap entrypoint
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
Create a `.env` file or update [src/supabase.js](file:///c:/Users/mierz/OneDrive/FYP/GAFS/src/supabase.js) with your project URL and credentials:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

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

## 📊 Database Schema Design

To successfully transition from mock datasets to the Supabase backend database, implement the following **5 core tables** in your Supabase workspace:

### 1. `profiles`
* **Purpose:** Stores user profile attributes mapped 1:1 with Supabase Auth users.
* **Fields:** `id` (UUID Primary Key), `email` (Text), `full_name` (Text), `created_at` (Timestamp).

### 2. `listings` (or `products`)
* **Purpose:** Stores all clothes, bags, and accessories uploaded for verification and sale.
* **Fields:**
  * `id` (UUID Primary Key)
  * `seller_id` (UUID referencing `profiles.id`)
  * `brand` (Text), `category` (Text), `item_type` (Text), `condition` (Text)
  * `color` (Text), `material` (Text), `size` (Text), `vintage` (Boolean)
  * `serial_number` (Text, optional)
  * `description` (Text), `year_purchased` (Integer), `origin` (Text)
  * `packaging` (Text[] - list of checkboxes e.g. Box, Dustbag)
  * `images` (Text[] - URLs of images uploaded to Supabase Storage)
  * `authenticity_document_url` (Text - URL for proof of purchase / certs)
  * `listing_price` (Numeric), `accept_offers` (Boolean)
  * `status` (Text - `'pending_review'`, `'active'`, `'sold'`, `'rejected'`)
  * `created_at` (Timestamp)

### 3. `addresses`
* **Purpose:** Stores seller shipping address points and buyer billing locations.
* **Fields:** `id` (UUID Primary Key), `user_id` (UUID referencing `profiles.id`), `first_name` (Text), `surname` (Text), `phone` (Text), `street_address` (Text), `apartment` (Text), `city` (Text), `state` (Text), `postcode` (Text), `country` (Text), `is_default` (Boolean).

### 5. `offers`
* **Purpose:** Logs negotiations between buyers and sellers when "Accept Offers" is checked.
* **Fields:** `id` (UUID Primary Key), `listing_id` (UUID referencing `listings.id`), `buyer_id` (UUID referencing `profiles.id`), `offer_amount` (Numeric), `status` (Text: `'pending'`, `'accepted'`, `'declined'`).

### 6. `orders`
* **Purpose:** Tracks purchases, transaction amounts, shipping status, and platform fees.
* **Fields:** `id` (UUID Primary Key), `buyer_id` (UUID), `listing_id` (UUID), `price_paid` (Numeric), `service_fee` (Numeric), `shipping_address_id` (UUID), `shipping_status` (Text).

---

## 🎨 UI/UX Features
* **Authentication Stepper:** Interactive verification code interface with auto-focus shifting and cooldown resend timers.
* **Smart Navigation Dropdown:** Profile quick links toggleable via on-click activation and close-on-click-outside blurs.
* **Detailed Seller Stepper:** Step-by-step form layout detailing brand parameters, digital certificate file uploads, packaging checklists, and a dynamic RM platform commission breakdown.