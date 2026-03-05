# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
COPY apps/client ./apps/client

RUN npm ci

# Build shared, client, then server
RUN npm run build -w packages/shared
RUN npm run build -w apps/client
RUN npm run build -w apps/server

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/apps/server/dist ./server/dist
COPY --from=builder /app/apps/client/dist ./client/dist
COPY --from=builder /app/apps/server/package.json ./server/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/server

EXPOSE 5000

CMD ["node", "dist/index.cjs"]
