import type { Request, Response, NextFunction } from 'express';
import { itemService } from '../service/item.service.js';
import type { CreateItemDto, UpdateItemDto } from '../schemas/item.schema.js';

export class ItemController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await itemService.getAllItems();
      res.json({
        status: 'success',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const item = await itemService.getItemById(id);

      if (!item) {
        res.status(404).json({
          status: 'error',
          message: `Item with id ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateItemDto;
      const newItem = await itemService.createItem(dto);
      res.status(201).json({
        status: 'success',
        data: newItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params['id']);
      const dto = req.body as UpdateItemDto;
      const updated = await itemService.updateItem(id, dto);

      if (!updated) {
        res.status(404).json({
          status: 'error',
          message: `Item with id ${id} not found`,
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
      const deleted = await itemService.deleteItem(id);

      if (!deleted) {
        res.status(404).json({
          status: 'error',
          message: `Item with id ${id} not found`,
        });
        return;
      }

      res.json({
        status: 'success',
        message: `Item with id ${id} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const itemController = new ItemController();
