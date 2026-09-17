export interface SignalStoreTopicConfig {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  status: 'Done' | 'Next Up' | 'Upcoming';
  docsUrl: string;
  codeSnippet: string;
}

export const SIGNAL_STORE_TOPICS: SignalStoreTopicConfig[] = [
  {
    slug: 'lifecycle-hooks',
    title: 'Lifecycle Hooks',
    summary:
      'The withHooks feature enables executing lifecycle logic when the store is initialized (onInit) or destroyed (onDestroy).',
    icon: 'autorenew',
    status: 'Next Up',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store/lifecycle-hooks',
    codeSnippet: `import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods((store) => ({
    increment(): void {
      patchState(store, (state) => ({ count: state.count + 1 }));
    },
  })),
  withHooks({
    onInit(store) {
      // Increment the count every 2 seconds
      interval(2000)
        .pipe(takeUntilDestroyed())
        .subscribe(() => store.increment());
    },
    onDestroy(store) {
      console.log('CounterStore destroyed with count:', store.count());
    },
  })
);`,
  },
  {
    slug: 'custom-properties',
    title: 'Custom Store Properties',
    summary:
      'The withProps feature adds custom, non-signal properties or services to the SignalStore instance.',
    icon: 'settings_suggest',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store/custom-store-properties',
    codeSnippet: `import { signalStore, withState, withProps } from '@ngrx/signals';

export const BooksStore = signalStore(
  withState({ books: [] }),
  withProps(() => ({
    storageKey: 'ngrx_books_cache_v1',
  }))
);`,
  },
  {
    slug: 'linked-state',
    title: 'Linked State',
    summary:
      'Manage dependent or derived reactive state that responds to source signal changes.',
    icon: 'link',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store',
    codeSnippet: `// Synchronizing dynamic state with reactive dependencies
export const PaginationStore = signalStore(
  withState({ page: 1, pageSize: 10, total: 100 }),
  withComputed(({ page, pageSize, total }) => ({
    totalPages: computed(() => Math.ceil(total() / pageSize())),
    hasNext: computed(() => page() < Math.ceil(total() / pageSize())),
  }))
);`,
  },
  {
    slug: 'state-tracking',
    title: 'State Tracking',
    summary:
      'Monitor state changes and inspect store mutations in real-time.',
    icon: 'timeline',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store',
    codeSnippet: `export const TrackedStore = signalStore(
  withState(initialState),
  withHooks({
    onInit(store) {
      // Monitor store state transitions & action logs
    },
  })
);`,
  },
  {
    slug: 'private-members',
    title: 'Private Store Members',
    summary:
      'Encapsulate internal helper functions and implementation details inside store closures.',
    icon: 'lock',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store',
    codeSnippet: `export const UserStore = signalStore(
  withState({ user: null }),
  withMethods((store) => {
    // Private helper hidden from external callers
    function isValid(user: unknown): boolean {
      return Boolean(user);
    }

    return {
      setUser(user: any) {
        if (isValid(user)) patchState(store, { user });
      }
    };
  })
);`,
  },
  {
    slug: 'custom-features',
    title: 'Custom Store Features',
    summary:
      'Build reusable, modular extensions using signalStoreFeature to share common store behaviors across your application.',
    icon: 'extension',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store/custom-store-features',
    codeSnippet: `import { signalStoreFeature, withState, withComputed } from '@ngrx/signals';

export function withCallState() {
  return signalStoreFeature(
    withState<{ callState: 'init' | 'loading' | 'loaded' | { error: string } }>({
      callState: 'init',
    }),
    withComputed(({ callState }) => ({
      loading: computed(() => callState() === 'loading'),
      loaded: computed(() => callState() === 'loaded'),
      error: computed(() => typeof callState() === 'object' ? callState().error : null),
    }))
  );
}`,
  },
  {
    slug: 'entity-management',
    title: 'Entity Management',
    summary:
      'Perform high-performance normalized entity collections using @ngrx/signals/entities with withEntities.',
    icon: 'view_list',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store/entity-management',
    codeSnippet: `import { signalStore, withMethods, patchState } from '@ngrx/signals';
import { withEntities, addEntity, removeEntity } from '@ngrx/signals/entities';

export const ProductsStore = signalStore(
  withEntities<Product>(),
  withMethods((store) => ({
    addProduct(product: Product): void {
      patchState(store, addEntity(product));
    },
    removeProduct(id: number): void {
      patchState(store, removeEntity(id));
    },
  }))
);`,
  },
  {
    slug: 'events',
    title: 'Events',
    summary:
      'Event-driven communication and cross-store coordination patterns.',
    icon: 'bolt',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store',
    codeSnippet: `// Event-driven reactive store architecture`,
  },
  {
    slug: 'testing',
    title: 'Testing SignalStore',
    summary:
      'Best practices for unit testing SignalStore state, computed values, and async methods with Vitest and Angular TestBed.',
    icon: 'fact_check',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/signal-store',
    codeSnippet: `describe('BookSearchStore', () => {
  it('loads books and updates reactive signals', async () => {
    TestBed.configureTestingModule({ providers: [BookSearchStore] });
    const store = TestBed.inject(BookSearchStore);

    await store.loadAll();
    expect(store.booksCount()).toBeGreaterThan(0);
  });
});`,
  },
  {
    slug: 'deep-computed',
    title: 'DeepComputed',
    summary:
      'DeepComputed allows nested object signal properties to be accessed and tracked with fine-grained reactivity.',
    icon: 'account_tree',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals',
    codeSnippet: `// Access nested computed properties without recomputing untouched branches`,
  },
  {
    slug: 'signal-method',
    title: 'SignalMethod',
    summary:
      'Parameterized methods that reactively accept signals, values, or observables as input arguments.',
    icon: 'functions',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals',
    codeSnippet: `// SignalMethod reactive invocation pattern`,
  },
  {
    slug: 'rxjs-integration',
    title: 'RxJS Integration',
    summary:
      'Seamlessly connect RxJS operators (debounceTime, switchMap, tapResponse) to Signals using rxMethod.',
    icon: 'sync_alt',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals/rxjs-integration',
    codeSnippet: `loadByQuery: rxMethod<string>(
  pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((query) => booksService.getByQuery(query))
  )
);`,
  },
  {
    slug: 'resource-extensions',
    title: 'Resource Extensions',
    summary:
      'Integrate Angular v19+ httpResource and resource primitives natively with SignalStore state.',
    icon: 'cloud_sync',
    status: 'Upcoming',
    docsUrl: 'https://ngrx.io/guide/signals',
    codeSnippet: `// Angular httpResource and Resource integration with SignalStore`,
  },
];
