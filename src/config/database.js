import 'dotenv/config'; // carga variables de entorno desde .env en process.env

import { neon } from '@neondatabase/serverless'; // cliente/función para conectar con Neon
import { drizzle } from 'drizzle-orm/neon-serverless'; // adaptador Drizzle para Neon

const sql = neon(process.env.DATABASE_URL); // crea instancia SQL usando la URL de la BD
const db = drizzle(sql); // inicializa Drizzle ORM con la instancia SQL

export { db, sql }; // exporta la API ORM y el cliente SQL crudo