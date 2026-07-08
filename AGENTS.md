# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Generate Drizzle migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Architecture Overview

This is a Node.js Express API for user authentication using ESM modules.

### Directory Structure
- `src/models/` - Drizzle ORM schema definitions
- `src/routes/` - Express route definitions
- `src/controllers/` - Request handlers with validation and business logic orchestration
- `src/services/` - Business logic layer (database operations, password hashing)
- `src/validations/` - Zod schemas for request validation
- `src/middleware/` - Express middleware (currently empty)
- `src/config/` - Configuration modules (database, logger)
- `src/utils/` - Shared utilities (JWT, cookies, formatting)

### Request Flow
Incoming requests flow: Route → Controller → Service → Database. Validation uses Zod schemas before controller logic executes.

### Path Aliases
The `package.json` defines import aliases for cleaner imports:
- `#config/*` → `./src/config/*`
- `#models/*` → `./src/models/*`
- `#controllers/*` → `./src/controllers/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#routes/*` → `./src/routes/*`
- `#validations/*` → `./src/validations/*`

### Key Dependencies
- Express 5.x with Helmet, CORS, Morgan, Cookie-Parser for HTTP handling
- Drizzle ORM with Neon Serverless PostgreSQL driver
- JWT for token-based authentication
- Bcrypt for password hashing
- Zod for schema validation
- Winston for structured logging (outputs to `logs/` directory)