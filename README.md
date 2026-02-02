# ApexAI CRM

**ApexAI CRM** is an enterprise-grade Customer Relationship Management system powered by advanced AI. It features intelligent lead enrichment, predictive deal scoring, and automated workflow orchestration to supercharge sales teams.

---

## 🏗️ Architecture

The system is built as a distributed application with a clear separation of concerns:

```mermaid
graph TD
    User[User / Client] --> Studio[Studio (Frontend)\nNext.js 15 + ShadCN]
    Studio --> Server[Server (Backend)\nExpress + Node.js]
    Server --> DB[(MySQL / Prisma)]
    Server --> Redis[(Redis)]
    Server --> BullMQ[BullMQ Workers]
    BullMQ --> External[External APIs\n(OpenAI, Google Gemini, Firebase)]
```

- **Studio (`/studio`):** A modern, responsive frontend built with Next.js 15, Tailwind CSS, and ShadCN UI.
- **Server (`/server`):** A robust Node.js/Express backend that handles API requests, authentication, and business logic.
- **Database:** MySQL relational database managed via Prisma ORM.
- **Async Processing:** Redis-backed queues (BullMQ) for heavy tasks like AI processing and email notifications.

---

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** (Recommended) OR Node.js v20+ & MySQL & Redis installed locally.

### Option 1: Docker (Fastest)

1.  **Start all services:**
    ```bash
    docker-compose up -d --build
    ```
2.  **Access the application:**
    - Frontend: `http://localhost:9002`
    - Backend: `http://localhost:3000`

### Option 2: Manual Setup

If you prefer running services individually for development:

1.  **Start Infrastructure (DB & Redis):**
    ```bash
    docker-compose up -d db redis
    ```

2.  **Start Backend:**
    ```bash
    cd server
    npm install
    npx prisma generate
    npx prisma db push # Update DB schema
    npm run dev
    ```

3.  **Start Frontend:**
    ```bash
    # Open a new terminal
    cd studio
    npm install
    npm run dev
    ```

---

## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, ShadCN UI, Recharts |
| **Backend** | Node.js, Express 5, Prisma ORM, BullMQ |
| **Database** | MySQL 8.0 |
| **Cache/Queue** | Redis |
| **Authentication** | Firebase Admin SDK, Custom JWT Middleware |
| **Testing** | Jest, Supertest |
| **CI/CD** | GitHub Actions |

---

## 🤝 Contribution

Please verify your changes before pushing:

1.  **Run Backend Tests:**
    ```bash
    cd server && npm test
    ```
2.  **Verify Frontend Build:**
    ```bash
    cd studio && npm run build
    ```
# b4apex
# b4apex
# crm_apex
