import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
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

  protected readonly title = signal('generative-ui');
  protected readonly sidenavOpened = signal(true);

  toggleSidenav(): void {
    this.sidenavOpened.update((open) => !open);
  }
}
