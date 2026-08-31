import { Router } from 'express';
import { orderRouter } from './order.route.js';
import { supportTicketRouter } from './support-ticket.route.js';
import { pool } from '../db/index.js';

const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const client = await pool.connect();
    client.release();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

apiRouter.use('/orders', orderRouter);
apiRouter.use('/support-tickets', supportTicketRouter);

export default apiRouter;

