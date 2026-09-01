import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { testDatabaseConnection, closeDatabasePool } from './db/index.js';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
  });
});

// Central Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);

  // Verify database connectivity on startup
  const dbHealth = await testDatabaseConnection();
  if (dbHealth.ok) {
    console.log(`✅ Database connected successfully (${dbHealth.latencyMs}ms)`);
  } else {
    console.warn(
      `⚠️ [Database Connection Warning]: Could not reach PostgreSQL.\n` +
        `   Reason: ${dbHealth.error} ${dbHealth.code ? `(Code: ${dbHealth.code})` : ''}\n` +
        `   Troubleshooting:\n` +
        `   - Run "npm run docker:up" to start the PostgreSQL container\n` +
        `   - Check your DATABASE_URL in .env`
    );
  }
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    await closeDatabasePool();
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating server process after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
