# Ledger

A personal expense tracker: dashboard, add-transaction flow, transaction history, and spending insights. Built with React + Vite, stored in Supabase, deployable for free on Vercel, and installable on your iPhone home screen as a PWA.

This app is meant for **one user (you)** — sign-up creates your own private account, and every row in the database is locked to your user ID.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is enough).
2. Create a new project (pick any name/region; save the database password somewhere safe, though you won't need it directly).
3. Once the project is ready, open **SQL Editor** → **New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `transactions` table with row-level security so only you can ever read or write your own rows.
4. (Recommended for a single-user app) Go to **Authentication → Providers → Email** and turn **off** "Confirm email" — this lets you sign up and start using the app immediately without clicking an email confirmation link. If you leave it on, check your inbox after signing up.
5. Go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key — you'll need both next.

## 2. Configure the app locally

```bash
cp .env.example .env
```

Edit `.env` and paste in your values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Then install and run it locally to try it out:

```bash
npm install
npm run dev
```

Open the printed local URL, sign up with your own email + password, and you're in. Use **Profile → Set Opening Balance** first to seed your starting balance, then add transactions from the **+** tab.

## 3. Put it on GitHub

```bash
git init   # skip if already a git repo
git add .
git commit -m "Initial commit"
```

Create a new empty repository on [github.com/new](https://github.com/new) (don't initialize it with a README), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 4. Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up/log in with your GitHub account.
2. Click **Add New → Project**, and import the repository you just pushed.
3. Vercel auto-detects Vite — leave the build settings as-is.
4. Before deploying, add the environment variables (**Environment Variables** section): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, same values as your `.env`.
5. Click **Deploy**. In about a minute you'll get a live URL like `ledger-yourname.vercel.app`.

Any time you push new commits to `main`, Vercel redeploys automatically.

## 5. Install it on your iPhone

1. Open your Vercel URL in **Safari** on your iPhone.
2. Sign up/sign in once.
3. Tap the **Share** button → **Add to Home Screen**.
4. Launch it from the home screen icon — it opens full-screen, like a real app, with its own icon.

## Notes on how the data model works

- There's no separate "balance" field — your current balance is simply the sum of all transactions (income adds, expense subtracts). Set your starting point once via **Profile → Set Opening Balance**, which is stored as a normal transaction dated whenever you started tracking.
- "Weekly Spend" and "SIP / Invest" are treated as recurring: the **Next Due** figures on the Dashboard and Insights screens are computed from your *last logged transaction* in that category plus the interval (7 days / 1 month) — there's no background job, so due dates only stay accurate as long as you keep logging those transactions when they happen.
- Editing/deleting works everywhere: swipe-style reveal (tap a row) in **History**.
