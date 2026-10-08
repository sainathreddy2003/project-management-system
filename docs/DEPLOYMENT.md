# Production Deployment Guide
### Project Management System (PMS) — Cloud PaaS & Containerization

This guide provides end-to-end instructions for deploying the **Project Management System** (React Vite Web App, Node.js Express REST API, and MySQL relational database) to production cloud platforms.

---

## 1. Architecture Overview

```
                                      +--------------------------+
                                      |   Browser / Client       |
                                      +-------------+------------+
                                                    |
                         +--------------------------+--------------------------+
                         | (Static Asset CDN)                                  | (REST API Calls)
                         v                                                     v
          +-------------------------------+                     +-------------------------------+
          |         Vercel / Netlify      |                     |        Render / Railway       |
          |       React (Vite) Web SPA    |                     |      Node.js / Express API    |
          |  (dist/ + SPA rewrite rules)  |                     |    Port: 5001 (or $PORT)      |
          +-------------------------------+                     +---------------+---------------+
                                                                                |
                                                                                | (TLS/SSL Connection)
                                                                                v
                                                                +-------------------------------+
                                                                |        Cloud MySQL DB         |
                                                                |   (Railway / Aiven / Planet)  |
                                                                |   project_management_db       |
                                                                +-------------------------------+
```

---

## 2. Deployment Strategies

| Component | Recommended Platform | Alternative | Cost |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | **Vercel** / **Netlify** | Render Static Site, Cloudflare Pages | Free |
| **Backend REST API** | **Render** (Web Service) | **Railway**, Fly.io, Heroku | Free / Low-tier |
| **MySQL Database** | **Railway MySQL** / **Aiven** | Render PostgreSQL / PlanetScale / AWS RDS | Free / Low-tier |
| **Full Stack (All-in-one)** | **Railway** or **Docker Compose** | Single VPS (Ubuntu + Nginx + PM2) | $5/month VPS |

---

## 3. Guide A: Vercel (Frontend) + Render (Backend) + Cloud MySQL (Recommended)

This is the most common, cost-effective, and performant cloud PaaS setup.

