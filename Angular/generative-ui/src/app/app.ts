import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Header } from '@shared/components/header/header';
import { Sidenav } from '@shared/components/sidenav/sidenav';
import { UiLoadingSpinner } from '@shared/ui/components/loading-spinner';
import { ThemeService } from '@shared/ui/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Sidenav, UiLoadingSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Eagerly instantiate ThemeService to apply saved dark/light mode & font size
  protected readonly themeService = inject(ThemeService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly title = signal('generative-ui');
  protected readonly isMobile = signal(false);
  protected readonly sidenavOpened = signal(true);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe((result) => {
      const mobile = result.matches;
      this.isMobile.set(mobile);
      this.sidenavOpened.set(!mobile);
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened.update((open) => !open);
  }

  closeSidenavOnMobile(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }
}
