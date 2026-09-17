import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface NavItem {
  label: string;
  icon?: string;
  route?: string | any[];
  badge?: string;
  badgeType?: 'done' | 'next' | 'soon' | 'default';
  isSectionHeader?: boolean;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatRippleModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {
  readonly navItems = input<NavItem[]>([]);

  // Expanded groups: Signals and SignalStore open by default to match docs
  readonly expandedGroups = signal<Set<string>>(
    new Set(['Signals', 'Signal Store', 'SignalStore'])
  );

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  toggleGroup(label: string): void {
    this.expandedGroups.update((groups) => {
      const next = new Set(groups);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }
}

