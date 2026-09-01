import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'orders',
    renderMode: RenderMode.Server,
  },
  {
    path: 'orders/:orderNumber',
    renderMode: RenderMode.Server,
  },
  {
    path: 'support',
    renderMode: RenderMode.Server,
  },
  {
    path: 'chat',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
