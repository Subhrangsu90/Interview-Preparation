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
    loadChildren: () =>
      import('./features/signal-store/signal-store.routes').then(
        (m) => m.SIGNAL_STORE_ROUTES
      ),
  },
  {
    path: 'signal-state',
    loadComponent: () =>
      import('./features/signal-state/signal-state').then(
        (m) => m.SignalState
      ),
  },
];
