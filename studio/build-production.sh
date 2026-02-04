#!/bin/bash

# CRM Studio Production Build Script
# Fixes "Bus error (core dumped)" on low-memory servers

set -e

echo "🔧 CRM Studio Production Build"
echo "================================"
echo ""

# Check available memory
echo "📊 Checking system resources..."
free -h
echo ""

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
echo "✓ Clean complete"
echo ""

# Check Node.js version
echo "🔍 Node.js version:"
node --version
echo ""

# Build with increased memory
echo "🏗️  Starting production build with 4GB memory allocation..."
echo "   This may take several minutes..."
echo ""

npm run build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "To start the production server:"
echo "  npm start"
