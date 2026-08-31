import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  updateOrderSchema,
  orderIdParamSchema,
  orderNumberParamSchema,
  orderQuerySchema,
} from '../schemas/order.schema.js';

const router = Router();

// GET all orders
router.get('/', validate({ query: orderQuerySchema }), (req, res, next) =>
  orderController.getAll(req, res, next)
);

// GET tracking info by order number
router.get(
  '/tracking/:orderNumber',
  validate({ params: orderNumberParamSchema }),
  (req, res, next) => orderController.getTracking(req, res, next)
);

// GET order by order number (e.g. ORD-7821)
router.get('/number/:orderNumber', validate({ params: orderNumberParamSchema }), (req, res, next) =>
  orderController.getByOrderNumber(req, res, next)
);

// GET order by primary ID
router.get('/:id', validate({ params: orderIdParamSchema }), (req, res, next) =>
  orderController.getById(req, res, next)
);

// POST create new order
router.post('/', validate({ body: createOrderSchema }), (req, res, next) =>
  orderController.create(req, res, next)
);

// PATCH update order
router.patch(
  '/:id',
  validate({ params: orderIdParamSchema, body: updateOrderSchema }),
  (req, res, next) => orderController.update(req, res, next)
);

// DELETE order
router.delete('/:id', validate({ params: orderIdParamSchema }), (req, res, next) =>
  orderController.delete(req, res, next)
);

export const orderRouter = router;
