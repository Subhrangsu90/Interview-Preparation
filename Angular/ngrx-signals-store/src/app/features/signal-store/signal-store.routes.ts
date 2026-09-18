import { Routes } from '@angular/router';

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
];

