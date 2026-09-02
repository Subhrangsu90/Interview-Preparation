import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders').then((m) => m.OrdersComponent),
  },
  {
    path: 'orders/:orderNumber',
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail').then((m) => m.OrderDetailComponent),
  },
  {
    path: 'support',
    loadComponent: () => import('./features/support/support').then((m) => m.SupportComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events').then((m) => m.EventsComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat').then((m) => m.ChatComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings').then((m) => m.SettingsComponent),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
