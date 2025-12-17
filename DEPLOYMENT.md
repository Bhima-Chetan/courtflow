# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub account
2. Vercel account (free at vercel.com)
3. Database provider account (Neon or Supabase recommended for free tier)

### Steps

#### 1. Set Up Database
Choose one option:

**Option A: Neon (Recommended)**
1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

**Option B: Supabase**
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (Connection pooling mode recommended)

**Option C: Vercel Postgres**
1. In Vercel dashboard, go to Storage tab
2. Create Postgres database
3. Copy the connection string

#### 2. Push to GitHub
```bash
cd courtflow
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 3. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
4. Add Environment Variables:
   - Key: `DATABASE_URL`
   - Value: Your database connection string from step 1
5. Click **Deploy**

#### 4. Set Up Database Schema
After first deployment, run these commands in Vercel:

**Using Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npm run db:push
npm run db:seed
```

**Or using Vercel Dashboard:**
1. Go to your project > Settings > Environment Variables
2. Open a terminal in your project
3. Run:
```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npm run db:push
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npm run db:seed
```

#### 5. Verify Deployment
1. Visit your Vercel deployment URL (e.g., `courtflow.vercel.app`)
2. Test booking a court
3. Check admin dashboard

---

## Alternative: Deploy to Railway

### Steps
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL service:
   - Click "+ New" > "Database" > "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL`
6. In your app service, add these commands:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
7. Add deployment command (run once):
   - In Railway CLI or dashboard, run: `npm run db:push && npm run db:seed`

---

## Alternative: Deploy to Render

### Steps
1. Go to https://render.com
2. Create PostgreSQL database:
   - New > PostgreSQL
   - Copy the **Internal Database URL**
3. Create Web Service:
   - New > Web Service
   - Connect your GitHub repository
   - Configure:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
4. Add Environment Variable:
   - Key: `DATABASE_URL`
   - Value: Your database internal URL
5. After first deploy, open Shell and run:
```bash
npm run db:push
npm run db:seed
```

---

## Environment Variables Required

Only one environment variable is needed for production:

- `DATABASE_URL` - PostgreSQL connection string

Example formats:
```
# Neon
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres?pgbouncer=true"

# Railway
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
```

---

## Post-Deployment Checklist

- [ ] Database schema created (`npm run db:push`)
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] Site loads at deployment URL
- [ ] Can create a booking
- [ ] Can view bookings
- [ ] Admin dashboard accessible at `/admin`
- [ ] Pricing rules working correctly

---

## Troubleshooting

### Build fails with "DATABASE_URL not found"
- Make sure you added `DATABASE_URL` in environment variables
- Redeploy after adding the variable

### Database connection fails
- Check that your connection string includes `?sslmode=require` for Neon
- For Supabase, use the pooling connection string
- Verify database is in the same region or allow external connections

### Seed command fails
- Run `npx prisma generate` first
- Make sure `DATABASE_URL` is set correctly
- Check database is accessible from your deployment platform

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Railway/Render
1. Go to Settings > Domains
2. Add custom domain
3. Update DNS records as instructed
