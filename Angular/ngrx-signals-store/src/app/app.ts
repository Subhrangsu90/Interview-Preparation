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
