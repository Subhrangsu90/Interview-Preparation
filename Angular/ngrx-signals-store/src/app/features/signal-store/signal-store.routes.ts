import { Routes } from '@angular/router';
import { SIGNAL_STORE_TOPICS } from './signal-store.config';

export const SIGNAL_STORE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./overview/signal-store-overview').then((m) => m.SignalStoreOverview),
  },
  {
    path: 'core-concepts',
    loadComponent: () =>
      import('./book-search/book-search').then((m) => m.BookSearch),
  },
  {
    path: 'book-search',
    redirectTo: 'core-concepts',
    pathMatch: 'full',
  },
  ...SIGNAL_STORE_TOPICS.map((topic) => ({
    path: topic.slug,
    loadComponent: () =>
      import('./components/topic-placeholder/topic-placeholder').then(
        (m) => m.TopicPlaceholder
      ),
    data: topic,
  })),
];
