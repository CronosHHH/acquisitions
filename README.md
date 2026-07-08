# acquisitions

Express + Drizzle ORM API backed by [Neon](https://neon.tech) Postgres, containerized for both local development (via **Neon Local**) and production (via the **Neon Cloud** serverless driver).

## How database connectivity switches between environments

The app always reads a single `DATABASE_URL` from the environment (`src/config/database.js`). What changes between environments is *what that URL points to* and a couple of `neonConfig` WebSocket settings:

| | Development | Production |
|---|---|---|
| Compose file | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| Env file | `.env.development` | `.env.production` |
| `DATABASE_URL` target | `neon-local` proxy container | Neon Cloud (`*.neon.tech`) |
| Extra service | `neon-local` (Neon Local proxy) | none |
| Branching | Fresh ephemeral branch per `up` | Your real branch, no branching |

`src/config/database.js` sets `neonConfig.useSecureWebSocket = false` and a `wsProxy` whenever `NODE_ENV !== 'production'`, which is what lets the same `@neondatabase/serverless` driver code talk to Neon Local's self-signed/plain-WebSocket proxy in dev and to Neon's real TLS endpoint in prod, with zero code branching beyond that check.

## Prerequisites
- Docker and Docker Compose v2 (`docker compose ...`)
- A Neon account/project (for both Neon Local and production, since Neon Local proxies to a real Neon project)
- Your Neon API key and Project ID (Neon Console → Account Settings → API Keys, and Project Settings → General)

## Development: running locally with Neon Local

Neon Local (`neondatabase/neon_local`) is a Docker proxy that exposes a local Postgres endpoint and transparently routes queries to a Neon Cloud branch. By default it **creates a fresh ephemeral branch when the container starts and deletes it when the container stops**, so every dev session starts from a clean, production-like database with no manual branch management.
1. Fill in your Neon credentials in `.env.development`:
   - `NEON_API_KEY` — your Neon API key
   - `NEON_PROJECT_ID` — your Neon project ID
   - `NEON_PARENT_BRANCH_ID` — (optional) branch to fork ephemeral branches from; defaults to your project's default branch

   Leave `DATABASE_URL` as-is — it already points at the `neon-local` service on the Docker network:
   ```env
   DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require
   ```
2. Start the app and Neon Local proxy:
   ```bash
   docker compose -f docker-compose.dev.yml --env-file .env.development up --build
   ```
   This starts two services:
   - `neon-local` — the proxy, listening on `localhost:5432`, which creates the ephemeral branch on startup
   - `app` — the Express app (`node --watch`), with `src/` mounted from the host for hot-reload, listening on `localhost:3000`
3. Verify it's working:
   ```bash
   curl http://localhost:3000/health
   ```
4. Run Drizzle migrations against the ephemeral branch (from another terminal, with the stack running):
   ```bash
   docker compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```
5. Stop the stack — this deletes the ephemeral branch automatically:
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

### Persisting a branch across restarts
By default the ephemeral branch is deleted on `down`. If you want a branch that persists per Git branch (e.g. to avoid re-seeding data every time), set `DELETE_BRANCH=false` for the `neon-local` service in `docker-compose.dev.yml`. The compose file already mounts `.neon_local/` and `.git/HEAD` so Neon Local can map Git branches to Neon branches; just flip that one setting.

## Production: deploying against Neon Cloud

In production there is **no Neon Local proxy** — the app connects directly to your real Neon database over the serverless driver, using the standard `*.neon.tech` connection string.
1. Fill in `.env.production` with your real values (or, preferably, inject these as secrets via your deployment platform instead of committing/using a plain file):
   ```env
   DATABASE_URL=postgresql://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require
   ARCJET_KEY=<your-arcjet-key>
   ```
2. Build and run the production image:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
   ```
   This builds the `production` target of the `Dockerfile` (no devDependencies, runs as a non-root user) and starts only the `app` service — no database container.
3. Apply migrations against the production database (run once, e.g. from CI/CD or manually):
   ```bash
   docker compose -f docker-compose.prod.yml exec app npm run db:migrate
   ```

## Dockerfile targets

The `Dockerfile` is a single multi-stage file with two runnable targets:
- `development` — installs all dependencies (including dev tools), runs `node --watch src/index.js`, expects source to be bind-mounted for live reload.
- `production` — installs only production dependencies, copies the source in, runs as a non-root `nodejs` user, runs `node src/index.js`.

Each `docker-compose.*.yml` file selects its target via `build.target`.

## Local development without Docker

You can still run the app directly against a real Neon branch without Docker at all:
```bash
npm install
npm run dev
```
This uses whatever `DATABASE_URL` is set in your shell/`.env` (see `src/index.js`, which loads `dotenv/config`).
