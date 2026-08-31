import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import 'dotenv/config';

const { Pool } = pg;

const connectionString =
  process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/generative_ui_db';

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
