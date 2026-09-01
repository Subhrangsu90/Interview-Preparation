import { Router } from 'express';
import { orderRouter } from './order.route.js';
import { supportTicketRouter } from './support-ticket.route.js';
import { testDatabaseConnection } from '../db/index.js';

const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  const dbHealth = await testDatabaseConnection();
  const isHealthy = dbHealth.ok;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: isHealthy ? 'connected' : 'disconnected',
      latencyMs: dbHealth.latencyMs,
      ...(isHealthy ? {} : { error: dbHealth.error, code: dbHealth.code }),
    },
  });
});

apiRouter.use('/orders', orderRouter);
apiRouter.use('/support-tickets', supportTicketRouter);

export default apiRouter;
