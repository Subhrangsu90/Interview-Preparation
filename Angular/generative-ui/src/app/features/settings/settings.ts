import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UiPageHeader } from '@shared/ui/components/page-header';
import { EventBusService } from '@event-bus/services';
import { TelemetryEvents } from '@event-bus/models';
import { ThemeService, ThemeMode, BaseFontSize } from '@shared/ui/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    UiPageHeader,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly eventBus = inject(EventBusService, { optional: true });

  readonly fontSizeOptions: readonly { label: string; size: BaseFontSize; hint: string }[] = [
    { label: 'Compact', size: 14, hint: '14px - Higher information density' },
    { label: 'Default', size: 16, hint: '16px - Standard balanced readability' },
    { label: 'Comfortable', size: 18, hint: '18px - Larger text and touch targets' },
  ];

  selectTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.eventBus?.emit({
      source: 'component',
      category: 'action',
      name: TelemetryEvents.THEME_CHANGED,
      payload: { theme: mode },
    });
  }

  selectBaseSize(size: BaseFontSize): void {
    this.themeService.setBaseSize(size);
    this.eventBus?.emit({
      source: 'component',
      category: 'action',
      name: TelemetryEvents.BASE_FONT_SIZE_CHANGED,
      payload: { baseSize: size },
    });
  }

  resetToDefaults(): void {
    this.selectTheme('light');
    this.selectBaseSize(16);
  }
}
