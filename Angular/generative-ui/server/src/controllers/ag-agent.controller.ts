import type { Request, Response, NextFunction } from 'express';
import type { RunAgentInput } from '@ag-ui/core';

import { orderAssistantAgent } from '../service/ag-agent.service.js';

export class AgAgentController {
    async runAgent(req: Request, res: Response, next: NextFunction): Promise<void>{
        try { 
            const input: RunAgentInput = req.body;

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();
            
            const subscription = orderAssistantAgent
                .run(input)
                .subscribe({
                    next: (event) => {
                        // Write standard SSE data line
                        res.write(`data: ${JSON.stringify(event)}\n\n`);
                    },
                    error(err) {
                        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`)
                    },
                    complete() {
                        res.write('event: done\ndata: {}\n\n');
                        res.end();
                    },
                });
            
            // Cleanup if client closes connection
            req.on('close', () => {
                subscription.unsubscribe();
            })
            
        }
        catch (err) {
            next(err);
        }
    }
}

export const agAgentController = new AgAgentController();