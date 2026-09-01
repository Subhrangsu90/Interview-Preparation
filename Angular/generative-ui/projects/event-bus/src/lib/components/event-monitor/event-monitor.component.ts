import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventBusService } from '../../services/event-bus.service';
import { UiEvent, UiEventSource } from '../../models/event.models';

@Component({
  selector: 'ui-event-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './event-monitor.component.html',
  styleUrl: './event-monitor.component.scss',
})
export class UiEventMonitorComponent {
  protected readonly eventBus = inject(EventBusService);

  readonly isExpanded = signal<boolean>(false);
  readonly selectedEvent = signal<UiEvent | null>(null);
  readonly copyFeedback = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly selectedSource = signal<UiEventSource | 'all'>('all');

  // Filter tabs
  readonly sourceTabs: { label: string; value: UiEventSource | 'all'; icon: string }[] = [
    { label: 'All', value: 'all', icon: 'list' },
    { label: 'Components', value: 'component', icon: 'touch_app' },
    { label: 'Services', value: 'service', icon: 'memory' },
    { label: 'HTTP API', value: 'http', icon: 'http' },
    { label: 'Pipes', value: 'pipe', icon: 'filter_alt' },
  ];

  // Filtered event list
  readonly events = computed(() => {
    return this.eventBus.filteredEvents();
  });

  readonly totalCount = computed(() => this.eventBus.totalCount());
  readonly countsBySource = computed(() => this.eventBus.countsBySource());
  readonly isPaused = computed(() => this.eventBus.isPaused());

  toggleExpand(): void {
    this.isExpanded.update((val) => !val);
  }

  selectSource(source: UiEventSource | 'all'): void {
    this.selectedSource.set(source);
    this.eventBus.setFilter({ source });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.eventBus.setFilter({ search: query });
  }

  selectEvent(event: UiEvent): void {
    if (this.selectedEvent()?.id === event.id) {
      this.selectedEvent.set(null);
    } else {
      this.selectedEvent.set(event);
    }
  }

  togglePause(): void {
    this.eventBus.togglePause();
  }

  clearEvents(): void {
    this.eventBus.clear();
    this.selectedEvent.set(null);
  }

  copyPayload(event: UiEvent): void {
    if (!event.payload) return;
    const text = JSON.stringify(event.payload, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copyFeedback.set('Copied!');
      setTimeout(() => this.copyFeedback.set(null), 2000);
    });
  }

  formatJson(data: unknown): string {
    if (data === undefined) return 'undefined';
    if (data === null) return 'null';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  getSourceClass(source: UiEventSource): string {
    switch (source) {
      case 'component':
        return 'source-component';
      case 'service':
        return 'source-service';
      case 'http':
        return 'source-http';
      case 'pipe':
        return 'source-pipe';
      default:
        return 'source-system';
    }
  }

  getSourceIcon(source: UiEventSource): string {
    switch (source) {
      case 'component':
        return 'touch_app';
      case 'service':
        return 'memory';
      case 'http':
        return 'sync_alt';
      case 'pipe':
        return 'filter_alt';
      default:
        return 'notifications';
    }
  }
}
