import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Header } from './layout/header/header';
import { Sidenav, NavItem } from './layout/sidenav/sidenav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Sidenav],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly title = signal('NgRx SignalStore Guide');
  readonly isSidenavOpened = signal(true);

  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    { label: 'GUIDE', isSectionHeader: true },
    {
      label: 'Store',
      children: [
        { label: 'Overview', route: '/signal-store/overview' },
      ],
    },
    {
      label: 'Effects',
      children: [
        { label: 'Overview', route: '/signal-store/overview' },
      ],
    },
    {
      label: 'Signals',
      children: [
        {
          label: 'Overview',
          route: '/signal-store/overview',
        },
        {
          label: 'SignalStore',
          children: [
            {
              label: 'Core Concepts',
              badge: 'Done',
              badgeType: 'done',
              route: '/signal-store/core-concepts',
            },
            {
              label: 'Lifecycle Hooks',
              badge: 'Next',
              badgeType: 'next',
              route: '/signal-store/lifecycle-hooks',
            },
            {
              label: 'Custom Store Properties',
              route: '/signal-store/custom-properties',
            },
            {
              label: 'Linked State',
              route: '/signal-store/linked-state',
            },
            {
              label: 'State Tracking',
              route: '/signal-store/state-tracking',
            },
            {
              label: 'Private Store Members',
              route: '/signal-store/private-members',
            },
            {
              label: 'Custom Store Features',
              route: '/signal-store/custom-features',
            },
            {
              label: 'Entity Management',
              route: '/signal-store/entity-management',
            },
            {
              label: 'Events',
              route: '/signal-store/events',
            },
            {
              label: 'Testing',
              route: '/signal-store/testing',
            },
          ],
        },
        {
          label: 'SignalState',
          route: '/signal-state',
        },
        {
          label: 'DeepComputed',
          route: '/signal-store/deep-computed',
        },
        {
          label: 'SignalMethod',
          route: '/signal-store/signal-method',
        },
        {
          label: 'RxJS Integration',
          route: '/signal-store/rxjs-integration',
        },
        {
          label: 'Resource Extensions',
          route: '/signal-store/resource-extensions',
        },
      ],
    },
  ]);

  toggleSidenav(): void {
    this.isSidenavOpened.update((opened) => !opened);
  }
}
