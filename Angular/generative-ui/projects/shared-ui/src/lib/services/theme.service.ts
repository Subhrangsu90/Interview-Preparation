import { Injectable, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';
export type BaseFontSize = 14 | 16 | 18;

const THEME_STORAGE_KEY = 'app_theme_mode';
const BASE_SIZE_STORAGE_KEY = 'app_base_font_size';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<ThemeMode>('light');
  readonly baseSize = signal<BaseFontSize>(16);

  constructor() {
    if (this.isBrowser) {
      this.initFromStorage();
    }

    // Reactively synchronize theme changes to the DOM
    effect(() => {
      const currentTheme = this.theme();
      const currentSize = this.baseSize();

      if (this.isBrowser) {
        // Toggle dark-theme class on root html element
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
        }

        // Apply base font size CSS variable
        document.documentElement.style.setProperty('--app-base-font-size', `${currentSize}px`);
      }
    });
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    if (this.isBrowser) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // Fallback gracefully if storage is disabled
      }
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setBaseSize(size: BaseFontSize): void {
    this.baseSize.set(size);
    if (this.isBrowser) {
      try {
        localStorage.setItem(BASE_SIZE_STORAGE_KEY, size.toString());
      } catch {
        // Fallback gracefully
      }
    }
  }

  private initFromStorage(): void {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.theme.set(savedTheme);
      } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        this.theme.set('dark');
      }

      const savedSize = localStorage.getItem(BASE_SIZE_STORAGE_KEY);
      if (savedSize) {
        const parsed = parseInt(savedSize, 10);
        if (parsed === 14 || parsed === 16 || parsed === 18) {
          this.baseSize.set(parsed as BaseFontSize);
        }
      }
    } catch {
      // Ignored if storage is blocked
    }
  }
}

export { ThemeService as UiThemeService };
