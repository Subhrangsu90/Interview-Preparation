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
    { label: 'Orders', route: '/orders', icon: 'receipt_long' },
    { label: 'Support & Returns', route: '/support', icon: 'support_agent' },
    { label: 'Dashboard', route: '/home', icon: 'dashboard' },
  ];

  protected readonly secondaryNavItems: readonly NavItem[] = [
    { label: 'Live Events', route: '/events', icon: 'stream' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
    { label: 'Help & Docs', route: '/help', icon: 'help_outline' },
  ];
}
