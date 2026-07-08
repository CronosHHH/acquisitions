import 'dotenv/config'; // carga variables de entorno desde .env en process.env

import { Pool, neonConfig } from '@neondatabase/serverless'; // cliente compatible con Neon WebSocket
import { drizzle } from 'drizzle-orm/neon-serverless'; // adaptador Drizzle para Neon Pool/Client
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// When running against Neon Local (development/test via Docker Compose), the
// proxy terminates TLS with a self-signed certificate and expects plain
// WebSocket traffic routed back to itself instead of Neon's cloud endpoint.
if (process.env.NODE_ENV !== 'production') {
  neonConfig.useSecureWebSocket = false;
  neonConfig.wsProxy = (host) => `${host}:5432`;
  neonConfig.pipelineConnect = false;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool); // inicializa Drizzle ORM sobre el pool

export { db, pool };
