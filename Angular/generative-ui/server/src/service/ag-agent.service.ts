import { BaseEvent, EventType, RunAgentInput } from '@ag-ui/core';
import { Observable } from 'rxjs';

export abstract class AbstractAgent {
    abstract run(input: RunAgentInput): Observable<BaseEvent>;
}

export class OrderAssistantAgent extends AbstractAgent {
    run(input: RunAgentInput): Observable<BaseEvent> {
        return new Observable<BaseEvent>((observer) => {
            const threadId = input.threadId || 'thread-default';
            const runId = input.runId || `run-${Date.now()}`;

            // 1. Start the run
            observer.next({
                type: EventType.RUN_STARTED,
                threadId,
                runId,
                createdAt: Date.now()
            });

            // 2. Stream assistant text message
            const messageId = `msg-${Date.now()}`;
            observer.next({
                type: EventType.TEXT_MESSAGE_START,
                messageId,
                role: 'assistant',
                createdAt: Date.now()
            });

            observer.next({
                type: EventType.TEXT_MESSAGE_CONTENT,
                messageId,
                delta: 'Checking your order details and current shipment status...'
            });

            observer.next({
                type: EventType.TEXT_MESSAGE_END,
                messageId,
                createdAt: Date.now()
            });

            // 3. Optional: Trigger a Client-Side Tool Call
            // (If the client provided a tool like 'renderOrderCard')
            const clientHasOrderTool = input.tools?.some(
                (t: { name: string }) => t.name === 'renderOrderCard'
            );
            if (clientHasOrderTool) {
                const toolCallId = `tc-${Date.now()}`;
                observer.next({
                    type: EventType.TOOL_CALL_START,
                    toolCallId,
                    toolCallName: 'renderOrderCard',
                });
                observer.next({
                    type: EventType.TOOL_CALL_ARGS,
                    toolCallId,
                    delta: JSON.stringify({
                        orderNumber: 'ORD-3593',
                        status: 'in_transit',
                        eta: 'Tomorrow, 2:00 PM',
                    }),
                });
                observer.next({
                    type: EventType.TOOL_CALL_END,
                    toolCallId,
                });
            }

            // 4. End the run
            observer.next({
                type: EventType.RUN_FINISHED,
                threadId,
                runId,
                createdAt: Date.now()
            });

            observer.complete();
        });
    }
}

export const orderAssistantAgent = new OrderAssistantAgent();