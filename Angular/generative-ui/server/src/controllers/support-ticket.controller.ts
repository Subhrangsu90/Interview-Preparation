import type { Request, Response, NextFunction } from 'express';
import { supportTicketService } from '../service/support-ticket.service.js';
import type { CreateTicketDto, UpdateTicketDto } from '../schemas/support-ticket.schema.js';

export class SupportTicketController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
      const orderNumber =
        typeof req.query['orderNumber'] === 'string' ? req.query['orderNumber'] : undefined;
      const tickets = await supportTicketService.getAllTickets({ status, orderNumber });
      res.json({
        status: 'success',
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const ticket = await supportTicketService.getTicketById(id);

      if (!ticket) {
        res.status(404).json({
          status: 'error',
          message: `Support ticket with ID ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateTicketDto;
      const ticket = await supportTicketService.createTicket(dto);
      res.status(201).json({
        status: 'success',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const dto = req.body as UpdateTicketDto;
      const updated = await supportTicketService.updateTicket(id, dto);

      if (!updated) {
        res.status(404).json({
          status: 'error',
          message: `Support ticket with ID ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const deleted = await supportTicketService.deleteTicket(id);

      if (!deleted) {
        res.status(404).json({
          status: 'error',
          message: `Support ticket with ID ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        message: `Support ticket with ID ${id} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const supportTicketController = new SupportTicketController();
