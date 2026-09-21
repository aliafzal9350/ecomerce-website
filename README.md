# AI-Powered Luxury E-Commerce Platform & Shopify-Grade Analytics

A modern, high-performance decoupled e-commerce architecture tailored for inspired luxury goods (perfumes, handbags, footwear/heels, and watches) with sub-second OLAP behavioral analytics.

---

## 🏗️ Architectural Blueprint

```
[ Next.js 15 Storefront (Port 3000) ] 
       │ 
       ├── (User Telemetry / Funnel Events) ──► [ Ingestion Route ] ──► [ ClickHouse OLAP (Port 8123) ] ──► [ Shopify-Grade Dashboard ]
       │
       └── (Cart / Checkout / Auth / Catalog) ──► [ Medusa v2 Engine (Port 9000) ] ──► [ PostgreSQL 16 pgvector (Port 5433) ]
                                                              │
                                                      [ Event Subscriber ]
                                                              │
                                                              ▼
                                                      [ FastAPI AI Engine (Port 8008) ]
                                                (Olfactory & Cross-Category Stylist)
```

---

## 📁 Repository Structure & Port Allocation

| Service | Host Port | Container / Target Port | Description |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 16 (pgvector)** | `5433` | `5432` | OLTP database (`medusa_luxury`) with vector indexing |
| **Redis 7** | `6380` | `6379` | Medusa cache & pub/sub event bus |
| **ClickHouse OLAP** | `8123` / `9004` | `8123` / `9000` | Sub-second behavioral telemetry & conversion funnels |
| **Medusa v2 API & Admin** | `9000` | `9000` | Commerce core and web administration panel |
| **Next.js 15 Storefront** | `3000` | `3000` | React Server Components, Tailwind, luxury PDPs |
| **FastAPI AI Microservice** | `8008` | `8008` | Scent profiling, vector search, cross-category lookbook |

---

## 🚀 Quickstart: Running Locally

### 1. Database & Analytics Infrastructure (Already Running)
The Docker containers are active:
```powershell
docker ps --filter "name=medusa" --filter "name=ecommerce"
```
To restart them anytime:
```powershell
docker compose up -d
```

---

### 2. Database Migrations & Admin (Already Completed)
- Database schema and initial seed data have been migrated to `medusa_luxury`.
- Admin user has been created:
  - **Email**: `admin@luxury.com`
  - **Password**: `adminpassword`
- Default Publishable API Key is pre-configured in `backend/apps/storefront/.env.local`.

---

### 3. Start the Platform
To start both the Medusa v2 backend and the Next.js storefront simultaneously:

```powershell
cd "c:\Users\User\Desktop\ecommerce website\backend"
npm run dev
```

Or start them individually in separate terminals:

**A. Medusa v2 API & Admin Dashboard:**
```powershell
cd "c:\Users\User\Desktop\ecommerce website\backend"
npm run backend:dev
```
- Admin Dashboard: [http://localhost:9000/app](http://localhost:9000/app) *(Log in with `admin@luxury.com` / `adminpassword`)*
- Health Check: [http://localhost:9000/health](http://localhost:9000/health)

**B. Next.js 15 Luxury Storefront:**
```powershell
cd "c:\Users\User\Desktop\ecommerce website\backend"
npm run storefront:dev
```
- Storefront: [http://localhost:3000](http://localhost:3000)

---

### 4. (Optional) Start the Python AI Microservice
In a separate terminal:
```powershell
cd "c:\Users\User\Desktop\ecommerce website\ai-service"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8008
```
- Interactive Swagger docs: [http://localhost:8008/docs](http://localhost:8008/docs)

---

## 📊 Shopify-Grade Analytics Queries
You can run the analytical SQL queries in [`analytics/queries.sql`](./analytics/queries.sql) against ClickHouse directly via HTTP (`http://localhost:8123`) or native client (`localhost:9004`):
1. **Full 5-stage conversion funnels** with drop-off rates.
2. **First-touch vs. Last-touch UTM acquisition reports**.
3. **Category & Scent Family performance**.
4. **Live Stream View** (real-time active sessions & cart values in the last 10 minutes).
