import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
  computed,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { TextFieldModule } from '@angular/cdk/text-field';

// Shared UI Library Components, Directives & Pipes
import { UiPageHeader } from '@shared/ui/components/page-header';
import { UiStatusBadge } from '@shared/ui/components/status-badge';
import { UiSearchInput } from '@shared/ui/components/search-input';
import { UiEmptyState } from '@shared/ui/components/empty-state';
import { UiCopyToClipboardDirective } from '@shared/ui/directives';
import { UiCurrencyPipe, UiRelativeTimePipe } from '@shared/ui/pipes';

// Event Bus Directive
import { TrackEventDirective } from '@event-bus/directives';

// Core Services & Models
import { AiChatService } from '@core/services/ai-chat.service';
import { ModelId, QuickPrompt } from '@core/models/chat.models';

interface FormattedPart {
  type: 'text' | 'code' | 'bullet' | 'header';
  content: string;
  language?: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    TextFieldModule,
    UiPageHeader,
    UiStatusBadge,
    UiSearchInput,
    UiEmptyState,
    UiCopyToClipboardDirective,
    UiCurrencyPipe,
    UiRelativeTimePipe,
    TrackEventDirective,
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class ChatComponent implements AfterViewChecked {
  protected readonly chatService = inject(AiChatService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('promptTextarea') private promptTextarea?: ElementRef<HTMLTextAreaElement>;

  readonly sidebarOpen = signal<boolean>(true);
  readonly promptInput = signal<string>('');
  readonly sessionSearchQuery = signal<string>('');
  readonly copiedCodeBlock = signal<string | null>(null);

  readonly activeSession = this.chatService.activeSession;
  readonly sessions = this.chatService.sessions;
  readonly models = this.chatService.models;
  readonly quickPrompts = this.chatService.quickPrompts;
  readonly isGenerating = this.chatService.isGenerating;
  readonly selectedModel = this.chatService.selectedModel;

  readonly filteredSessions = computed(() => {
    const query = this.sessionSearchQuery().toLowerCase().trim();
    const list = this.sessions();
    if (!query) return list;
    return list.filter((s) => s.title.toLowerCase().includes(query));
  });

  readonly activeModelDetails = computed(() => {
    const currentId = this.selectedModel();
    return this.models.find((m) => m.id === currentId) ?? this.models[0];
  });

  private shouldAutoScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldAutoScroll) {
      this.scrollToBottom();
      this.shouldAutoScroll = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  onModelSelect(modelId: ModelId): void {
    this.chatService.setModel(modelId);
  }

  createNewChat(): void {
    this.chatService.createNewSession();
    this.focusInput();
  }

  selectSession(id: string): void {
    this.chatService.selectSession(id);
    this.scrollToBottom();
  }

  deleteSession(event: Event, id: string): void {
    event.stopPropagation();
    this.chatService.deleteSession(id);
  }

  clearCurrentChat(): void {
    this.chatService.clearCurrentSession();
    this.focusInput();
  }

  applyQuickPrompt(prompt: QuickPrompt): void {
    this.promptInput.set(prompt.prompt);
    this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.promptInput().trim();
    if (!text || this.isGenerating()) return;

    this.chatService.sendMessage(text);
    this.promptInput.set('');
    this.shouldAutoScroll = true;

    if (this.promptTextarea?.nativeElement) {
      this.promptTextarea.nativeElement.style.height = 'auto';
    }
  }

  stopGeneration(): void {
    this.chatService.stopGeneration();
  }

  regenerate(): void {
    this.chatService.regenerateLastResponse();
    this.shouldAutoScroll = true;
  }

  giveFeedback(messageId: string, feedback: 'like' | 'dislike'): void {
    this.chatService.submitFeedback(messageId, feedback);
  }

  copyCode(code: string, blockKey: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.copiedCodeBlock.set(blockKey);
        setTimeout(() => this.copiedCodeBlock.set(null), 2000);
      });
    }
  }

  exportChat(): void {
    const session = this.activeSession();
    if (!session || session.messages.length === 0) return;

    const markdownLines: string[] = [
      `# ${session.title}`,
      `*Exported on ${new Date(session.createdAt).toLocaleString()} via Generative UI Assistant*\n`,
    ];

    for (const msg of session.messages) {
      const author = msg.role === 'user' ? '**User**' : '**AI Assistant**';
      markdownLines.push(`### ${author} (${new Date(msg.timestamp).toLocaleTimeString()})`);
      markdownLines.push(msg.content + '\n');
    }

    const blob = new Blob([markdownLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  parseMessageContent(content: string): FormattedPart[] {
    if (!content) return [];

    const parts: FormattedPart[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textChunk = content.slice(lastIndex, match.index);
        this.parseTextChunks(textChunk, parts);
      }

      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim(),
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      const remainingChunk = content.slice(lastIndex);
      this.parseTextChunks(remainingChunk, parts);
    }

    return parts;
  }

  private parseTextChunks(rawText: string, target: FormattedPart[]): void {
    const lines = rawText.split('\n');
    let buffer: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        if (buffer.length > 0) {
          target.push({ type: 'text', content: buffer.join('\n') });
          buffer = [];
        }
        target.push({ type: 'header', content: trimmed.replace(/^#+\s*/, '') });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (buffer.length > 0) {
          target.push({ type: 'text', content: buffer.join('\n') });
          buffer = [];
        }
        target.push({ type: 'bullet', content: trimmed.slice(2) });
      } else {
        buffer.push(line);
      }
    }

    if (buffer.length > 0) {
      target.push({ type: 'text', content: buffer.join('\n') });
    }
  }

  formatInline(text: string): string {
    if (!text) return '';
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    return formatted;
  }

  autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private focusInput(): void {
    setTimeout(() => {
      this.promptTextarea?.nativeElement?.focus();
    }, 100);
  }
}
