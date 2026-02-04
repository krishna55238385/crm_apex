#!/bin/bash

echo "🔄 Restarting CRM Development Servers..."

# Kill processes on port 3000 (backend)
echo "Stopping backend server (port 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Kill processes on port 9002 (frontend)
echo "Stopping frontend server (port 9002)..."
lsof -ti:9002 | xargs kill -9 2>/dev/null
sleep 1

echo "✅ All servers stopped"
echo ""
echo "To restart:"
echo "  Backend:  cd server && npm run dev"
echo "  Frontend: cd studio && npm run dev"
