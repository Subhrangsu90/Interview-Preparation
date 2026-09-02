import { Injectable, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';
export type BaseFontSize = 14 | 16 | 18;
export type ColorPaletteId = 'cyan' | 'azure' | 'violet' | 'green' | 'rose' | 'blue';

export interface ThemePaletteOption {
  readonly id: ColorPaletteId;
  readonly name: string;
  readonly description: string;
  readonly primaryColor: string;
  readonly tertiaryColor: string;
  readonly className: string;
}

export const PALETTE_OPTIONS: readonly ThemePaletteOption[] = [
  {
    id: 'cyan',
    name: 'Cyan Tech',
    description: 'Modern cyan with energetic orange accents (Default)',
    primaryColor: '#006877',
    tertiaryColor: '#8a5100',
    className: '',
  },
  {
    id: 'azure',
    name: 'Azure Ocean',
    description: 'Deep oceanic azure with vibrant rose accents',
    primaryColor: '#00629e',
    tertiaryColor: '#9c2a66',
    className: 'theme-azure',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    description: 'Majestic royal violet with warm amber accents',
    primaryColor: '#6e4ea1',
    tertiaryColor: '#845400',
    className: 'theme-violet',
  },
  {
    id: 'green',
    name: 'Emerald Forest',
    description: 'Vibrant emerald green with chartreuse highlights',
    primaryColor: '#006d39',
    tertiaryColor: '#536500',
    className: 'theme-green',
  },
  {
    id: 'rose',
    name: 'Sunset Rose',
    description: 'Warm, sophisticated rose with rich magenta tones',
    primaryColor: '#9e2b55',
    tertiaryColor: '#93288a',
    className: 'theme-rose',
  },
  {
    id: 'blue',
    name: 'Cobalt Sky',
    description: 'Classic cobalt blue with crisp golden accents',
    primaryColor: '#005ebd',
    tertiaryColor: '#6f5d00',
    className: 'theme-blue',
  },
];

const ALL_PALETTE_CLASSES = PALETTE_OPTIONS.map((p) => p.className).filter(Boolean);
const THEME_STORAGE_KEY = 'app_theme_mode';
const PALETTE_STORAGE_KEY = 'app_color_palette';
const BASE_SIZE_STORAGE_KEY = 'app_base_font_size';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly paletteOptions = PALETTE_OPTIONS;
  readonly theme = signal<ThemeMode>('light');
  readonly colorPalette = signal<ColorPaletteId>('cyan');
  readonly baseSize = signal<BaseFontSize>(16);

  constructor() {
    if (this.isBrowser) {
      this.initFromStorage();
    }

    // Reactively synchronize theme mode, color palette, and font scale to the DOM
    effect(() => {
      const currentTheme = this.theme();
      const currentPalette = this.colorPalette();
      const currentSize = this.baseSize();

      if (this.isBrowser) {
        const root = document.documentElement;

        // 1. Synchronize dark/light mode class
        if (currentTheme === 'dark') {
          root.classList.add('dark-theme');
        } else {
          root.classList.remove('dark-theme');
        }

        // 2. Synchronize color palette classes
        for (const cls of ALL_PALETTE_CLASSES) {
          root.classList.remove(cls);
        }
        const activeOption = PALETTE_OPTIONS.find((p) => p.id === currentPalette);
        if (activeOption?.className) {
          root.classList.add(activeOption.className);
        }

        // 3. Apply base font size CSS variable
        root.style.setProperty('--app-base-font-size', `${currentSize}px`);
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

  setPalette(palette: ColorPaletteId): void {
    this.colorPalette.set(palette);
    if (this.isBrowser) {
      try {
        localStorage.setItem(PALETTE_STORAGE_KEY, palette);
      } catch {
        // Fallback gracefully
      }
    }
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

      const savedPalette = localStorage.getItem(PALETTE_STORAGE_KEY) as ColorPaletteId | null;
      if (savedPalette && PALETTE_OPTIONS.some((p) => p.id === savedPalette)) {
        this.colorPalette.set(savedPalette);
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