### Step 1: Provision the MySQL Database
1. Create a free MySQL database on [Railway](https://railway.app), [Aiven](https://aiven.io), or [Supabase/PlanetScale].
2. Copy the MySQL connection URI or individual credentials:
   - `DATABASE_URL`: `mysql://<user>:<password>@<host>:<port>/<dbname>`
   - If TLS/SSL is required by the provider, set `DB_SSL=true`.

### Step 2: Deploy Backend API on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `pms-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5001`
   - `DATABASE_URL`: *(Your cloud MySQL connection string from Step 1)*
   - `DB_SSL`: `true` *(or `false` depending on provider requirement)*
   - `JWT_SECRET`: *(A random 64-character secret, e.g. `openssl rand -hex 32`)*
   - `JWT_EXPIRES_IN`: `15m`
   - `REFRESH_EXPIRES_DAYS`: `7`
   - `CORS_ORIGIN`: `https://*.vercel.app,http://localhost:5173` *(update with your actual Vercel domain in Step 4)*
   - `AUTO_SEED`: `true` *(Optional: set to `true` on first deploy to populate demo accounts)*
5. Click **Create Web Service**.
6. Wait for the build and deployment to complete. Render will display your live URL (e.g., `https://pms-backend.onrender.com`).
7. Verify by opening `https://pms-backend.onrender.com/health` in your browser. You should receive:
   ```json
   {
     "status": "ok",
     "service": "pms-backend",
     "env": "production",
     "timestamp": "..."
   }
   ```

### Step 3: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `web` *(Note: `vercel.json` is provided in both root and `web` for fail-safe resolution)*.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://pms-backend.onrender.com/api` *(Your Render backend URL from Step 2)*
5. Click **Deploy**.
6. Vercel will build the React bundle and deploy it globally to edge CDN nodes.

### Step 4: Finalize CORS on Render
1. Copy your live Vercel domain (e.g., `https://project-management-system-client.vercel.app`).
2. Go back to Render -> `pms-backend` -> **Environment**.
3. Update `CORS_ORIGIN` to include your Vercel domain:
   `https://project-management-system-client.vercel.app,https://*.vercel.app`
4. Render will automatically redeploy with the updated CORS rules.

---

## 4. Guide B: Railway All-in-One Deployment

Railway allows deploying MySQL, Backend, and Frontend within the same project.

1. Open [Railway](https://railway.app) and create a **New Project**.
2. Click **Provision MySQL**. Railway will create a private MySQL service and expose `MYSQL_URL` automatically.
3. Click **New Service** -> **GitHub Repo**.
   - Set **Root Directory**: `backend`
   - Railway will detect `railway.json` and `backend/package.json`.
   - In Variables, reference the MySQL database:
     - `DATABASE_URL`: `${{MySQL.MYSQL_URL}}`
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: `your-random-jwt-secret-key-32-chars`
     - `CORS_ORIGIN`: `*`
     - `AUTO_SEED`: `true`
   - In Settings, click **Generate Domain** to get your backend public URL.
4. Click **New Service** -> **GitHub Repo** (for Frontend):
   - Set **Root Directory**: `web`
   - In Variables, add:
     - `VITE_API_URL`: `${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api`
   - In Settings, click **Generate Domain**.

---

## 5. Guide C: Render Blueprint (`render.yaml`)

We have included a turnkey `render.yaml` specification at the repository root.

1. Push this repository to your GitHub account.
2. In [Render](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select this repository and branch.
4. Render will parse `render.yaml` and configure:
   - `pms-backend` (Node Web Service)
   - `pms-web` (Static Site with SPA rewrite rules)
5. Fill in your MySQL connection URL and click **Apply**.

---

## 6. Guide D: Self-Hosted / Production Docker Compose

For deploying onto a cloud VPS (e.g. DigitalOcean Droplet, AWS EC2, Hetzner, Linode):

1. Clone repository to server:
   ```bash
   git clone <repo-url> /opt/pms
   cd /opt/pms
   ```
2. Build and launch all 3 services (MySQL, Backend, Nginx Web):
   ```bash
   docker compose up -d --build
   ```
3. Check container status:
   ```bash
   docker compose ps
   ```
4. Access endpoints:
   - **Web Application**: `http://<server-ip>:3000`
   - **Backend API**: `http://<server-ip>:5001/api`
   - **API Health**: `http://<server-ip>:5001/health`

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Runtime mode (`production` disables dev stack traces) |
| `PORT` | No | `5001` | Port Express listens on (overridden by Cloud PaaS $PORT) |
| `DATABASE_URL` | Cloud | - | Full connection URL (`mysql://user:pass@host:port/db`) |
| `DB_HOST` | Local | `localhost` | MySQL host (used if `DATABASE_URL` is omitted) |
| `DB_PORT` | Local | `3306` | MySQL port |
| `DB_USER` | Local | `root` | MySQL user |
| `DB_PASSWORD` | Local | `""` | MySQL password |
| `DB_NAME` | Local | `project_management_db` | MySQL database name |
| `DB_SSL` | Optional | `false` | Enable TLS/SSL (`true` for Aiven / PlanetScale) |
| `AUTO_SEED` | Optional | `false` | If `true`, seeds demo users on initial startup |
| `JWT_SECRET` | Yes | - | Secret key for signing JSON Web Tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `15m` | Lifetime of access tokens |
| `REFRESH_EXPIRES_DAYS` | No | `7` | Lifetime of refresh tokens |
| `CORS_ORIGIN` | Yes | `*` | Comma-separated allowed frontend origins |

### Web Frontend (`web/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | `http://localhost:5001/api` | Base URL pointing to deployed backend API |

---

## 8. Post-Deployment Verification & Smoke Test

Once deployed, verify full functionality:

1. **Uptime & Health Check**:
   ```bash
   curl -i https://<your-backend-domain>/health
   ```
   Should return `HTTP/1.1 200 OK` with `{"status":"ok"}`.

2. **CORS Preflight Verification**:
   ```bash
   curl -i -X OPTIONS https://<your-backend-domain>/api/auth/login \
     -H "Origin: https://<your-frontend-domain>" \
     -H "Access-Control-Request-Method: POST"
   ```
   Should return `HTTP/1.1 204 No Content` or `200 OK` with matching `Access-Control-Allow-Origin`.

3. **SPA Deep-Linking / Refresh Test**:
   - In browser, visit `https://<your-frontend-domain>/login`
   - Refresh the page (F5 / Cmd+R)
   - Ensure the login form displays without a 404 Not Found error.

4. **Default Seed Credentials (if seeded)**:
   - **Alex Chen (Lead Developer)**: `alex.dev@example.com` / `Password123!`
   - **Jordan Taylor (QA Auditor)**: `jordan.qa@example.com` / `Password123!`
