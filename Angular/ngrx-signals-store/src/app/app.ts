import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly title = signal('NgRx SignalStore');
  readonly isSidenavOpened = signal(true);

  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    { label: 'Signal Stores', icon: 'storage', route: '/stores' },
    { label: 'State History', icon: 'history', route: '/history' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ]);

  toggleSidenav(): void {
    this.isSidenavOpened.update((opened) => !opened);
  }
}
