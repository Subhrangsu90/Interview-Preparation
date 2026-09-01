import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UiPageHeader } from '@shared/ui/components/page-header';
import { UiMetricCard } from '@shared/ui/components/metric-card';
import { UiSearchInput } from '@shared/ui/components/search-input';
import { UiEmptyState } from '@shared/ui/components/empty-state';
import { UiPagination } from '@shared/ui/components/pagination';
import { EventBusService } from '@event-bus/services';
import { UiEvent, UiEventSource } from '@event-bus/models';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatSidenavModule,
    UiPageHeader,
    UiMetricCard,
    UiSearchInput,
    UiEmptyState,
    UiPagination,
  ],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class EventsComponent {
  private readonly eventBus = inject(EventBusService);

  readonly displayedColumns: string[] = [
    'source',
    'name',
    'category',
    'duration',
    'timestamp',
    'actions',
  ];

  readonly selectedEvent = signal<UiEvent | null>(null);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedEvent()) {
      this.selectedEvent.set(null);
    }
  }
  readonly searchQuery = signal<string>('');
  readonly selectedSource = signal<UiEventSource | 'all'>('all');
  readonly copyFeedback = signal<string | null>(null);

  readonly sourceTabs: { label: string; value: UiEventSource | 'all'; icon: string }[] = [
    { label: 'All Events', value: 'all', icon: 'list' },
    { label: 'Components', value: 'component', icon: 'touch_app' },
    { label: 'Services', value: 'service', icon: 'memory' },
    { label: 'HTTP Network', value: 'http', icon: 'http' },
    { label: 'Pipes', value: 'pipe', icon: 'filter_alt' },
  ];

  // Reactively computed from the event bus
  readonly events = computed(() => this.eventBus.filteredEvents());
  readonly totalCount = computed(() => this.eventBus.totalCount());
  readonly countsBySource = computed(() => this.eventBus.countsBySource());
  readonly isPaused = computed(() => this.eventBus.isPaused());

  readonly pageSize = signal<number>(10);
  readonly pageIndex = signal<number>(0);

  readonly pagedEvents = computed(() => {
    const list = this.events();
    const size = this.pageSize();
    const maxIndex = Math.max(0, Math.ceil(list.length / size) - 1);
    const index = Math.min(this.pageIndex(), maxIndex);
    const start = index * size;
    return list.slice(start, start + size);
  });

  selectSource(source: UiEventSource | 'all'): void {
    this.selectedSource.set(source);
    this.pageIndex.set(0);
    this.eventBus.setFilter({ source });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.pageIndex.set(0);
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
    this.pageIndex.set(0);
    this.selectedEvent.set(null);
  }

  copyPayload(event: UiEvent): void {
    if (!event.payload) return;
    const text = JSON.stringify(event.payload, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copyFeedback.set('Copied to clipboard!');
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
