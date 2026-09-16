import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'signal-store',
    loadComponent: () =>
      import('./features/signal-store/signal-store').then((m) => m.SignalStore),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '(signal-store:overview)',
      },
      {
        path: 'overview',
        outlet: 'signal-store',
        loadComponent: () =>
          import(
            './features/signal-store/overview/signal-store-overview'
          ).then((m) => m.SignalStoreOverview),
      },
      {
        path: 'book-search',
        outlet: 'signal-store',
        loadComponent: () =>
          import('./features/signal-store/book-search/book-search').then(
            (m) => m.BookSearch
          ),
      },
    ],
  },
  {
    path: 'signal-state',
    loadComponent: () =>
      import('./features/signal-state/signal-state').then(
        (m) => m.SignalState
      ),
  },
];
