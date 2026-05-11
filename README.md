# RJ's Café — React Edition (Full)

Full rebuild of the RJ's Café PHP project as a React (Vite) single-page app backed by Supabase (PostgreSQL + Auth + Storage) and deployed on Cloudflare Pages.

**Stack:** React 18 · Vite · React Router · Supabase · Cloudflare Pages

---

## What's Included

### Guest side (public)
- **Home** — landing with featured items
- **Menu** — category-filtered grid, add to cart
- **Cart** — quantity controls, persisted to localStorage
- **Checkout** — pickup/delivery + cash/GCash/COD, saves to DB
- **Order Success** — confirmation with order code
- **Track Order** — look up by code with progress steps
- **Reservations** — create + manage by reference code

### Admin / Staff side (protected)
Sign in at **/admin/login**
- **Dashboard** — stats: total orders, active orders, today's revenue, total revenue, products, active reservations + recent orders & reservations
- **Orders** — search/filter, view full details, update status (received → preparing → ready → out for delivery → completed / cancelled)
- **Reservations** — search/filter, view details, update status (pending → confirmed → seated → completed / cancelled)
- **Products** — CRUD with image uploads to Supabase Storage *(admin only)*
- **Categories** — CRUD with sort order *(admin only)*
- **Inventory** — stock adjustments with reason logging *(admin only)*
- **Staff** — add/edit/deactivate/delete staff accounts *(admin only)*
- **Reports** — revenue by day chart, top products, payment method breakdown *(admin only)*
- **Shop Hours** — set open/close times per day of week *(admin only)*
- **Activity Log** — last 100 staff actions *(admin only)*
- **Profile** — edit own name/phone, change own password

### Two roles
- `admin` — full access
- `staff` — dashboard, orders, reservations, and profile only

---

## Setup — Local Development

### 1. Install Node.js
You need **Node 18+**. Get it from [nodejs.org](https://nodejs.org/) if you don't have it.

### 2. Install dependencies
```bash
npm install
```

### 3. Create your Supabase project
1. Sign up at [supabase.com](https://supabase.com/) → free tier is enough
2. Create a new project (pick **Southeast Asia (Singapore)** region for fastest queries in PH)
3. Save the database password somewhere safe (not used in the app, but Supabase requires it)
4. Wait ~1-2 minutes for the project to provision

### 4. Run the database setup SQL
1. In Supabase, click **SQL Editor** → **New query**
2. Open `supabase-schema.sql` from this project, copy ALL of it, paste in
3. Click **Run**
4. Should see "Success. No rows returned." All tables created, sample products seeded, storage bucket ready.

### 5. Create admin & staff login accounts
The SQL inserted *placeholder* staff records but they can't log in yet. You need to create the actual login accounts in Supabase Auth and link them.

1. In Supabase, go to **Authentication → Users** → click **Add user → Create new user**
2. Create the admin:
   - Email: `rj@rjscafe.ph`
   - Password: `admin123` (or whatever you want — remember it!)
   - ✅ **Check "Auto Confirm User"** (skips email verification)
   - Click **Create user**
3. Repeat for the staff account:
   - Email: `maria@rjscafe.ph`
   - Password: `staff123`
   - Auto Confirm User: checked

That's it. The auth system matches login emails to the `staff` table by email, so you don't need to copy any UUIDs.

### 6. Get your API credentials
1. **Project Settings → API**
2. Copy the **Project URL** and the **anon public** key

### 7. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 8. Run the dev server
```bash
npm run dev
```
Open `http://localhost:5173` — you should see the cafe homepage. Go to `/admin/login` and sign in with `rj@rjscafe.ph` / `admin123` to access the admin panel.

---

## Deploy to Cloudflare Pages

### 1. Push to GitHub
1. Create a [GitHub](https://github.com/) account if needed
2. Create a **public** repository (don't add a README/gitignore — we have them)
3. In a terminal in this folder:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rjs-cafe-react.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages
1. Sign up at [cloudflare.com](https://cloudflare.com/) (free)
2. **Workers & Pages → Create → Pages → Connect to Git**
3. Authorize GitHub, pick your repo
4. **Build settings:**
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Environment variables:**
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. **Save and Deploy**

After 1-2 minutes your site is live at `https://your-project.pages.dev`. That URL works on any device.

### 3. (Optional) Custom .shop domain
If you bought one:
1. In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**
2. Enter the domain, follow the DNS instructions
3. Live on your domain in under 10 minutes

**Note about .shop pricing:** $1-3 first year, but renewal jumps to ~$30-45/year. For a school project, the free `.pages.dev` URL is fine.

---

## Project Structure

```
rjs-cafe-react/
├── public/
│   └── _redirects                # SPA routing for Cloudflare Pages
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Public site nav
│   │   ├── Footer.jsx
│   │   └── AdminLayout.jsx       # Admin sidebar + auth guard
│   ├── context/
│   │   ├── CartContext.jsx       # Cart state + localStorage
│   │   └── AuthContext.jsx       # Supabase Auth + staff lookup
│   ├── lib/
│   │   ├── supabase.js           # Supabase client
│   │   └── activity.js           # Activity log helper
│   ├── pages/
│   │   ├── Home.jsx, Menu.jsx, Cart.jsx, Checkout.jsx
│   │   ├── OrderSuccess.jsx, Track.jsx, Reservations.jsx, NotFound.jsx
│   │   └── admin/
│   │       ├── Login.jsx, Dashboard.jsx, Orders.jsx, Reservations.jsx
│   │       ├── Products.jsx, Categories.jsx, Inventory.jsx, Staff.jsx
│   │       ├── Reports.jsx, Settings.jsx, Activity.jsx, Profile.jsx
│   ├── styles/
│   │   ├── global.css            # Design system + public pages
│   │   └── admin.css             # Admin shared styles
│   ├── App.jsx                   # Router
│   └── main.jsx                  # Entry point
├── .env.example
├── index.html
├── package.json
├── supabase-schema.sql
└── vite.config.js
```

---

## Default Login

After running the schema and creating the Auth users as described above:

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | rj@rjscafe.ph     | admin123 |
| Staff | maria@rjscafe.ph  | staff123 |

Change these in production. You can change your own password from the Profile page once logged in.

---

## Adding More Staff Later

Two steps are required:
1. In the admin panel → **Staff → Add Staff**: enter their info (creates the database row)
2. In Supabase → **Authentication → Users → Add user**: create with the **same email** you used above. Auto-confirm.

They can now sign in. The auth context matches the auth user's email to the staff row.

---

## Notes

- **Row Level Security** is enabled on all tables. Public has read-only access for the guest flow; authenticated users (logged-in staff) get full access.
- **Storage bucket** for product images is public-readable (anyone can view the URL) but only authenticated users can upload/delete.
- **Cart** is local to each browser (localStorage), not stored in the database until checkout.
- **Reports** are computed client-side from completed orders — fine for hundreds of orders, would need optimization at scale.
