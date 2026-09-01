export type UiEventSource = 'component' | 'service' | 'pipe' | 'http' | 'system';

export type UiEventCategory = 'action' | 'navigation' | 'data' | 'error' | 'lifecycle';

export interface UiEvent<T = unknown> {
  readonly id: string;
  readonly timestamp: Date;
  readonly source: UiEventSource;
  readonly category: UiEventCategory;
  readonly name: string;
  readonly payload?: T;
  readonly durationMs?: number;
  readonly metadata?: Record<string, unknown>;
}

export type CreateUiEventInput<T = unknown> = Omit<UiEvent<T>, 'id' | 'timestamp'> & {
  readonly id?: string;
  readonly timestamp?: Date;
};

export interface EventFilter {
  readonly source?: UiEventSource | 'all';
  readonly category?: UiEventCategory | 'all';
  readonly search?: string;
}
