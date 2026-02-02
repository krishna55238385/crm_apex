FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install PM2 globally for process management
RUN npm install -g pm2

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
# Ensure ecosystem config is copied
COPY ecosystem.config.js . 
# Copy generated prisma client
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Security: Run as non-root user
USER node

EXPOSE 3000

# Launch with PM2 for clustering and restart capabilities
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
