# ApexAI Studio - Frontend

The modern frontend interface for ApexAI CRM, designed with a focus on premium aesthetics and responsive user experience.

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **State Management:** React Hooks
- **Data Visualization:** Recharts
- **Icons:** Lucide React

## 🔧 Configuration

Create a `.env` file (or `.env.local`) with the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `INTERNAL_API_URL` | SSR Backend URL | `http://server:3000/api` |
| `NEXT_PUBLIC_FIREBASE_...` | Firebase Config | *(See Firebase Console)* |

## 🚀 Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
# Frontend runs on http://localhost:9002
```

### 3. Linting & Type Checking
We prefer "Standard" config. Use these commands to verify code quality:
```bash
npm run lint
npm run typecheck
```

## 📂 Project Structure

- **`src/app`**: Next.js App Router pages and layouts.
- **`src/components`**: Reusable UI components (buttons, cards, etc.).
- **`src/lib`**: Utility functions and API clients.
- **`src/hooks`**: Custom React hooks for logic reuse.
- **`docs`**: detailed design blueprints and feature specs.

## 🎨 Contribution Guidelines

1.  **Strict Typing:** Avoid `any` types. Define interfaces for all data structures.
2.  **Components:** Use the provided ShadCN components in `@/components/ui` whenever possible to maintain design consistency.
3.  **Responsiveness:** Ensure all new pages work on Mobile, Tablet, and Desktop.
