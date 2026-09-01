import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ChatComponent } from './chat';
import { AiChatService } from '@core/services/ai-chat.service';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let chatService: AiChatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [provideRouter([]), provideAnimationsAsync(), AiChatService],
    }).compileComponents();

    const fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(AiChatService);
    fixture.detectChanges();
  });

  it('should create the chat component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with available models and quick prompts', () => {
    expect(component.models.length).toBeGreaterThan(0);
    expect(component.quickPrompts.length).toBeGreaterThan(0);
    expect(component.selectedModel()).toBe('gemini-flash');
  });

  it('should toggle sidebar open state', () => {
    expect(component.sidebarOpen()).toBe(true);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(false);
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(true);
  });

  it('should switch models', () => {
    component.onModelSelect('chatgpt-4o');
    expect(chatService.selectedModel()).toBe('chatgpt-4o');
  });

  it('should filter sessions by search query', () => {
    chatService.createNewSession('Order Inquiry');
    chatService.createNewSession('Refund Request');

    component.sessionSearchQuery.set('Refund');
    const filtered = component.filteredSessions();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Refund Request');

    component.sessionSearchQuery.set('');
    expect(component.filteredSessions().length).toBeGreaterThan(1);
  });

  it('should send a user prompt and update active session', () => {
    component.promptInput.set('Track order ORD-7821');
    component.sendMessage();
    expect(component.promptInput()).toBe('');

    const session = chatService.activeSession();
    expect(session).toBeTruthy();
    const userMsg = session?.messages.find((m) => m.role === 'user');
    expect(userMsg?.content).toBe('Track order ORD-7821');
  });
});
