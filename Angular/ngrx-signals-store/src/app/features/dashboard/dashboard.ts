import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoggerService } from 'logger';
import { environment } from '@env/environment';

export interface LearningModule {
  title: string;
  description: string;
  icon: string;
  route: string;
  status: 'Done' | 'Next' | 'Roadmap';
  tag: string;
}

export interface QuickStat {
  label: string;
  value: string;
  icon: string;
  change: string;
  accent: 'primary' | 'secondary' | 'tertiary' | 'success';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly logger = inject(LoggerService);

  readonly isProduction = environment.production;

  // Live Interactive Signal Playground State
  readonly counter = signal(4);
  readonly multiplier = signal(3);
  readonly multiplied = computed(() => this.counter() * this.multiplier());
  readonly lastAction = signal<string>('Initialized with 4');

  // Key stats
  readonly stats: QuickStat[] = [
    {
      label: 'Learning Path',
      value: '13 Topics',
      icon: 'school',
      change: 'NgRx v22 Ready',
      accent: 'primary',
    },
    {
      label: 'Core Modules',
      value: '2 Ready',
      icon: 'check_circle',
      change: 'Book Search & State',
      accent: 'success',
    },
    {
      label: 'Reactivity Model',
      value: 'Signals-First',
      icon: 'bolt',
      change: 'Fine-grained updates',
      accent: 'secondary',
    },
    {
      label: 'RxJS Boilerplate',
      value: '0 KB',
      icon: 'speed',
      change: 'Native SignalStore',
      accent: 'tertiary',
    },
  ];

  // Learning Modules Grid
  readonly modules: LearningModule[] = [
    {
      title: 'SignalStore Core Concepts',
      description:
        'Learn withState, withComputed, and withMethods through an interactive Google Books search application.',
      icon: 'auto_stories',
      route: '/signal-store/core-concepts',
      status: 'Done',
      tag: 'Interactive Demo',
    },
    {
      title: 'SignalStore Overview',
      description:
        'High-level architectural blueprint explaining SignalStore design principles, state slices, and composition.',
      icon: 'architecture',
      route: '/signal-store/overview',
      status: 'Done',
      tag: 'Architecture',
    },
    {
      title: 'SignalState Demo',
      description:
        'Explore standalone lightweight reactive state slices with deep signal tracking and fine-grained reactivity.',
      icon: 'account_tree',
      route: '/signal-state',
      status: 'Done',
      tag: 'Standalone State',
    },
    {
      title: 'Lifecycle Hooks',
      description:
        'Manage side effects, interval polling, and cleanup routines using withHooks (onInit and onDestroy).',
      icon: 'autorenew',
      route: '/signal-store/overview',
      status: 'Next',
      tag: 'withHooks',
    },
    {
      title: 'Entity Management',
      description:
        'Perform high-efficiency normalized collections using @ngrx/signals/entities and withEntities.',
      icon: 'view_list',
      route: '/signal-store/overview',
      status: 'Roadmap',
      tag: 'withEntities',
    },
    {
      title: 'Custom Store Features',
      description:
        'Package and share reusable stateful behaviors across stores using signalStoreFeature.',
      icon: 'extension',
      route: '/signal-store/overview',
      status: 'Roadmap',
      tag: 'Custom Features',
    },
  ];

  // Pro-tips
  readonly proTips = [
    {
      title: 'Immutable State Patching',
      text: 'Always use patchState() to update state slices. It handles partial shallow merges safely without triggering unnecessary re-evaluations.',
      code: 'patchState(store, { query, isLoading: true });',
    },
    {
      title: 'Memoized Computed Signals',
      text: 'Signals defined in withComputed are lazily evaluated and memoized automatically. They only re-compute when their specific dependencies change.',
      code: 'totalPages: computed(() => Math.ceil(books().length / pageSize()))',
    },
    {
      title: 'Flexible Injection Scopes',
      text: 'SignalStore can be root-provided ({ providedIn: "root" }) for global singleton state or provided at component level for scoped lifecycle disposal.',
      code: 'export const Store = signalStore({ providedIn: "root" }, ...);',
    },
  ];

  constructor() {
    this.logger.info(
      'Dashboard',
      `Dashboard component loaded in ${this.isProduction ? 'production' : 'development'} mode`
    );
  }

  increment(): void {
    this.counter.update((v) => v + 1);
    this.lastAction.set(`Incremented counter to ${this.counter()}`);
  }

  decrement(): void {
    if (this.counter() > 0) {
      this.counter.update((v) => v - 1);
      this.lastAction.set(`Decremented counter to ${this.counter()}`);
    }
  }

  reset(): void {
    this.counter.set(0);
    this.lastAction.set('Reset counter to 0');
  }

  setMultiplier(factor: number): void {
    this.multiplier.set(factor);
    this.lastAction.set(`Set multiplier factor to ${factor}x`);
  }
}
