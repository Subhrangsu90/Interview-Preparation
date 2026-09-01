import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EventBusService } from '@event-bus/services';
import {
  AiModelOption,
  ChatMessage,
  ChatSession,
  GenerativeWidget,
  ModelId,
  QuickPrompt,
  aiModelOptionSchema,
  chatSessionSchema,
  quickPromptSchema,
} from '../models/chat.models';

const STORAGE_KEY = 'generative_ui_ai_chat_sessions_v1';
const ACTIVE_SESSION_KEY = 'generative_ui_ai_chat_active_session_v1';

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly eventBus = inject(EventBusService, { optional: true });
  private streamingIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly models: readonly AiModelOption[] = [
    aiModelOptionSchema.parse({
      id: 'gemini-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'Google Gemini',
      badge: 'Fast & Multimodal',
      description: 'Ultra-low latency inference tuned for quick domain answers & agent UI.',
      icon: 'bolt',
    }),
    aiModelOptionSchema.parse({
      id: 'gemini-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'Google Gemini',
      badge: 'Deep Reasoning',
      description: 'Advanced logical reasoning, complex order auditing, and policy synthesis.',
      icon: 'auto_awesome',
    }),
    aiModelOptionSchema.parse({
      id: 'chatgpt-4o',
      name: 'ChatGPT-4o',
      provider: 'OpenAI',
      badge: 'Omni Intelligence',
      description: 'High-capability general intelligence with versatile communicative depth.',
      icon: 'psychology',
    }),
  ];

  readonly quickPrompts: readonly QuickPrompt[] = [
    quickPromptSchema.parse({
      title: 'Track Order #ORD-7821',
      prompt: 'Can you show me the live status and shipping timeline for order ORD-7821?',
      icon: 'local_shipping',
      category: 'Orders',
    }),
    quickPromptSchema.parse({
      title: 'Return Policy & Process',
      prompt: 'I need to return an item from my recent order ORD-9104. What is the policy and return process?',
      icon: 'assignment_return',
      category: 'Returns',
    }),
    quickPromptSchema.parse({
      title: 'Order Spending Summary',
      prompt: 'Give me a summary of my recent order spending and fulfillment performance.',
      icon: 'analytics',
      category: 'Analytics',
    }),
    quickPromptSchema.parse({
      title: 'Fulfillment & Carrier Speeds',
      prompt: 'What carriers do we use for shipping and what are the standard transit timelines?',
      icon: 'speed',
      category: 'Support',
    }),
  ];

  // State Signals
  readonly sessions = signal<ChatSession[]>([]);
  readonly activeSessionId = signal<string>('');
  readonly selectedModel = signal<ModelId>('gemini-flash');
  readonly isGenerating = signal<boolean>(false);

  // Computed signals for UI & metrics
  readonly activeSession = computed<ChatSession | null>(() => {
    const id = this.activeSessionId();
    const list = this.sessions();
    return list.find((s) => s.id === id) ?? list[0] ?? null;
  });

  readonly totalSessionsCount = computed<number>(() => this.sessions().length);

  readonly totalMessagesCount = computed<number>(() => {
    return this.sessions().reduce((acc, s) => acc + s.messages.length, 0);
  });

  readonly currentSessionMessageCount = computed<number>(() => {
    return this.activeSession()?.messages.length ?? 0;
  });

  constructor() {
    this.initializeSessions();
  }

  private initializeSessions(): void {
    if (!isPlatformBrowser(this.platformId)) {
      const defaultSession = this.createDefaultSession('Orders & Support Assistant');
      this.sessions.set([defaultSession]);
      this.activeSessionId.set(defaultSession.id);
      return;
    }

    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const validated = chatSessionSchema.array().safeParse(parsed);
        if (validated.success && validated.data.length > 0) {
          this.sessions.set(validated.data);
          const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
          const matched = validated.data.find((s) => s.id === savedActiveId);
          this.activeSessionId.set(matched ? matched.id : validated.data[0].id);
          return;
        }
      }
    } catch {
      // Fallback if local storage error
    }

    const defaultSession = this.createDefaultSession('Orders & Support Assistant');
    this.sessions.set([defaultSession]);
    this.activeSessionId.set(defaultSession.id);
    this.persistSessions();
  }

  private createDefaultSession(title: string): ChatSession {
    const id = 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    return chatSessionSchema.parse({
      id,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: 'gemini-flash',
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content:
            "Hello! I'm your **Generative UI Copilot**, powered by modern Gemini & ChatGPT multimodal intelligence. " +
            'I can inspect live customer orders, look up FedEx/DHL tracking, guide you through returns, or generate dynamic interactive UI cards on the fly. How can I help you today?',
          timestamp: Date.now(),
          modelId: 'gemini-flash',
        },
      ],
    });
  }

  private persistSessions(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions()));
      localStorage.setItem(ACTIVE_SESSION_KEY, this.activeSessionId());
    } catch {
      // Ignore quota storage errors
    }
  }

  createNewSession(title = 'New Chat'): string {
    this.stopGeneration();
    const newSession: ChatSession = chatSessionSchema.parse({
      id: 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: this.selectedModel(),
      messages: [],
    });

    this.sessions.update((prev) => [newSession, ...prev]);
    this.activeSessionId.set(newSession.id);
    this.persistSessions();

    this.eventBus?.emit({
      source: 'service',
      category: 'data',
      name: 'AI_CHAT_SESSION_CREATED',
      payload: { sessionId: newSession.id, title },
    });

    return newSession.id;
  }

  selectSession(id: string): void {
    if (id === this.activeSessionId()) return;
    this.stopGeneration();
    this.activeSessionId.set(id);
    const session = this.sessions().find((s) => s.id === id);
    if (session) {
      this.selectedModel.set(session.modelId);
    }
    this.persistSessions();
  }

  deleteSession(id: string): void {
    this.stopGeneration();
    const currentList = this.sessions();
    const remaining = currentList.filter((s) => s.id !== id);

    if (remaining.length === 0) {
      const fresh = this.createDefaultSession('New Chat');
      this.sessions.set([fresh]);
      this.activeSessionId.set(fresh.id);
    } else {
      this.sessions.set(remaining);
      if (this.activeSessionId() === id) {
        this.activeSessionId.set(remaining[0].id);
      }
    }
    this.persistSessions();
  }

  clearCurrentSession(): void {
    this.stopGeneration();
    const currentId = this.activeSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === currentId) {
          return {
            ...session,
            title: 'New Chat',
            messages: [],
            updatedAt: Date.now(),
          };
        }
        return session;
      })
    );
    this.persistSessions();
  }

  setModel(modelId: ModelId): void {
    this.selectedModel.set(modelId);
    const currentId = this.activeSessionId();
    this.sessions.update((list) =>
      list.map((s) => (s.id === currentId ? { ...s, modelId } : s))
    );
    this.persistSessions();

    this.eventBus?.emit({
      source: 'service',
      category: 'action',
      name: 'AI_MODEL_CHANGED',
      payload: { modelId },
    });
  }

  submitFeedback(messageId: string, feedback: 'like' | 'dislike'): void {
    const currentId = this.activeSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id !== currentId) return session;
        return {
          ...session,
          messages: session.messages.map((m) => {
            if (m.id === messageId) {
              const nextFeedback = m.feedback === feedback ? null : feedback;
              return { ...m, feedback: nextFeedback };
            }
            return m;
          }),
        };
      })
    );
    this.persistSessions();

    this.eventBus?.emit({
      source: 'service',
      category: 'action',
      name: 'AI_FEEDBACK_SUBMITTED',
      payload: { messageId, feedback },
    });
  }

  stopGeneration(): void {
    if (this.streamingIntervalId) {
      clearInterval(this.streamingIntervalId);
      this.streamingIntervalId = null;
    }
    if (this.isGenerating()) {
      this.isGenerating.set(false);
      const currentId = this.activeSessionId();
      this.sessions.update((list) =>
        list.map((session) => {
          if (session.id !== currentId) return session;
          return {
            ...session,
            messages: session.messages.map((m) =>
              m.isStreaming ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );
      this.persistSessions();
    }
  }

  sendMessage(userPrompt: string): void {
    const prompt = userPrompt.trim();
    if (!prompt || this.isGenerating()) return;

    let targetSessionId = this.activeSessionId();
    let currentSession = this.activeSession();

    if (!currentSession) {
      targetSessionId = this.createNewSession(prompt.slice(0, 32));
      currentSession = this.activeSession();
    }

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const isFirstMessage = (currentSession?.messages.length ?? 0) === 0;
    const computedTitle = isFirstMessage
      ? prompt.length > 28
        ? prompt.slice(0, 28) + '...'
        : prompt
      : currentSession?.title ?? 'Chat';

    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === targetSessionId) {
          return {
            ...session,
            title: computedTitle,
            updatedAt: Date.now(),
            messages: [...session.messages, userMessage],
          };
        }
        return session;
      })
    );

    this.persistSessions();

    this.eventBus?.emit({
      source: 'service',
      category: 'action',
      name: 'AI_PROMPT_SENT',
      payload: { prompt, sessionId: targetSessionId },
    });

    this.streamAssistantResponse(prompt, targetSessionId);
  }

  regenerateLastResponse(): void {
    if (this.isGenerating()) return;
    const session = this.activeSession();
    if (!session || session.messages.length === 0) return;

    const messages = [...session.messages];
    if (messages[messages.length - 1]?.role === 'assistant') {
      messages.pop();
    }

    let lastUserPrompt = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserPrompt = messages[i].content;
        break;
      }
    }

    if (!lastUserPrompt) return;

    this.sessions.update((list) =>
      list.map((s) => (s.id === session.id ? { ...s, messages } : s))
    );

    this.streamAssistantResponse(lastUserPrompt, session.id);
  }

  private streamAssistantResponse(prompt: string, sessionId: string): void {
    this.isGenerating.set(true);

    const botMessageId = 'assistant-' + Date.now();
    const model = this.selectedModel();
    const { text, widget } = this.synthesizeReply(prompt, model);

    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      modelId: model,
    };

    this.sessions.update((list) =>
      list.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, initialBotMessage],
          };
        }
        return s;
      })
    );

    let charIndex = 0;
    const chunkSize = Math.max(3, Math.floor(text.length / 40));
    const delay = model === 'gemini-flash' ? 18 : 26;

    this.streamingIntervalId = setInterval(() => {
      charIndex += chunkSize;
      const isComplete = charIndex >= text.length;
      const currentContent = isComplete ? text : text.slice(0, charIndex);

      this.sessions.update((list) =>
        list.map((s) => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === botMessageId) {
                return {
                  ...m,
                  content: currentContent,
                  isStreaming: !isComplete,
                  generativeWidget: isComplete ? widget : undefined,
                };
              }
              return m;
            }),
          };
        })
      );

      if (isComplete) {
        if (this.streamingIntervalId) {
          clearInterval(this.streamingIntervalId);
          this.streamingIntervalId = null;
        }
        this.isGenerating.set(false);
        this.persistSessions();

        this.eventBus?.emit({
          source: 'service',
          category: 'data',
          name: 'AI_RESPONSE_COMPLETED',
          payload: { sessionId, messageId: botMessageId, hasWidget: !!widget },
        });
      }
    }, delay);
  }

  private synthesizeReply(
    prompt: string,
    model: ModelId
  ): { text: string; widget?: GenerativeWidget } {
    const lower = prompt.toLowerCase();
    const modelPrefix =
      model === 'gemini-flash'
        ? ''
        : model === 'gemini-pro'
          ? '**[Gemini 1.5 Pro Analysis]**\n\n'
          : '**[ChatGPT-4o Response]**\n\n';

    // 1. Order Tracking
    if (lower.includes('7821') || (lower.includes('track') && lower.includes('order'))) {
      return {
        text:
          modelPrefix +
          'I located order **#ORD-7821** in our fulfillment database. It is currently **In Transit** via **FedEx Priority**. ' +
          'The shipment departed the regional distribution center in Memphis, TN, and is on schedule for delivery.\n\n' +
          'Below is your live interactive tracking card with current milestone progress:',
        widget: {
          type: 'order_status',
          data: {
            orderNumber: 'ORD-7821',
            customerName: 'Sarah Jenkins',
            status: 'shipped',
            totalAmount: 349.99,
            trackingNumber: 'FDX-9823419082',
            carrier: 'FedEx Express',
            estimatedDelivery: 'Tomorrow by 4:30 PM',
            items: [
              { name: 'Sony WH-1000XM5 Wireless Headphones', quantity: 1, price: 349.99 },
            ],
          },
        },
      };
    }

    if (lower.includes('9104')) {
      return {
        text:
          modelPrefix +
          'Order **#ORD-9104** was successfully **Delivered** to **Alex Rivera** on August 28. ' +
          'This order is within the 30-day return window and eligible for free prepaid returns or warranty replacement.',
        widget: {
          type: 'order_status',
          data: {
            orderNumber: 'ORD-9104',
            customerName: 'Alex Rivera',
            status: 'delivered',
            totalAmount: 189.5,
            trackingNumber: 'UPS-7412093845',
            carrier: 'UPS Ground',
            estimatedDelivery: 'Delivered (Aug 28)',
            items: [
              { name: 'Mechanical Keyboard RGB (Hot-swappable)', quantity: 1, price: 129.5 },
              { name: 'Padded Wrist Rest', quantity: 1, price: 60.0 },
            ],
          },
        },
      };
    }

    if (lower.includes('3312') || lower.includes('processing')) {
      return {
        text:
          modelPrefix +
          'Order **#ORD-3312** is currently **Processing** at the logistics fulfillment hub. ' +
          'Warehouse staff are picking and packaging the items. Estimated dispatch within the next 4 hours.',
        widget: {
          type: 'order_status',
          data: {
            orderNumber: 'ORD-3312',
            customerName: 'Marcus Vance',
            status: 'processing',
            totalAmount: 84.2,
            trackingNumber: 'Pending assignment',
            carrier: 'DHL Express',
            estimatedDelivery: 'Sep 4, 2026',
            items: [{ name: 'USB-C GaN Rapid Charger 100W', quantity: 2, price: 42.1 }],
          },
        },
      };
    }

    // 2. Returns & Refunds
    if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
      return {
        text:
          modelPrefix +
          '### 🔄 Returns & Refund Guidelines\n\n' +
          'We offer a **30-day hassle-free return guarantee** for all fulfilled items in original packaging:\n' +
          '- **Prepaid Label**: Instant digital QR code or downloadable PDF shipping label.\n' +
          '- **Refund Window**: Issued to original payment method within 2-3 business days after warehouse check-in.\n' +
          '- **Instant Exchange**: Available for size or model variations with zero restocking fee.\n\n' +
          'You can open a support ticket or request an RMA directly via the **Support & Returns Desk** below:',
        widget: {
          type: 'return_guide',
          data: {
            orderNumber: lower.includes('9104') ? 'ORD-9104' : undefined,
            eligibleUntil: 'Within 30 days of delivery',
            refundEstimate: 189.5,
            steps: [
              'Select eligible item & specify return reason',
              'Generate prepaid return shipping label',
              'Drop off package at any authorized carrier depot',
              'Automatic refund upon warehouse scanning',
            ],
            supportDeskRoute: '/support',
          },
        },
      };
    }

    // 3. Analytics / Spending
    if (
      lower.includes('spend') ||
      lower.includes('metric') ||
      lower.includes('analytic') ||
      lower.includes('summary')
    ) {
      return {
        text:
          modelPrefix +
          '### 📊 Order Portfolio & Spending Analytics\n\n' +
          'Here is your aggregated order activity for the current billing cycle:\n\n' +
          '- **Total Orders Placed**: 28 orders\n' +
          '- **Fulfillment Success Rate**: 98.4%\n' +
          '- **Average Dispatch Latency**: 1.2 business days\n' +
          '- **Total Expenditure**: $4,821.69 across electronics, peripherals, and office equipment.\n\n' +
          'Here is the interactive breakdown card:',
        widget: {
          type: 'metrics_summary',
          data: {
            period: 'Past 30 Days',
            totalOrders: 28,
            totalSpent: 4821.69,
            activeShipments: 3,
            resolvedInquiries: 12,
          },
        },
      };
    }

    // 4. Shipping Carriers
    if (lower.includes('carrier') || lower.includes('shipping') || lower.includes('delivery')) {
      return {
        text:
          modelPrefix +
          '### 🚚 Shipping Speeds & Logistics Partners\n\n' +
          'We partner with tier-one carriers to guarantee fast and reliable transit:\n\n' +
          '1. **FedEx Express**: Standard next-day and 2-day domestic priority fulfillment with real-time GPS tracking.\n' +
          '2. **UPS Ground**: Cost-effective 3-5 day delivery for heavy goods and bundled parcels.\n' +
          '3. **DHL Global**: International courier service serving 180+ countries with customs clearance support.\n\n' +
          'Every order includes automated event dispatching. You can monitor live telemetry in the **Live Events** dashboard.',
      };
    }

    // 5. Code / Architecture
    if (lower.includes('code') || lower.includes('angular') || lower.includes('agentic')) {
      return {
        text:
          modelPrefix +
          '### ⚡ Generative UI Architecture in Angular\n\n' +
          'This application leverages modern Angular signals and decoupled event streaming to render generative components inside the conversation thread:\n\n' +
          '```typescript\n' +
          '// Dynamic Generative UI Widget Contract\n' +
          'export type GenerativeWidget =\n' +
          "  | { readonly type: 'order_status'; readonly data: OrderWidgetPayload }\n" +
          "  | { readonly type: 'return_guide'; readonly data: ReturnWidgetPayload }\n" +
          "  | { readonly type: 'metrics_summary'; readonly data: MetricsWidgetPayload };\n" +
          '```\n\n' +
          'When the model identifies a domain intention, it attaches structured payloads that Angular templates evaluate with native `@if` and `@switch` control flows.',
      };
    }

    // 6. Default
    return {
      text:
        modelPrefix +
        `I understand! You asked: "${prompt}".\n\n` +
        'As your e-commerce AI copilot, I am trained to assist with:\n' +
        '- **Real-time order lookups** (Try asking about `ORD-7821` or `ORD-9104`)\n' +
        '- **Return & refund assistance** (Instant policy details & return actions)\n' +
        '- **Shipment timelines** (FedEx, UPS, and DHL tracking checkpoints)\n' +
        '- **Spending analytics** and fulfillment insights\n\n' +
        'What specific order or topic would you like to explore next?',
    };
  }
}
