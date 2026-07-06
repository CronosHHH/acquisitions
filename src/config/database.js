import 'dotenv/config'; // carga variables de entorno desde .env en process.env

import { Pool } from '@neondatabase/serverless'; // cliente compatible con Neon WebSocket
import { drizzle } from 'drizzle-orm/neon-serverless'; // adaptador Drizzle para Neon Pool/Client

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool); // inicializa Drizzle ORM sobre el pool

export { db, pool };