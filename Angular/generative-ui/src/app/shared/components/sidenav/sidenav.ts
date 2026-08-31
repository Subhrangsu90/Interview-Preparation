import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface NavItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
}

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {
  protected readonly mainNavItems: readonly NavItem[] = [
    { label: 'Dashboard', route: '/home', icon: 'dashboard' },
    { label: 'Generative Studio', route: '/home', icon: 'auto_awesome' },
    { label: 'Components', route: '/home', icon: 'widgets' },
    { label: 'Analytics', route: '/home', icon: 'bar_chart' },
  ];

  protected readonly secondaryNavItems: readonly NavItem[] = [
    { label: 'Settings', route: '/home', icon: 'settings' },
    { label: 'Help & Docs', route: '/home', icon: 'help_outline' },
  ];
}
