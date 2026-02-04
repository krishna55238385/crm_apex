# Developer Onboarding Guide

Welcome to the CRM development team! This guide will help you get set up and productive quickly.

---

## 🚀 Quick Start (30 minutes)

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 20+ installed
- **npm** or **yarn**
- **Git**
- **Docker** (optional, for local services)
- **VS Code** (recommended)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd CRM
```

### Step 2: Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp server/.env.example server/.env

# Edit .env files with your credentials
# You'll need:
# - Firebase credentials
# - Gemini API key
# - Database connection (or use Docker)
```

### Step 3: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../studio
npm install
```

### Step 4: Database Setup

**Option A: Use Docker (Recommended)**
```bash
docker-compose up -d mysql redis
```

**Option B: Local MySQL**
```bash
# Install MySQL 8.0
# Create database
mysql -u root -p
CREATE DATABASE crm;
```

### Step 5: Run Migrations

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### Step 6: Start Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd studio
npm run dev
```

### Step 7: Verify Setup

- Backend: http://localhost:3000/health
- Frontend: http://localhost:9002
- API Docs: http://localhost:3000/api-docs

---

## 📁 Project Structure

```
CRM/
├── server/                 # Backend (Node.js/Express)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utilities
│   ├── prisma/            # Database schema
│   ├── tests/             # Tests
│   └── package.json
│
├── studio/                # Frontend (Next.js/React)
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── styles/       # CSS/Tailwind
│   └── package.json
│
├── infrastructure/        # AWS/Terraform
│   ├── terraform/        # Infrastructure as Code
│   └── scripts/          # Deployment scripts
│
├── docs/                 # Documentation
├── .github/              # GitHub Actions
└── docker-compose.yml    # Local development
```

---

## 🛠️ Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

### Code Review Process

1. Create PR with clear description
2. Ensure all CI checks pass
3. Request review from team
4. Address feedback
5. Merge when approved

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd server
npm test                    # All tests
npm run test:integration    # Integration tests
npm run test:coverage       # With coverage

# E2E tests
npx playwright test
```

### Writing Tests

```typescript
// Integration test example
describe('Leads API', () => {
  it('should create a new lead', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({ name: 'Test Lead', email: 'test@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

---

## 🎨 Code Style

### ESLint & Prettier

```bash
# Lint code
cd server
npm run lint

# Format code
npm run format

# Auto-fix issues
npm run lint:fix
```

### TypeScript

- Use strict mode
- Avoid `any` type
- Define interfaces for data structures
- Use type inference when possible

### Best Practices

- **DRY**: Don't Repeat Yourself
- **SOLID**: Follow SOLID principles
- **Comments**: Write self-documenting code
- **Error Handling**: Always handle errors
- **Security**: Validate all inputs

---

## 🐛 Debugging

### VS Code Debug Configuration

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "cwd": "${workspaceFolder}/server"
}
```

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Database Connection Error
```bash
# Check MySQL is running
docker ps | grep mysql

# Check connection string in .env
DATABASE_URL="mysql://user:password@localhost:3306/crm"
```

#### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Resources

### Documentation
- [API Documentation](http://localhost:3000/api-docs)
- [Architecture](../architecture/system-architecture.md)
- [Deployment Guide](../deployment/aws-deployment.md)

### External Resources
- [Express.js](https://expressjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 🆘 Getting Help

- **Slack**: #crm-dev
- **Email**: dev-team@yourdomain.com
- **GitHub Issues**: For bugs and features
- **Wiki**: Internal documentation

---

## ✅ Checklist

Before submitting your first PR:

- [ ] Code runs locally without errors
- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Added tests for new features
- [ ] Updated documentation
- [ ] Followed commit message convention
- [ ] PR description is clear

---

Welcome aboard! 🎉
