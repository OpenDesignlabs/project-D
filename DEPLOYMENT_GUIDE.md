# Vectra Monorepo Deployment Guide

This guide outlines how to deploy the Vectra interconnected monorepo (PNPM Workspaces) to production environments.

The repository consists of:
1. `vectra-types`: Shared TypeScript definitions (build dependency).
2. `vectra-server`: Node.js/Hono backend API framework.
3. `vectra-marketplace`: Next.js web application.
4. `vectra-studio`: Vite + React web app containing Rust WASM modules.

Because they are tightly coupled via the PNPM workspace (`pnpm-workspace.yaml`), any service being deployed needs access to the root `pnpm-lock.yaml` and `vectra-types` to build synchronously.

## Architecture

*   **Frontend 1 (`vectra-marketplace`)**: A Server-Side Rendered (SSR) Next.js app.
*   **Frontend 2 (`vectra-studio`)**: A Client-Side Single Page App (SPA) built with Vite (with WASM).
*   **Backend (`vectra-server`)**: A Node.js persistent service.

## Method 1: The Modern Cloud-Native Approach (PaaS)

This approach utilizes platforms like Vercel (for frontends) and Render/Railway (for backend) which natively support monorepos.

### 1. Deploying the Backend (`vectra-server`) onto Railway or Render
Your backend is a persistent Node API.
1. Connect your GitHub repository to **Railway** or **Render**.
2. **Root Directory:** Set to `/` (Root of the repo, not the server folder, so it has access to `pnpm-workspace.yaml`).
3. **Build Command:** 
   ```bash
   npm i -g pnpm && pnpm install && pnpm --filter vectra-types build && pnpm --filter vectra-server build
   ```
4. **Start Command:**
   ```bash
   cd vectra-server && pnpm run start
   ```
5. **Environment Variables:** Provide your Supabase keys and `.env` equivalents.

### 2. Deploying `vectra-marketplace` (Next.js) onto Vercel
Vercel is optimized for Next.js and has built-in PNPM workspace support.
1. Create a new Vercel project, select the GitHub repo.
2. **Root Directory:** Select `vectra-marketplace`.
3. Vercel will auto-detect Next.js.
4. **Override Build Command:** Vercel needs to build `types` first.
   ```bash
   cd .. && pnpm --filter vectra-types build && cd vectra-marketplace && pnpm run build
   ```
5. **Environment Variables:** Point your `NEXT_PUBLIC_API_URL` to the Render/Railway URL of `vectra-server`.

### 3. Deploying `vectra-studio` onto Vercel (or Netlify/Cloudflare Pages)
*Note: Since `vectra-studio` requires building a WASM engine (`wasm-pack build`), the deployment pipeline needs Rust installed.*
1. Connect repo to Vercel.
2. **Root Directory:** Select `vectra-studio`.
3. **Build Command:** Note that we install Rust and `wasm-pack` before running `pnpm build`.
   ```bash
   # Install Rust and wasm-pack, build types, then build studio
   curl https://sh.rustup.rs -sSf | sh -s -- -y && source "$HOME/.cargo/env" && curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh && cd .. && pnpm --filter vectra-types build && cd vectra-studio && pnpm run build
   ```
4. **Output Directory:** `dist`.
5. **Environment Variables:** Add `VITE_API_URL` pointing to your backend URL.

---

## Method 2: Containerization (Docker) + VPS Setup

If you prefer deploying everything on a single VPS (like DigitalOcean, AWS EC2, or Hetzner), you can use Docker Compose. This strategy prevents "works on my machine" issues by packaging everything.

### Step 1: Create a unified `docker-compose.yml`

Create a `docker-compose.yml` at the root of `project-v`:

```yaml
version: '3.8'

services:
  vectra-server:
    build:
      context: .
      dockerfile: vectra-server/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      # - PORT=3001
      # Add other DB/Supabase env vars here

  vectra-marketplace:
    build:
      context: .
      dockerfile: vectra-marketplace/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001

  # Note: vectra-studio is usually served by an Nginx server running the static 'dist/' bundle
  vectra-studio:
    build:
      context: .
      dockerfile: vectra-studio/Dockerfile
    ports:
      - "8080:80"
```

### Step 2: The `Dockerfile` structure

Because this is a PNPM workspace, Docker contexts **must be the root folder** so that the images can copy `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `vectra-types`. 

Here is an example structure for `vectra-server/Dockerfile`:

```dockerfile
# Start from Node image
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configs and lock files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy only the packages we need to build the server
COPY vectra-types ./vectra-types
COPY vectra-server ./vectra-server

# Install dependencies (will hoist via workspace)
RUN pnpm install --frozen-lockfile

# Build types first, then server
RUN pnpm --filter vectra-types build
RUN pnpm --filter vectra-server build

# Production Stage to keep image tiny
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/vectra-server/dist ./dist
COPY --from=builder /app/vectra-server/package.json ./
# Either bundle dependencies or install only production modules here

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Important Deployment Checklist
*   **Sequential Builds:** Always ensure `vectra-types` is built before the dependent apps in your CI/CD pipelines as demonstrated by `build.ps1`.
*   **CORS Configuration:** Your `vectra-server` (Hono application) must have CORS configured securely to accept origins from both your deployed `vectra-marketplace` (e.g., `https://market.vectra.com`) and `vectra-studio` (`https://studio.vectra.com`) URLs.
*   **Environment Validation:** Maintain separated `.env.production` sets. Remember that `.env` vars beginning with `NEXT_PUBLIC_` or `VITE_` are baked into the frontend static bundles at **build time**, so they must be accessible during CI/CD steps (like Vercel builds).
