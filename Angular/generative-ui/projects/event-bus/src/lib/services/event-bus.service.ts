import { Injectable, computed, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  UiEvent,
  CreateUiEventInput,
  EventFilter,
  UiEventSource,
} from '../models/event.models';

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private readonly maxEvents = 200;
  private readonly eventSubject = new Subject<UiEvent>();

  // State signals
  readonly events = signal<UiEvent[]>([]);
  readonly latestEvent = signal<UiEvent | null>(null);
  readonly isPaused = signal<boolean>(false);
  readonly activeFilter = signal<EventFilter>({
    source: 'all',
    category: 'all',
    search: '',
  });

  // Observable stream for reactive subscribers
  readonly events$: Observable<UiEvent> = this.eventSubject.asObservable();

  // Computed signals
  readonly totalCount = computed(() => this.events().length);

  readonly countsBySource = computed(() => {
    const counts: Record<UiEventSource, number> = {
      component: 0,
      service: 0,
      pipe: 0,
      http: 0,
      system: 0,
    };
    for (const ev of this.events()) {
      counts[ev.source] = (counts[ev.source] || 0) + 1;
    }
    return counts;
  });

  readonly filteredEvents = computed(() => {
    const all = this.events();
    const filter = this.activeFilter();
    const search = filter.search?.trim().toLowerCase();

    return all.filter((ev) => {
      if (filter.source && filter.source !== 'all' && ev.source !== filter.source) {
        return false;
      }
      if (filter.category && filter.category !== 'all' && ev.category !== filter.category) {
        return false;
      }
      if (search) {
        const matchName = ev.name.toLowerCase().includes(search);
        const matchSource = ev.source.toLowerCase().includes(search);
        let matchPayload = false;
        if (ev.payload) {
          try {
            matchPayload = JSON.stringify(ev.payload).toLowerCase().includes(search);
          } catch {
            matchPayload = false;
          }
        }
        return matchName || matchSource || matchPayload;
      }
      return true;
    });
  });

  /**
   * Dispatches an event onto the bus.
   */
  emit<T = unknown>(input: CreateUiEventInput<T>): UiEvent<T> {
    const event: UiEvent<T> = {
      id: input.id || this.generateId(),
      timestamp: input.timestamp || new Date(),
      source: input.source,
      category: input.category,
      name: input.name,
      payload: input.payload,
      durationMs: input.durationMs,
      metadata: input.metadata,
    };

    if (!this.isPaused()) {
      this.events.update((list) => [event, ...list.slice(0, this.maxEvents - 1)]);
      this.latestEvent.set(event);
      this.eventSubject.next(event);
    }

    return event;
  }

  /**
   * Clears the event buffer.
   */
  clear(): void {
    this.events.set([]);
    this.latestEvent.set(null);
  }

  /**
   * Updates current filter settings.
   */
  setFilter(filterUpdate: Partial<EventFilter>): void {
    this.activeFilter.update((current) => ({ ...current, ...filterUpdate }));
  }

  /**
   * Pauses capturing new incoming events into the buffer.
   */
  pause(): void {
    this.isPaused.set(true);
  }

  /**
   * Resumes capturing new incoming events.
   */
  resume(): void {
    this.isPaused.set(false);
  }

  /**
   * Toggles pause/resume state.
   */
  togglePause(): void {
    this.isPaused.update((val) => !val);
  }

  private generateId(): string {
    return 'ev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  }
}
