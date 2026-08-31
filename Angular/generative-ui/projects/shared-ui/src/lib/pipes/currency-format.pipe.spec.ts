import { describe, it, expect } from 'vitest';
import { UiCurrencyPipe } from './currency-format.pipe';

describe('UiCurrencyPipe', () => {
  const pipe = new UiCurrencyPipe();

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format numbers with standard currency symbol', () => {
    const formatted = pipe.transform(1234.5);
    expect(formatted).toContain('1,234.50');
  });

  it('should format string numbers', () => {
    const formatted = pipe.transform('99.99');
    expect(formatted).toContain('99.99');
  });
});
