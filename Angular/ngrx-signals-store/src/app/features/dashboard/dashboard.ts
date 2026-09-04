import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LoggerService } from 'logger';
import { environment } from '@env/environment';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly logger = inject(LoggerService);

  readonly isProduction = environment.production;
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.logger.info(
      'Dashboard',
      `Dashboard component loaded in ${this.isProduction ? 'production' : 'development'} mode`
    );
  }
}
