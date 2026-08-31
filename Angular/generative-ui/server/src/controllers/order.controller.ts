import type { Request, Response, NextFunction } from 'express';
import { orderService } from '../service/order.service.js';
import type { CreateOrderDto, UpdateOrderDto } from '../schemas/order.schema.js';

export class OrderController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
      const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
      const orders = await orderService.getAllOrders({ status, search });
      res.json({
        status: 'success',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const order = await orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: `Order with ID ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByOrderNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderNumber = String(req.params['orderNumber']);
      const order = await orderService.getOrderByNumber(orderNumber);

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: `Order with order number ${orderNumber} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateOrderDto;
      const createdOrder = await orderService.createOrder(dto);
      res.status(201).json({
        status: 'success',
        data: createdOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const dto = req.body as UpdateOrderDto;
      const updated = await orderService.updateOrder(id, dto);

      if (!updated) {
        res.status(404).json({
          status: 'error',
          message: `Order with ID ${id} not found`,
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
      const deleted = await orderService.deleteOrder(id);

      if (!deleted) {
        res.status(404).json({
          status: 'error',
          message: `Order with ID ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        message: `Order with ID ${id} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderNumber = String(req.params['orderNumber']);
      const tracking = await orderService.getTracking(orderNumber);

      if (!tracking) {
        res.status(404).json({
          status: 'error',
          message: `Tracking details for order ${orderNumber} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: tracking,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
