# Unseen Hours CreatorOps — Online Cloud Hosting & Deployment Guide

This guide will help you host **Unseen Hours CreatorOps** online so multiple team members across different cities and new customer agencies can access it via a live HTTPS web link.

---

## 🚀 Option 1: Deploy on Render.com (Recommended — 100% Free & Automatic SSL)

Render provides free cloud hosting for Node.js apps with automatic HTTPS certificates and zero server maintenance.

### Steps:
1. Push your `creatorops` project folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: multi-tenant backend and creatorops cloud"
   git remote add origin https://github.com/YOUR_USERNAME/creatorops.git
   git push -u origin main
   ```
2. Go to **[render.com](https://render.com)** and sign up for a free account.
3. Click **New +** → **Web Service**.
4. Select your **`creatorops`** GitHub repository.
5. Configure the service:
   - **Name**: `unseenhours-creatorops`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node --import tsx/esm server/src/index.ts`
   - **Instance Type**: `Free`
6. Add Environment Variable:
   - `JWT_SECRET`: `any_long_random_secure_string_12345`
   - `NODE_ENV`: `production`
7. Click **Deploy Web Service**!
8. Within 2 minutes, you will receive your live URL (*e.g., `https://unseenhours-creatorops.onrender.com`*)!

---

## ⚡ Option 2: Deploy on Railway.app (1-Click Docker Deploy)

Railway provides instant container deployment from Dockerfile.

### Steps:
1. Push your code to GitHub.
2. Open **[railway.app](https://railway.app)**.
3. Click **New Project** → **Deploy from GitHub repo**.
4. Select `creatorops`.
5. Railway will automatically detect the included `Dockerfile` and build both frontend & backend.
6. Click **Generate Domain** in Settings to get your public HTTPS domain.

---

## 🔒 Default Admin Credentials & Multi-Tenant Onboarding

Once hosted online:
- **Default Agency**: **Unseen Hours**
- **Default Admin Email**: `admin@unseenhours.com`
- **Default Password**: `admin123`

### Onboarding New Agency Customers:
Any new agency can visit your hosted URL, click **"Switch Workspace"** → **"Create New Agency"**, and immediately generate their own isolated agency workspace!
- Data is strictly partitioned by `agency_id` so one agency can never view another agency's rates, creators, or brand contracts.

---

## 📅 Live Google Calendar Sync URL for Multi-City Teams
Team members in Delhi, Mumbai, Bangalore, or London can subscribe to the live `.ics` feed in Google Calendar by going to:
`https://YOUR_DOMAIN.com/api/calendar/feed.ics`
In Google Calendar, click **Other Calendars (+)** → **From URL** and paste this link!
