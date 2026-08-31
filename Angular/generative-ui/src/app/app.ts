import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Header } from './shared/components/header/header';
import { Sidenav } from './shared/components/sidenav/sidenav';
import { UiLoadingSpinner } from '@shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Sidenav, UiLoadingSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('generative-ui');
  protected readonly sidenavOpened = signal(true);

  toggleSidenav(): void {
    this.sidenavOpened.update((open) => !open);
  }
}
