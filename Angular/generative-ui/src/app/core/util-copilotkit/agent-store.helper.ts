import { inject, Signal } from '@angular/core';
import { HttpAgent, randomUUID } from '@ag-ui/client';
import { CopilotKit, injectAgentStore, registerFrontendTool, type AgentStore } from '@copilotkit/angular';
import { orderCardWidgetTool, navigateToOrdersTool } from '../../features/chat/tools/order.tools';

export const ORDER_AGENT_ID = 'orderAgent';

export function injectOrderAgentStore(): Signal<AgentStore> {
    // 1. Register the frontend tools for this agent
    registerFrontendTool({
        ...orderCardWidgetTool,
        agentId: ORDER_AGENT_ID,
    });

    registerFrontendTool({
        ...navigateToOrdersTool,
        agentId: ORDER_AGENT_ID,
    });

    // 2. Inject and return the agent store
    return injectAgentStore(ORDER_AGENT_ID);
}


export async function sendAgentMessage(
    copilotKit: CopilotKit,
    store: Signal<AgentStore>,
    content: string
): Promise<void> {
    const agent = store().agent;
    agent.addMessage({ id: randomUUID(), role: 'user', content });
    await copilotKit.core.runAgent({ agent });
}
