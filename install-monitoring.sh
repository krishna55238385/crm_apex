#!/bin/bash

echo "🔧 Fixing NPM Cache and Installing Monitoring Packages"
echo "========================================================"
echo ""

# Fix npm cache permissions
echo "Step 1: Fixing npm cache permissions..."
sudo chown -R $(whoami) ~/.npm

# Clean problematic cache files
echo "Step 2: Cleaning npm cache..."
sudo rm -rf ~/.npm/_cacache/content-v2/sha512/99/ab/cb9546f881fa4c00243f5b14e1a657380d859f2ff80a050cec2115798ee16d47c975b7d6ca4952409228d52637fa7fdf313c22d7b94a1c8d9afdc4d0f05a 2>/dev/null || true

# Navigate to server directory
cd "$(dirname "$0")/server" || exit 1

# Install packages
echo "Step 3: Installing monitoring packages..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart your server: cd server && npm run dev"
echo "2. Test metrics endpoint: curl http://localhost:3000/metrics"
echo "3. Check server logs for '✅ Sentry initialized' and '✅ Prometheus metrics initialized'"
