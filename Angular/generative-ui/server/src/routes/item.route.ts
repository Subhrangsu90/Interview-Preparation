import { Router } from 'express';
import { itemController } from '../controllers/item.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createItemSchema,
  updateItemSchema,
  itemIdParamSchema,
} from '../schemas/item.schema.js';

const router = Router();

router.get('/', (req, res, next) => itemController.getAll(req, res, next));

router.get(
  '/:id',
  validate({ params: itemIdParamSchema }),
  (req, res, next) => itemController.getById(req, res, next)
);

router.post(
  '/',
  validate({ body: createItemSchema }),
  (req, res, next) => itemController.create(req, res, next)
);

router.patch(
  '/:id',
  validate({ params: itemIdParamSchema, body: updateItemSchema }),
  (req, res, next) => itemController.update(req, res, next)
);

router.delete(
  '/:id',
  validate({ params: itemIdParamSchema }),
  (req, res, next) => itemController.delete(req, res, next)
);

export const itemRouter = router;
