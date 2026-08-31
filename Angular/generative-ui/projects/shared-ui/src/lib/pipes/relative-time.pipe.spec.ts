import { describe, it, expect } from 'vitest';
import { UiRelativeTimePipe } from './relative-time.pipe';

describe('UiRelativeTimePipe', () => {
  const pipe = new UiRelativeTimePipe();

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return "just now" for dates within 60 seconds', () => {
    const date = new Date(Date.now() - 10 * 1000);
    expect(pipe.transform(date)).toBe('just now');
  });

  it('should return minutes ago for dates within an hour', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(pipe.transform(date)).toBe('5m ago');
  });

  it('should return hours ago for dates within 24 hours', () => {
    const date = new Date(Date.now() - 3 * 3600 * 1000);
    expect(pipe.transform(date)).toBe('3h ago');
  });
});
