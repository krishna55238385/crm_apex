#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database connection..."
until nc -z -v -w30 ${DB_HOST:-localhost} ${DB_PORT:-3306}
do
  echo "Waiting for database connection..."
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Start the application
echo "Starting application..."
exec pm2-runtime start ecosystem.config.js
