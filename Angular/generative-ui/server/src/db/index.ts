import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import 'dotenv/config';

const { Pool } = pg;

const connectionString =
  process.env['DATABASE_URL'] || 'postgresql://postgres:postgres@localhost:5432/generative_ui_db';

export const pool = new Pool({
  connectionString,
  // Connection acquisition timeout: fail fast rather than hanging indefinitely
  connectionTimeoutMillis: Number(process.env['DB_CONNECT_TIMEOUT_MS'] || 5000),
  // Idle client timeout: close idle clients after 30 seconds
  idleTimeoutMillis: Number(process.env['DB_IDLE_TIMEOUT_MS'] || 30000),
  // Maximum number of clients in the pool
  max: Number(process.env['DB_POOL_MAX'] || 10),
});

// Prevent unhandled error crashes when idle pool clients encounter connection drops
pool.on('error', (err: Error) => {
  console.error('⚠️ [Database Pool Unexpected Error]:', err.message);
});

export const db = drizzle(pool, { schema });

export interface DbConnectionStatus {
  ok: boolean;
  latencyMs?: number;
  error?: string;
  code?: string;
}

/**
 * Validates the database connection by acquiring a client from the pool
 * and executing a lightweight test query (SELECT 1).
 */
export async function testDatabaseConnection(): Promise<DbConnectionStatus> {
  const startTime = Date.now();
  let client: pg.PoolClient | null = null;

  try {
    client = await pool.connect();
    await client.query('SELECT 1;');
    const latencyMs = Date.now() - startTime;
    return { ok: true, latencyMs };
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    return {
      ok: false,
      latencyMs: Date.now() - startTime,
      error: error.message || 'Failed to connect to the database',
      code: error.code,
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Safely drains and closes the database connection pool.
 */
export async function closeDatabasePool(): Promise<void> {
  try {
    await pool.end();
    console.log('📦 Database pool closed gracefully.');
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error closing database pool:', error.message);
  }
}
