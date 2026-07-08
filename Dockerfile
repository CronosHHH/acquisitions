# syntax=docker/dockerfile:1

# ---- Base -------------------------------------------------------------
# Shared base layer with production dependencies installed. Alpine keeps
# the image small; Node 20 matches the project's ESM/engine requirements.
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- Dependencies (prod only) -----------------------------------------
FROM base AS deps
RUN npm ci --omit=dev

# ---- Dependencies (with devDependencies, used for dev/build) ---------
FROM base AS deps-dev
RUN npm ci

# ---- Development -------------------------------------------------------
# Runs the app with --watch against source mounted from the host, and
# includes devDependencies (eslint, drizzle-kit, etc).
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "--watch", "src/index.js"]

# ---- Production ---------------------------------------------------------
# Minimal runtime image: only production dependencies and app source,
# running as a non-root user.
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

EXPOSE 3000
CMD ["npm", "start"]
