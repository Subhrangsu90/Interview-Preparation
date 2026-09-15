import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface NavItem {
  label: string;
  icon?: string;
  route?: string | any[];
  badge?: string;
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

  // Expanded groups: Signal Store open by default
  readonly expandedGroups = signal<Set<string>>(new Set(['Signal Store']));

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

