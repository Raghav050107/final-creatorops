# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml .npmrc* ./

# Install all dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build Vite frontend bundle
RUN pnpm build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built frontend assets and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3001

# Run Node.js SaaS server
CMD ["node", "--import", "tsx/esm", "server/src/index.ts"]
