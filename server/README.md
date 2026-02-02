# ApexAI CRM - Server

The backend service for ApexAI CRM. It provides a RESTful API, manages database interactions via Prisma, and handles background job processing with BullMQ.

## 🛠️ Technology Stack

- **Runtime:** Node.js v20+
- **Framework:** Express 5
- **Database:** MySQL 8.0 (via Prisma ORM)
- **Caching & Queues:** Redis (via BullMQ)
- **Validation:** Zod
- **Testing:** Jest + Supertest

## 🔧 Configuration

Create a `.env` file in this directory based on `.env.example`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API Server Port | `3000` |
| `DATABASE_URL` | Prisma Connection String | `mysql://root:root@localhost:3306/crm` |
| `REDIS_URL` | Redis Connection String | `redis://localhost:6379` |
| `GEMINI_API_KEY` | Google AI Studio Key | `AIzaSy...` |
| `FIREBASE_PROJECT_ID` | Firebase Config | `crm-d7d25` |

## 🚀 Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Ensure your MySQL container is running, then push the schema:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start Server
```bash
npm run dev
# Server will start on http://localhost:3000
```

### 4. Running Tests
We use **Jest** for unit and integration testing.
```bash
npm test
```
To view code coverage, check the `coverage/` directory after running tests.

## 🗄️ Database Management (Prisma)

- **View Data (GUI):** `npx prisma studio`
- **Migration:** `npx prisma migrate dev`
- **Reset:** `npx prisma migrate reset`

## 📡 API Documentation

The API uses standard REST conventions.
- **Base URL:** `/api`
- **Auth:** Bearer Token via `Authorization` header.

### Key Endpoints
- `POST /api/leads` - Create a new lead (Triggers AI enrichment).
- `GET /api/dashboard/stats` - Fetch real-time dashboard metrics.
- `POST /api/workflows/trigger` - Manually trigger a workflow event.
