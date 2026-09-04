import { Injectable, signal } from '@angular/core';
import { HttpAgent, AgentSubscriber } from '@ag-ui/client';
import { renderOrderCardTool, OrderCardPayload, orderCardPayloadSchema } from '../models/ag-agent.models';

export interface AgChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  widget?: {
    type: 'order_card';
    data: OrderCardPayload;
  };
}

@Injectable({
    providedIn: 'root',
})
export class AgAgentService {
    // Reactive Signals
  readonly messages = signal<AgChatMessage[]>([]);
  readonly isStreaming = signal<boolean>(false);
  readonly currentStreamText = signal<string>('');
  private agent = new HttpAgent({
    url: '/api/agent/run',
    threadId: 'session-' + Date.now(),
  });
  private currentToolArgsBuffer = '';
  private currentToolName = '';
  async sendMessage(prompt: string): Promise<void> {
    if (!prompt.trim() || this.isStreaming()) return;
    // 1. Add user message
    const userMsg: AgChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
    };
    this.messages.update((msgs) => [...msgs, userMsg]);
    this.agent.addMessage({
      id: userMsg.id,
      role: 'user',
      content: prompt,
    });
    this.isStreaming.set(true);
    this.currentStreamText.set('');
    this.currentToolArgsBuffer = '';
    this.currentToolName = '';
    const subscriber: AgentSubscriber = {
      onTextMessageContentEvent: ({ event }) => {
        this.currentStreamText.update((prev) => prev + (event.delta || ''));
      },
      onTextMessageEndEvent: () => {
        // Complete current text message
      },
      onToolCallStartEvent: ({ event }) => {
        this.currentToolName = event.toolCallName;
        this.currentToolArgsBuffer = '';
      },
      onToolCallArgsEvent: ({ event }) => {
        this.currentToolArgsBuffer += event.delta || '';
      },
      onToolCallEndEvent: () => {
        if (this.currentToolName === 'renderOrderCard') {
          try {
            const rawData = JSON.parse(this.currentToolArgsBuffer);
            const parsed = orderCardPayloadSchema.safeParse(rawData);
            if (parsed.success) {
              this.messages.update((msgs) => [
                ...msgs,
                {
                  id: `widget-${Date.now()}`,
                  role: 'assistant',
                  content: '',
                  widget: {
                    type: 'order_card',
                    data: parsed.data,
                  },
                },
              ]);
            }
          } catch (e) {
            console.error('Failed to parse tool call args', e);
          }
        }
      },
      onRunFinishedEvent: () => {
        const remainingText = this.currentStreamText();
        if (remainingText) {
          this.messages.update((msgs) => [
            ...msgs,
            {
              id: `asst-${Date.now()}`,
              role: 'assistant',
              content: remainingText,
            },
          ]);
        }
        this.currentStreamText.set('');
        this.isStreaming.set(false);
      },
    };
    try {
      await this.agent.runAgent(
        {
          runId: `run-${Date.now()}`,
          tools: [renderOrderCardTool],
        },
        subscriber
      );
    } catch (error) {
      console.error('Agent run failed', error);
      this.isStreaming.set(false);
    }
  }
 }