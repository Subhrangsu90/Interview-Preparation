import { Router } from 'express';
import { supportTicketController } from '../controllers/support-ticket.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createTicketSchema,
  updateTicketSchema,
  ticketIdParamSchema,
} from '../schemas/support-ticket.schema.js';

const router = Router();

// GET all tickets
router.get('/', (req, res, next) => supportTicketController.getAll(req, res, next));

// GET ticket by ID
router.get(
  '/:id',
  validate({ params: ticketIdParamSchema }),
  (req, res, next) => supportTicketController.getById(req, res, next)
);

// POST create ticket
router.post(
  '/',
  validate({ body: createTicketSchema }),
  (req, res, next) => supportTicketController.create(req, res, next)
);

// PATCH update ticket
router.patch(
  '/:id',
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  (req, res, next) => supportTicketController.update(req, res, next)
);

// DELETE ticket
router.delete(
  '/:id',
  validate({ params: ticketIdParamSchema }),
  (req, res, next) => supportTicketController.delete(req, res, next)
);

export const supportTicketRouter = router;
